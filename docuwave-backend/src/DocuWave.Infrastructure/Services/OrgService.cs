using DocuWave.Application.DTOs;
using DocuWave.Application.Interfaces;
using DocuWave.Domain.Entities;
using Microsoft.AspNetCore.Http;
using System.IO;
using DocuWave.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace DocuWave.Infrastructure.Services;

public sealed class OrgService : IOrgService
{
    private readonly AppDbContext _dbContext;
    private readonly ITenantProvider _tenantProvider;

    public OrgService(AppDbContext dbContext, ITenantProvider tenantProvider)
    {
        _dbContext = dbContext;
        _tenantProvider = tenantProvider;
    }

    public async Task<OrgStructureDto> GetAsync(CancellationToken cancellationToken)
    {
        var tenantId = _tenantProvider.GetTenantId();
        var units = await _dbContext.OrgUnits.AsNoTracking().Where(x => x.TenantId == tenantId).ToListAsync(cancellationToken);
        var roles = await _dbContext.OrgRoles.AsNoTracking().Where(x => x.TenantId == tenantId).ToListAsync(cancellationToken);
        var delegations = await _dbContext.OrgDelegations.AsNoTracking().Where(x => x.TenantId == tenantId).ToListAsync(cancellationToken);
        var calendars = await _dbContext.WorkingCalendars.AsNoTracking().Where(x => x.TenantId == tenantId).ToListAsync(cancellationToken);

        return new OrgStructureDto(
            units.Select(x => new OrgUnitDto(x.Id, x.Name, x.ParentId)).ToArray(),
            roles.Select(x => new OrgRoleDto(x.Id, x.Name)).ToArray(),
            delegations.Select(x => new OrgDelegationDto(x.Id, x.FromUserId, x.ToUserId, x.From, x.To)).ToArray(),
            calendars.Select(x => new WorkingCalendarDto(x.Id, x.Timezone, x.WorkingDays, x.WorkingHours)).ToArray());
    }

    public async Task<OrgImportResponse> ImportAsync(IFormFile file, CancellationToken cancellationToken)
    {
        var tenantId = _tenantProvider.GetTenantId();
        using var reader = new StreamReader(file.OpenReadStream());
        while (!reader.EndOfStream)
        {
            var line = await reader.ReadLineAsync();
            if (string.IsNullOrWhiteSpace(line))
            {
                continue;
            }

            var parts = line.Split(',');
            if (parts.Length >= 2)
            {
                var unit = new OrgUnit
                {
                    Id = Guid.NewGuid(),
                    TenantId = tenantId,
                    Name = parts[0],
                    ParentId = Guid.TryParse(parts[1], out var pid) ? pid : null,
                    CreatedAt = DateTime.UtcNow,
                    CreatedBy = "import"
                };
                await _dbContext.OrgUnits.AddAsync(unit, cancellationToken);
            }
        }

        await _dbContext.SaveChangesAsync(cancellationToken);
        var jobId = Guid.NewGuid();
        return new OrgImportResponse(jobId);
    }
}
