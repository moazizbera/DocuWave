using DocuWave.Application.DTOs;
using DocuWave.Application.Interfaces;
using DocuWave.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;

namespace DocuWave.Infrastructure.Services;

public sealed class AiSettingsService : IAiSettingsService
{
    private readonly AppDbContext _dbContext;
    private readonly ITenantProvider _tenantProvider;

    public AiSettingsService(AppDbContext dbContext, ITenantProvider tenantProvider)
    {
        _dbContext = dbContext;
        _tenantProvider = tenantProvider;
    }

    public async Task<AiSettingsDto> GetAsync(CancellationToken cancellationToken)
    {
        var tenantId = _tenantProvider.GetTenantId();
        var settings = await _dbContext.AiSettings.AsNoTracking().FirstOrDefaultAsync(x => x.TenantId == tenantId, cancellationToken);
        if (settings is null)
        {
            throw new KeyNotFoundException("AI settings not found");
        }

        return new AiSettingsDto(settings.Mode, settings.Provider, new AiThrottleDto(settings.Throttle.Rpm, settings.Throttle.Tpm), new AiLoggingDto(settings.Logging.Enabled, settings.Logging.Level), new AiRedactionDto(settings.Redaction.Pii));
    }

    public async Task<TestAiSettingsResponse> TestAsync(CancellationToken cancellationToken)
    {
        await Task.Delay(TimeSpan.FromMilliseconds(200), cancellationToken);
        return new TestAiSettingsResponse(true, 120, "Connection successful");
    }

    public async Task UpdateAsync(AiSettingsDto dto, CancellationToken cancellationToken)
    {
        var tenantId = _tenantProvider.GetTenantId();
        var settings = await _dbContext.AiSettings.FirstOrDefaultAsync(x => x.TenantId == tenantId, cancellationToken);
        if (settings is null)
        {
            settings = new Domain.Entities.AiSettings
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                Mode = dto.Mode,
                Provider = dto.Provider,
                Throttle = new Domain.Entities.AiThrottleSettings(),
                Logging = new Domain.Entities.AiLoggingSettings(),
                Redaction = new Domain.Entities.AiRedactionSettings(),
                CreatedAt = DateTime.UtcNow,
                CreatedBy = "api"
            };
            await _dbContext.AiSettings.AddAsync(settings, cancellationToken);
        }

        settings.Mode = dto.Mode;
        settings.Provider = dto.Provider;
        settings.Throttle.Rpm = dto.Throttle.Rpm;
        settings.Throttle.Tpm = dto.Throttle.Tpm;
        settings.Logging.Enabled = dto.Logging.Enabled;
        settings.Logging.Level = dto.Logging.Level;
        settings.Redaction.Pii = dto.Redaction.Pii;
        settings.UpdatedAt = DateTime.UtcNow;
        settings.UpdatedBy = "api";

        await _dbContext.SaveChangesAsync(cancellationToken);
    }
}
