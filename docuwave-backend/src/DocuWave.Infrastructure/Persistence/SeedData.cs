using System.Collections.Generic;
using DocuWave.Domain.Entities;

namespace DocuWave.Infrastructure.Persistence;

public static class SeedData
{
    public static readonly TenantFeatureToggle[] TenantFeatureToggles =
    [
        new TenantFeatureToggle
        {
            Id = Guid.Parse("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"),
            Key = "ai",
            Enabled = true,
            TenantId = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa")
        }
    ];

    public static readonly Tenant Tenant = new()
    {
        Id = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"),
        Name = "Contoso Manufacturing",
        TenantId = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
        Branding = new TenantBranding
        {
            LogoUrl = "https://placehold.co/128x32?text=Contoso",
            PrimaryColor = "#004578"
        },
        AiMode = "local",
        CreatedAt = DateTime.UtcNow
    };

    public static readonly AiSettings AiSettings = new()
    {
        Id = Guid.Parse("cccccccc-cccc-cccc-cccc-cccccccccccc"),
        TenantId = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
        Mode = "local",
        Provider = "azureOpenAI",
        Throttle = new AiThrottleSettings { Rpm = 60, Tpm = 6000 },
        Logging = new AiLoggingSettings { Enabled = true, Level = "info" },
        Redaction = new AiRedactionSettings { Pii = true },
        CreatedAt = DateTime.UtcNow
    };

    public static readonly DocumentScheme[] Schemes =
    [
        new DocumentScheme
        {
            Id = Guid.Parse("dddddddd-dddd-dddd-dddd-dddddddddddd"),
            TenantId = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
            Name = "Invoice",
            Version = "1.0",
            IsActive = true,
            JsonDefinition = "{\"fields\":[{\"name\":\"InvoiceNumber\"}]}",
            CreatedAt = DateTime.UtcNow,
            CreatedBy = "system"
        }
    ];
}
