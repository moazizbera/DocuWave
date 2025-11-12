using DocuWave.Application.Common;
using DocuWave.Application.DTOs;
using DocuWave.Application.Interfaces;
using DocuWave.Domain.Entities;
using DocuWave.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace DocuWave.Infrastructure.Services;

public sealed class SchemeService : ISchemeService
{
    private readonly AppDbContext _dbContext;
    private readonly ITenantProvider _tenantProvider;

    public SchemeService(AppDbContext dbContext, ITenantProvider tenantProvider)
    {
        _dbContext = dbContext;
        _tenantProvider = tenantProvider;
    }

    public async Task<SchemeListItemDto> CreateAsync(CreateSchemeRequest request, CancellationToken cancellationToken)
    {
        var tenantId = _tenantProvider.GetTenantId();
        var scheme = new DocumentScheme
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            Name = request.Name,
            Version = request.Version,
            JsonDefinition = request.JsonDefinition,
            IsActive = true,
            CreatedBy = "system",
            CreatedAt = DateTime.UtcNow
        };

        await _dbContext.Schemes.AddAsync(scheme, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return new SchemeListItemDto(scheme.Id, scheme.Name, scheme.Version, scheme.IsActive, scheme.CreatedAt);
    }

    public async Task<PagedResult<SchemeListItemDto>> GetAsync(int page, int pageSize, CancellationToken cancellationToken)
    {
        var tenantId = _tenantProvider.GetTenantId();
        var query = _dbContext.Schemes.AsNoTracking().Where(x => x.TenantId == tenantId);

        var total = await query.CountAsync(cancellationToken);
        var items = await query
            .OrderByDescending(x => x.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(x => new SchemeListItemDto(x.Id, x.Name, x.Version, x.IsActive, x.CreatedAt))
            .ToListAsync(cancellationToken);

        return new PagedResult<SchemeListItemDto>
        {
            Items = items,
            Total = total,
            Page = page,
            PageSize = pageSize
        };
    }
}
