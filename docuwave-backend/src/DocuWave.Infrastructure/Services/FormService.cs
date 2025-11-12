using DocuWave.Application.Common;
using DocuWave.Application.DTOs;
using DocuWave.Application.Interfaces;
using DocuWave.Domain.Entities;
using DocuWave.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using System.Linq;

namespace DocuWave.Infrastructure.Services;

public sealed class FormService : IFormService
{
    private readonly AppDbContext _dbContext;
    private readonly ITenantProvider _tenantProvider;

    public FormService(AppDbContext dbContext, ITenantProvider tenantProvider)
    {
        _dbContext = dbContext;
        _tenantProvider = tenantProvider;
    }

    public async Task<FormListItemDto> CreateAsync(CreateFormRequest request, CancellationToken cancellationToken)
    {
        var tenantId = _tenantProvider.GetTenantId();
        var form = new FormDefinition
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            Name = request.Name,
            JsonSchema = request.JsonSchema,
            State = request.State,
            Version = "1",
            CreatedAt = DateTime.UtcNow,
            CreatedBy = "api"
        };

        await _dbContext.Forms.AddAsync(form, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return new FormListItemDto(form.Id, form.Name, form.Version, form.State, form.CreatedAt);
    }

    public async Task<PagedResult<FormListItemDto>> GetAsync(int page, int pageSize, CancellationToken cancellationToken)
    {
        var tenantId = _tenantProvider.GetTenantId();
        var query = _dbContext.Forms.AsNoTracking().Where(x => x.TenantId == tenantId);
        var total = await query.CountAsync(cancellationToken);
        var items = await query
            .OrderByDescending(x => x.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(x => new FormListItemDto(x.Id, x.Name, x.Version, x.State, x.CreatedAt))
            .ToListAsync(cancellationToken);

        return new PagedResult<FormListItemDto>
        {
            Items = items,
            Total = total,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task<PublishFormResponse> PublishAsync(Guid id, CancellationToken cancellationToken)
    {
        var tenantId = _tenantProvider.GetTenantId();
        var form = await _dbContext.Forms.FirstOrDefaultAsync(x => x.Id == id && x.TenantId == tenantId, cancellationToken);
        if (form is null)
        {
            throw new KeyNotFoundException("Form not found");
        }

        form.State = "published";
        form.Version = $"{int.Parse(form.Version)}";
        await _dbContext.SaveChangesAsync(cancellationToken);

        return new PublishFormResponse(form.Version);
    }
}
