using DocuWave.Application.Common;
using DocuWave.Application.DTOs;
using DocuWave.Application.Interfaces;
using DocuWave.Domain.Entities;
using DocuWave.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace DocuWave.Infrastructure.Services;

public sealed class TenantService : ITenantService
{
    private readonly AppDbContext _dbContext;

    public TenantService(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<TenantDetailDto> CreateAsync(CreateTenantRequest request, CancellationToken cancellationToken)
    {
        var tenant = new Tenant
        {
            Id = Guid.NewGuid(),
            TenantId = Guid.NewGuid().ToString(),
            Name = request.Name,
            Branding = new TenantBranding
            {
                LogoUrl = request.Branding.LogoUrl,
                PrimaryColor = request.Branding.PrimaryColor
            },
            AiMode = request.AiMode,
            FeatureToggles = request.Features.Select(feature => new TenantFeatureToggle
            {
                Id = Guid.NewGuid(),
                Key = feature,
                Enabled = true,
                TenantId = tenant.Id
            }).ToList(),
            CreatedAt = DateTime.UtcNow,
            CreatedBy = "system"
        };

        await _dbContext.Tenants.AddAsync(tenant, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return new TenantDetailDto(
            tenant.Id,
            tenant.Name,
            new TenantBrandingDto(tenant.Branding.LogoUrl, tenant.Branding.PrimaryColor),
            tenant.AiMode,
            tenant.FeatureToggles.Select(x => x.Key).ToArray());
    }

    public async Task<TenantDetailDto> GetAsync(Guid id, CancellationToken cancellationToken)
    {
        var tenant = await _dbContext.Tenants.Include(x => x.FeatureToggles)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (tenant is null)
        {
            throw new KeyNotFoundException("Tenant not found");
        }

        return new TenantDetailDto(
            tenant.Id,
            tenant.Name,
            new TenantBrandingDto(tenant.Branding.LogoUrl, tenant.Branding.PrimaryColor),
            tenant.AiMode,
            tenant.FeatureToggles.Select(x => x.Key).ToArray());
    }

    public async Task<PagedResult<TenantListItemDto>> SearchAsync(string? search, int page, int pageSize, CancellationToken cancellationToken)
    {
        var query = _dbContext.Tenants.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(x => EF.Functions.Like(x.Name, $"%{search}%"));
        }

        var total = await query.CountAsync(cancellationToken);
        var items = await query
            .OrderBy(x => x.Name)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(x => new TenantListItemDto(
                x.Id,
                x.Name,
                new TenantBrandingDto(x.Branding.LogoUrl, x.Branding.PrimaryColor)))
            .ToListAsync(cancellationToken);

        return new PagedResult<TenantListItemDto>
        {
            Items = items,
            Total = total,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task UpdateAsync(Guid id, UpdateTenantRequest request, CancellationToken cancellationToken)
    {
        var tenant = await _dbContext.Tenants.Include(x => x.FeatureToggles)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (tenant is null)
        {
            throw new KeyNotFoundException("Tenant not found");
        }

        tenant.Name = request.Name;
        tenant.Branding = new TenantBranding
        {
            LogoUrl = request.Branding.LogoUrl,
            PrimaryColor = request.Branding.PrimaryColor
        };
        tenant.AiMode = request.AiMode;

        var toggles = request.Features.Select(feature => feature).ToHashSet(StringComparer.OrdinalIgnoreCase);
        tenant.FeatureToggles = tenant.FeatureToggles
            .Where(toggle => toggles.Contains(toggle.Key))
            .ToList();

        foreach (var feature in toggles)
        {
            if (!tenant.FeatureToggles.Any(t => t.Key.Equals(feature, StringComparison.OrdinalIgnoreCase)))
            {
                tenant.FeatureToggles.Add(new TenantFeatureToggle
                {
                    Id = Guid.NewGuid(),
                    Key = feature,
                    Enabled = true,
                    TenantId = tenant.Id
                });
            }
        }

        await _dbContext.SaveChangesAsync(cancellationToken);
    }
}
