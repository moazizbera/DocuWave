using DocuWave.Application.Common;
using DocuWave.Application.DTOs;
using DocuWave.Application.Interfaces;
using DocuWave.Domain.Entities;
using DocuWave.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using System.Linq;

namespace DocuWave.Infrastructure.Services;

public sealed class AnnotationService : IAnnotationService
{
    private readonly AppDbContext _dbContext;
    private readonly ITenantProvider _tenantProvider;

    public AnnotationService(AppDbContext dbContext, ITenantProvider tenantProvider)
    {
        _dbContext = dbContext;
        _tenantProvider = tenantProvider;
    }

    public async Task<AnnotationDto> CreateAsync(Guid documentId, AnnotationRequest request, CancellationToken cancellationToken)
    {
        var tenantId = _tenantProvider.GetTenantId();
        var annotation = new Annotation
        {
            Id = Guid.NewGuid(),
            DocumentId = documentId,
            TenantId = tenantId,
            Type = request.Type,
            Rect = request.Rect,
            Text = request.Text,
            Version = request.Version,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = "api"
        };

        await _dbContext.Annotations.AddAsync(annotation, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return new AnnotationDto(annotation.Id, annotation.Type, annotation.Rect, annotation.Text, annotation.CreatedBy, annotation.CreatedAt, annotation.Version);
    }

    public async Task DeleteAsync(Guid documentId, Guid annotationId, CancellationToken cancellationToken)
    {
        var tenantId = _tenantProvider.GetTenantId();
        var annotation = await _dbContext.Annotations.FirstOrDefaultAsync(x => x.Id == annotationId && x.DocumentId == documentId && x.TenantId == tenantId, cancellationToken);
        if (annotation is null)
        {
            throw new KeyNotFoundException("Annotation not found");
        }

        _dbContext.Annotations.Remove(annotation);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task<PagedResult<AnnotationDto>> GetAsync(Guid documentId, int page, int pageSize, CancellationToken cancellationToken)
    {
        var tenantId = _tenantProvider.GetTenantId();
        var query = _dbContext.Annotations.AsNoTracking().Where(x => x.DocumentId == documentId && x.TenantId == tenantId);
        var total = await query.CountAsync(cancellationToken);
        var items = await query
            .OrderByDescending(x => x.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(x => new AnnotationDto(x.Id, x.Type, x.Rect, x.Text, x.CreatedBy, x.CreatedAt, x.Version))
            .ToListAsync(cancellationToken);

        return new PagedResult<AnnotationDto>
        {
            Items = items,
            Total = total,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task UpdateAsync(Guid documentId, Guid annotationId, AnnotationRequest request, CancellationToken cancellationToken)
    {
        var tenantId = _tenantProvider.GetTenantId();
        var annotation = await _dbContext.Annotations.FirstOrDefaultAsync(x => x.Id == annotationId && x.DocumentId == documentId && x.TenantId == tenantId, cancellationToken);
        if (annotation is null)
        {
            throw new KeyNotFoundException("Annotation not found");
        }

        annotation.Type = request.Type;
        annotation.Rect = request.Rect;
        annotation.Text = request.Text;
        annotation.Version = request.Version;
        annotation.UpdatedAt = DateTime.UtcNow;
        annotation.UpdatedBy = "api";

        await _dbContext.SaveChangesAsync(cancellationToken);
    }
}
