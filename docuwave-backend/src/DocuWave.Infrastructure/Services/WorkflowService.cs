using DocuWave.Application.Common;
using DocuWave.Application.DTOs;
using DocuWave.Application.Interfaces;
using DocuWave.Domain.Entities;
using DocuWave.Infrastructure.Persistence;
using Hangfire;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;

namespace DocuWave.Infrastructure.Services;

public sealed class WorkflowService : IWorkflowService
{
    private readonly AppDbContext _dbContext;
    private readonly ITenantProvider _tenantProvider;
    private readonly IWorkflowHubDispatcher _hubDispatcher;
    private readonly IBackgroundJobClient _backgroundJobClient;

    public WorkflowService(AppDbContext dbContext, ITenantProvider tenantProvider, IWorkflowHubDispatcher hubDispatcher, IBackgroundJobClient backgroundJobClient)
    {
        _dbContext = dbContext;
        _tenantProvider = tenantProvider;
        _hubDispatcher = hubDispatcher;
        _backgroundJobClient = backgroundJobClient;
    }

    public async Task<WorkflowDefinitionListItemDto> CreateDefinitionAsync(CreateWorkflowDefinitionRequest request, CancellationToken cancellationToken)
    {
        var tenantId = _tenantProvider.GetTenantId();
        var definition = new WorkflowDefinition
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            Name = request.Name,
            Json = request.Json,
            Version = request.Version,
            State = "draft",
            CreatedAt = DateTime.UtcNow,
            CreatedBy = "api"
        };

        await _dbContext.WorkflowDefinitions.AddAsync(definition, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return new WorkflowDefinitionListItemDto(definition.Id, definition.Name, definition.Version, definition.State, definition.CreatedAt);
    }

    public async Task<PagedResult<WorkflowDefinitionListItemDto>> GetDefinitionsAsync(int page, int pageSize, CancellationToken cancellationToken)
    {
        var tenantId = _tenantProvider.GetTenantId();
        var query = _dbContext.WorkflowDefinitions.AsNoTracking().Where(x => x.TenantId == tenantId);
        var total = await query.CountAsync(cancellationToken);
        var items = await query
            .OrderByDescending(x => x.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(x => new WorkflowDefinitionListItemDto(x.Id, x.Name, x.Version, x.State, x.CreatedAt))
            .ToListAsync(cancellationToken);

        return new PagedResult<WorkflowDefinitionListItemDto>
        {
            Items = items,
            Total = total,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task<PagedResult<WorkflowTemplateListItemDto>> GetTemplatesAsync(string? search, string? tags, int page, int pageSize, CancellationToken cancellationToken)
    {
        var tenantId = _tenantProvider.GetTenantId();
        var query = _dbContext.WorkflowTemplates.AsNoTracking().Where(x => x.TenantId == tenantId);
        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(x => x.Name.Contains(search));
        }
        if (!string.IsNullOrWhiteSpace(tags))
        {
            var tagSplit = tags.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
            foreach (var tag in tagSplit)
            {
                query = query.Where(x => x.Tags.Contains(tag, StringComparison.OrdinalIgnoreCase));
            }
        }

        var total = await query.CountAsync(cancellationToken);
        var items = await query
            .OrderByDescending(x => x.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(x => new WorkflowTemplateListItemDto(
                x.Id,
                x.Name,
                x.Tags.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries),
                x.Version,
                x.CreatedAt))
            .ToListAsync(cancellationToken);

        return new PagedResult<WorkflowTemplateListItemDto>
        {
            Items = items,
            Total = total,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task<WorkflowTemplateListItemDto> ImportTemplateAsync(ImportWorkflowTemplateRequest request, CancellationToken cancellationToken)
    {
        var tenantId = _tenantProvider.GetTenantId();
        var template = new WorkflowTemplate
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            Name = request.Name,
            Json = request.Json,
            Tags = string.Empty,
            Version = "1",
            CreatedAt = DateTime.UtcNow,
            CreatedBy = "api"
        };

        await _dbContext.WorkflowTemplates.AddAsync(template, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return new WorkflowTemplateListItemDto(template.Id, template.Name, Array.Empty<string>(), template.Version, template.CreatedAt);
    }

    public async Task<WorkflowPublishResponse> PublishDefinitionAsync(Guid id, CancellationToken cancellationToken)
    {
        var tenantId = _tenantProvider.GetTenantId();
        var definition = await _dbContext.WorkflowDefinitions.FirstOrDefaultAsync(x => x.Id == id && x.TenantId == tenantId, cancellationToken);
        if (definition is null)
        {
            throw new KeyNotFoundException("Workflow definition not found");
        }

        definition.State = "published";
        definition.Version = $"{definition.Version}.{DateTime.UtcNow:yyyyMMddHHmmss}";
        await _dbContext.SaveChangesAsync(cancellationToken);

        return new WorkflowPublishResponse(definition.Version);
    }

    public async Task<PagedResult<WorkflowInstanceListItemDto>> GetInstancesAsync(string? status, string? queryText, int page, int pageSize, CancellationToken cancellationToken)
    {
        var tenantId = _tenantProvider.GetTenantId();
        var query = _dbContext.WorkflowInstances.AsNoTracking().Where(x => x.TenantId == tenantId);
        if (!string.IsNullOrWhiteSpace(status))
        {
            query = query.Where(x => x.Status == status);
        }
        if (!string.IsNullOrWhiteSpace(queryText))
        {
            query = query.Where(x => x.Variables.Contains(queryText));
        }

        var total = await query.CountAsync(cancellationToken);
        var items = await query
            .OrderByDescending(x => x.StartedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(x => new WorkflowInstanceListItemDto(x.Id, x.Status, x.DefinitionId, x.StartedAt, x.UpdatedAt, null))
            .ToListAsync(cancellationToken);

        return new PagedResult<WorkflowInstanceListItemDto>
        {
            Items = items,
            Total = total,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task<WorkflowInstanceListItemDto> StartInstanceAsync(StartWorkflowInstanceRequest request, CancellationToken cancellationToken)
    {
        var tenantId = _tenantProvider.GetTenantId();
        var instance = new WorkflowInstance
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            DefinitionId = request.DefinitionId,
            Status = "running",
            StartedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            Variables = System.Text.Json.JsonSerializer.Serialize(request.Input)
        };

        await _dbContext.WorkflowInstances.AddAsync(instance, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);

        await _hubDispatcher.PublishStatusChangedAsync(instance.Id, instance.Status, "Start", instance.UpdatedAt ?? instance.StartedAt, cancellationToken);

        _backgroundJobClient.Enqueue(() => CompleteWorkflowAsync(tenantId, instance.Id, CancellationToken.None));

        return new WorkflowInstanceListItemDto(instance.Id, instance.Status, instance.DefinitionId, instance.StartedAt, instance.UpdatedAt, "Start");
    }

    public async Task HandleInstanceActionAsync(Guid id, WorkflowActionRequest request, CancellationToken cancellationToken)
    {
        var tenantId = _tenantProvider.GetTenantId();
        var instance = await _dbContext.WorkflowInstances.FirstOrDefaultAsync(x => x.Id == id && x.TenantId == tenantId, cancellationToken);
        if (instance is null)
        {
            throw new KeyNotFoundException("Workflow instance not found");
        }

        switch (request.Action.ToLowerInvariant())
        {
            case "pause":
                instance.Status = "paused";
                break;
            case "resume":
                instance.Status = "running";
                break;
            case "cancel":
                instance.Status = "cancelled";
                break;
            case "reassign":
                instance.Status = "running";
                break;
        }

        instance.UpdatedAt = DateTime.UtcNow;
        await _dbContext.SaveChangesAsync(cancellationToken);
        await _hubDispatcher.PublishStatusChangedAsync(instance.Id, instance.Status, request.Action, instance.UpdatedAt ?? DateTime.UtcNow, cancellationToken);
    }

    public async Task CompleteWorkflowAsync(string tenantId, Guid instanceId, CancellationToken cancellationToken)
    {
        TenantContext.SetTenant(tenantId);
        var instance = await _dbContext.WorkflowInstances.FirstOrDefaultAsync(x => x.Id == instanceId && x.TenantId == tenantId, cancellationToken);
        if (instance is null)
        {
            return;
        }

        await Task.Delay(TimeSpan.FromSeconds(2), cancellationToken);
        instance.Status = "completed";
        instance.UpdatedAt = DateTime.UtcNow;
        await _dbContext.SaveChangesAsync(cancellationToken);
        await _hubDispatcher.PublishStatusChangedAsync(instance.Id, instance.Status, "Completed", instance.UpdatedAt.Value, cancellationToken);
    }
}
