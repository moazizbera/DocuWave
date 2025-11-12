namespace DocuWave.Domain.Entities;

public class Tenant : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public TenantBranding Branding { get; set; } = new();
    public string AiMode { get; set; } = "local";
    public ICollection<TenantFeatureToggle> FeatureToggles { get; set; } = new List<TenantFeatureToggle>();
}

public class TenantBranding
{
    public string LogoUrl { get; set; } = string.Empty;
    public string PrimaryColor { get; set; } = "#004578";
}

public class TenantFeatureToggle
{
    public Guid Id { get; set; }
    public string Key { get; set; } = string.Empty;
    public bool Enabled { get; set; }
    public Guid TenantId { get; set; }
}
