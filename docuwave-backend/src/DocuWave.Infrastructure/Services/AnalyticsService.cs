using DocuWave.Application.DTOs;
using DocuWave.Application.Interfaces;
using DocuWave.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using System.Linq;

namespace DocuWave.Infrastructure.Services;

public sealed class AnalyticsService : IAnalyticsService
{
    private readonly AppDbContext _dbContext;
    private readonly ITenantProvider _tenantProvider;
    private readonly IAnalyticsHubDispatcher _hubDispatcher;

    public AnalyticsService(AppDbContext dbContext, ITenantProvider tenantProvider, IAnalyticsHubDispatcher hubDispatcher)
    {
        _dbContext = dbContext;
        _tenantProvider = tenantProvider;
        _hubDispatcher = hubDispatcher;
    }

    public async Task<AnalyticsExportResponse> ExportAsync(AnalyticsExportRequest request, CancellationToken cancellationToken)
    {
        var jobId = Guid.NewGuid();
        await Task.Delay(100, cancellationToken);
        var downloadUrl = $"https://download.local/{jobId}.csv";
        await _hubDispatcher.PublishExportReadyAsync(jobId, downloadUrl, cancellationToken);
        return new AnalyticsExportResponse(jobId);
    }

    public async Task<DocumentAnalyticsDto> GetDocumentAnalyticsAsync(DateTime? from, DateTime? to, Guid? schemeId, CancellationToken cancellationToken)
    {
        var tenantId = _tenantProvider.GetTenantId();
        var query = _dbContext.Documents.AsNoTracking().Where(x => x.TenantId == tenantId);
        if (schemeId.HasValue)
        {
            query = query.Where(x => x.SchemeId == schemeId.Value);
        }
        if (from.HasValue)
        {
            query = query.Where(x => x.UploadedAt >= from.Value);
        }
        if (to.HasValue)
        {
            query = query.Where(x => x.UploadedAt <= to.Value);
        }

        var grouped = await query
            .GroupBy(x => x.Status)
            .Select(g => new { g.Key, Count = g.Count() })
            .ToListAsync(cancellationToken);

        var totals = new DocumentAnalyticsTotals(
            grouped.FirstOrDefault(x => x.Key == "completed")?.Count ?? 0,
            grouped.FirstOrDefault(x => x.Key == "processing")?.Count ?? 0,
            grouped.FirstOrDefault(x => x.Key == "rejected")?.Count ?? 0);

        var series = await query
            .GroupBy(x => x.UploadedAt.Date)
            .Select(g => new AnalyticsSeriesPoint(g.Key, g.Count()))
            .ToListAsync(cancellationToken);

        return new DocumentAnalyticsDto(series, totals);
    }

    public async Task<UserAnalyticsDto> GetUserAnalyticsAsync(DateTime? from, DateTime? to, CancellationToken cancellationToken)
    {
        var tenantId = _tenantProvider.GetTenantId();
        var query = _dbContext.Documents.AsNoTracking().Where(x => x.TenantId == tenantId);
        if (from.HasValue)
        {
            query = query.Where(x => x.UploadedAt >= from.Value);
        }
        if (to.HasValue)
        {
            query = query.Where(x => x.UploadedAt <= to.Value);
        }

        var series = await query
            .GroupBy(x => x.UploadedBy)
            .Select(g => new AnalyticsSeriesPoint(DateTime.UtcNow, g.Count()))
            .ToListAsync(cancellationToken);

        return new UserAnalyticsDto(series);
    }

    public async Task<WorkflowAnalyticsDto> GetWorkflowAnalyticsAsync(DateTime? from, DateTime? to, CancellationToken cancellationToken)
    {
        var tenantId = _tenantProvider.GetTenantId();
        var query = _dbContext.WorkflowInstances.AsNoTracking().Where(x => x.TenantId == tenantId);
        if (from.HasValue)
        {
            query = query.Where(x => x.StartedAt >= from.Value);
        }
        if (to.HasValue)
        {
            query = query.Where(x => x.StartedAt <= to.Value);
        }

        var series = await query
            .GroupBy(x => x.StartedAt.Date)
            .Select(g => new AnalyticsSeriesPoint(g.Key, g.Count()))
            .ToListAsync(cancellationToken);

        return new WorkflowAnalyticsDto(series);
    }
}
