using DocuWave.Application.Common;
using DocuWave.Application.DTOs;
using DocuWave.Application.Interfaces;
using DocuWave.Application.Requests;
using Microsoft.AspNetCore.Http;
using DocuWave.Domain.Entities;
using DocuWave.Infrastructure.Persistence;
using Hangfire;
using Microsoft.EntityFrameworkCore;
using System.IO;
using System.Threading.Tasks;

namespace DocuWave.Infrastructure.Services;

public sealed class DocumentService : IDocumentService
{
    private readonly AppDbContext _dbContext;
    private readonly ITenantProvider _tenantProvider;
    private readonly IBlobStorageService _blobStorage;
    private readonly IDocumentHubDispatcher _documentHub;
    private readonly IBackgroundJobClient _backgroundJobClient;

    public DocumentService(
        AppDbContext dbContext,
        ITenantProvider tenantProvider,
        IBlobStorageService blobStorage,
        IDocumentHubDispatcher documentHub,
        IBackgroundJobClient backgroundJobClient)
    {
        _dbContext = dbContext;
        _tenantProvider = tenantProvider;
        _blobStorage = blobStorage;
        _documentHub = documentHub;
        _backgroundJobClient = backgroundJobClient;
    }

    public async Task<BulkJobResponse> BulkAsync(DocumentBulkRequest request, CancellationToken cancellationToken)
    {
        var tenantId = _tenantProvider.GetTenantId();
        var jobId = Guid.NewGuid();
        _backgroundJobClient.Enqueue(() => ProcessBulkOperationBackgroundAsync(tenantId, jobId, request.Action, request.Ids.ToArray(), CancellationToken.None));
        return new BulkJobResponse(jobId);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken)
    {
        var tenantId = _tenantProvider.GetTenantId();
        var document = await _dbContext.Documents.FirstOrDefaultAsync(x => x.Id == id && x.TenantId == tenantId, cancellationToken);
        if (document is null)
        {
            throw new KeyNotFoundException("Document not found");
        }

        await _blobStorage.DeleteAsync(tenantId, document.BlobKey, cancellationToken);
        _dbContext.Documents.Remove(document);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task<DocumentDetailDto> GetAsync(Guid id, CancellationToken cancellationToken)
    {
        var tenantId = _tenantProvider.GetTenantId();
        var document = await _dbContext.Documents
            .Include(x => x.Tags)
            .Include(x => x.AuditTrail)
            .Include(x => x.Ai.Fields)
            .FirstOrDefaultAsync(x => x.Id == id && x.TenantId == tenantId, cancellationToken);

        if (document is null)
        {
            throw new KeyNotFoundException("Document not found");
        }

        return MapToDetail(document);
    }

    public async Task<PagedResult<DocumentListItemDto>> QueryAsync(DocumentQuery query, CancellationToken cancellationToken)
    {
        var tenantId = _tenantProvider.GetTenantId();
        var documents = _dbContext.Documents.AsNoTracking().Where(x => x.TenantId == tenantId);

        if (!string.IsNullOrWhiteSpace(query.Status))
        {
            documents = documents.Where(x => x.Status == query.Status);
        }
        if (query.SchemeId.HasValue)
        {
            documents = documents.Where(x => x.SchemeId == query.SchemeId.Value);
        }
        if (!string.IsNullOrWhiteSpace(query.Q))
        {
            documents = documents.Where(x => x.Filename.Contains(query.Q));
        }
        if (query.From.HasValue)
        {
            documents = documents.Where(x => x.UploadedAt >= query.From.Value);
        }
        if (query.To.HasValue)
        {
            documents = documents.Where(x => x.UploadedAt <= query.To.Value);
        }

        var total = await documents.CountAsync(cancellationToken);
        var items = await documents
            .OrderByDescending(x => x.UploadedAt)
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .Select(x => new DocumentListItemDto(x.Id, x.Filename, x.SchemeId, x.Status, x.SizeBytes, x.UploadedBy, x.UploadedAt, x.Confidence))
            .ToListAsync(cancellationToken);

        return new PagedResult<DocumentListItemDto>
        {
            Items = items,
            Total = total,
            Page = query.Page,
            PageSize = query.PageSize
        };
    }

    public async Task<UploadResponse> UploadAsync(DocumentUploadRequest request, CancellationToken cancellationToken)
    {
        var tenantId = _tenantProvider.GetTenantId();
        var batchId = Guid.NewGuid();
        var accepted = 0;
        var rejected = new List<string>();
        var total = request.Files?.Count ?? 0;
        var processed = 0;
        var documentQueue = new List<(string TenantId, Guid DocumentId)>();

        if (request.Files is null || request.Files.Count == 0)
        {
            return new UploadResponse(batchId, 0, Array.Empty<string>());
        }

        foreach (var file in request.Files)
        {
            try
            {
                var blobKey = await _blobStorage.SaveAsync(tenantId, file, cancellationToken);
                var document = new Document
                {
                    Id = Guid.NewGuid(),
                    TenantId = tenantId,
                    SchemeId = request.SchemeId,
                    Filename = file.FileName,
                    MimeType = file.ContentType,
                    SizeBytes = file.Length,
                    Status = "processing",
                    UploadedAt = DateTime.UtcNow,
                    UploadedBy = "api",
                    BlobKey = blobKey,
                    CreatedAt = DateTime.UtcNow,
                    CreatedBy = "api"
                };

                await _dbContext.Documents.AddAsync(document, cancellationToken);
                accepted++;
                documentQueue.Add((tenantId, document.Id));
            }
            catch (Exception ex)
            {
                rejected.Add(ex.Message);
            }

            processed++;
            await _documentHub.PublishUploadProgressAsync(batchId, processed, total, cancellationToken);
        }

        await _dbContext.SaveChangesAsync(cancellationToken);

        foreach (var item in documentQueue)
        {
            _backgroundJobClient.Enqueue(() => PerformOcrAndAiAsync(item.TenantId, item.DocumentId, CancellationToken.None));
        }
        await _documentHub.PublishUploadCompletedAsync(batchId, accepted, rejected.Count, cancellationToken);
        return new UploadResponse(batchId, accepted, rejected);
    }

    private DocumentDetailDto MapToDetail(Document document)
    {
        var tags = document.Tags.Select(x => x.Name).ToArray();
        var audit = document.AuditTrail.Select(x => new DocumentAuditEntryDto(x.Action, x.Actor, x.OccurredAt, x.Notes)).ToArray();
        var ai = new DocumentAiDto(
            document.Ai.Fields.Select(x => new DocumentAiFieldDto(x.Key, x.Value, x.Confidence)).ToArray(),
            document.Ai.Errors.Count == 0 ? Array.Empty<string>() : document.Ai.Errors.ToArray());

        return new DocumentDetailDto(
            document.Id,
            document.Filename,
            document.MimeType,
            document.SizeBytes,
            document.SchemeId,
            document.Status,
            tags,
            audit,
            document.WorkflowInstanceId,
            ai);
    }

    public async Task ProcessBulkOperationBackgroundAsync(string tenantId, Guid jobId, string action, Guid[] ids, CancellationToken cancellationToken)
    {
        TenantContext.SetTenant(tenantId);
        var documents = await _dbContext.Documents
            .Where(x => ids.Contains(x.Id) && x.TenantId == tenantId)
            .ToListAsync(cancellationToken);

        var processed = 0;
        var total = documents.Count;

        foreach (var document in documents)
        {
            if (action.Equals("delete", StringComparison.OrdinalIgnoreCase))
            {
                await _blobStorage.DeleteAsync(tenantId, document.BlobKey, cancellationToken);
                _dbContext.Documents.Remove(document);
            }
            else if (action.Equals("export", StringComparison.OrdinalIgnoreCase))
            {
                document.Status = "exporting";
            }

            processed++;
            await _documentHub.PublishBulkProgressAsync(jobId, total == 0 ? 100 : (int)(processed / (double)total * 100), action, cancellationToken);
        }

        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task PerformOcrAndAiAsync(string tenantId, Guid documentId, CancellationToken cancellationToken)
    {
        TenantContext.SetTenant(tenantId);
        var document = await _dbContext.Documents.FirstOrDefaultAsync(x => x.Id == documentId && x.TenantId == tenantId, cancellationToken);
        if (document is null)
        {
            return;
        }

        await Task.Delay(TimeSpan.FromSeconds(1), cancellationToken);
        document.Status = "completed";
        document.Confidence = Math.Round(Random.Shared.NextDouble(), 2);
        document.Ai.Fields = new List<DocumentAiField>
        {
            new()
            {
                Id = Guid.NewGuid(),
                DocumentId = document.Id,
                Key = "InvoiceNumber",
                Value = $"INV-{Random.Shared.Next(1000,9999)}",
                Confidence = Math.Round(Random.Shared.NextDouble(), 2)
            }
        };
        document.Ai.Errors = new List<string>();

        await _dbContext.SaveChangesAsync(cancellationToken);
        await _documentHub.PublishExtractionUpdateAsync(document.Id, document.Status, document.Confidence, cancellationToken);
    }

    public async Task<(Stream Stream, string MimeType, string FileName)> GetContentAsync(Guid id, string? rendition, CancellationToken cancellationToken)
    {
        var tenantId = _tenantProvider.GetTenantId();
        var document = await _dbContext.Documents.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id && x.TenantId == tenantId, cancellationToken);
        if (document is null)
        {
            throw new KeyNotFoundException("Document not found");
        }

        var blob = await _blobStorage.GetAsync(tenantId, document.BlobKey, cancellationToken);
        var mime = rendition == "image" ? "image/png" : document.MimeType;
        return (blob, mime, document.Filename);
    }
}
