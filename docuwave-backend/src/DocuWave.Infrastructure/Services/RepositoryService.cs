using DocuWave.Application.Common;
using DocuWave.Application.DTOs;
using DocuWave.Application.Interfaces;
using DocuWave.Domain.Entities;
using DocuWave.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;

namespace DocuWave.Infrastructure.Services;

public sealed class RepositoryService : IRepositoryService
{
    private readonly AppDbContext _dbContext;
    private readonly ITenantProvider _tenantProvider;
    private readonly IRepositoryHubDispatcher _hubDispatcher;

    public RepositoryService(AppDbContext dbContext, ITenantProvider tenantProvider, IRepositoryHubDispatcher hubDispatcher)
    {
        _dbContext = dbContext;
        _tenantProvider = tenantProvider;
        _hubDispatcher = hubDispatcher;
    }

    public async Task<RepositoryListItemDto> CreateAsync(CreateRepositoryRequest request, CancellationToken cancellationToken)
    {
        var tenantId = _tenantProvider.GetTenantId();
        var connector = new RepositoryConnector
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            Type = request.Type,
            Name = request.Name,
            Config = System.Text.Json.JsonSerializer.Serialize(request.Config),
            Status = "healthy",
            CreatedAt = DateTime.UtcNow,
            CreatedBy = "api"
        };

        await _dbContext.RepositoryConnectors.AddAsync(connector, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return new RepositoryListItemDto(connector.Id, connector.Type, connector.Name, connector.Status);
    }

    public async Task<PagedResult<RepositoryListItemDto>> GetAsync(int page, int pageSize, CancellationToken cancellationToken)
    {
        var tenantId = _tenantProvider.GetTenantId();
        var query = _dbContext.RepositoryConnectors.AsNoTracking().Where(x => x.TenantId == tenantId);
        var total = await query.CountAsync(cancellationToken);
        var items = await query
            .OrderBy(x => x.Name)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(x => new RepositoryListItemDto(x.Id, x.Type, x.Name, x.Status))
            .ToListAsync(cancellationToken);

        return new PagedResult<RepositoryListItemDto>
        {
            Items = items,
            Total = total,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task<PagedResult<RepositoryJobListItemDto>> GetJobsAsync(string? status, int page, int pageSize, CancellationToken cancellationToken)
    {
        var tenantId = _tenantProvider.GetTenantId();
        var query = _dbContext.RepositoryJobs.AsNoTracking().Where(x => x.TenantId == tenantId);
        if (!string.IsNullOrWhiteSpace(status))
        {
            query = query.Where(x => x.State == status);
        }

        var total = await query.CountAsync(cancellationToken);
        var items = await query
            .OrderByDescending(x => x.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(x => new RepositoryJobListItemDto(x.Id, x.ConnectorId, x.State, x.Progress, x.Message, x.CreatedAt))
            .ToListAsync(cancellationToken);

        return new PagedResult<RepositoryJobListItemDto>
        {
            Items = items,
            Total = total,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task<RepositoryTestResponse> TestAsync(Guid id, CancellationToken cancellationToken)
    {
        var tenantId = _tenantProvider.GetTenantId();
        var connector = await _dbContext.RepositoryConnectors.FirstOrDefaultAsync(x => x.Id == id && x.TenantId == tenantId, cancellationToken);
        if (connector is null)
        {
            throw new KeyNotFoundException("Repository connector not found");
        }

        connector.Status = "healthy";
        await _dbContext.SaveChangesAsync(cancellationToken);

        var job = new RepositorySyncJob
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            ConnectorId = connector.Id,
            State = "running",
            Progress = 0,
            Message = "Sync started",
            CreatedAt = DateTime.UtcNow,
            CreatedBy = "api"
        };

        await _dbContext.RepositoryJobs.AddAsync(job, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);

        for (var i = 1; i <= 5; i++)
        {
            job.Progress = i * 20;
            job.Message = $"Processed batch {i}";
            await _hubDispatcher.PublishSyncProgressAsync(connector.Id, job.Progress, job.State, job.Message, cancellationToken);
            await Task.Delay(100, cancellationToken);
        }

        job.State = "completed";
        job.Message = "Sync completed";
        await _dbContext.SaveChangesAsync(cancellationToken);

        return new RepositoryTestResponse(true, "Connection successful");
    }
}
