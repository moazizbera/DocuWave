namespace DocuWave.Application.DTOs;

public record TenantBrandingDto(string LogoUrl, string PrimaryColor);

public record TenantListItemDto(Guid Id, string Name, TenantBrandingDto Branding);

public record TenantDetailDto(Guid Id, string Name, TenantBrandingDto Branding, string AiMode, IReadOnlyCollection<string> Features);

public record CreateTenantRequest(string Name, TenantBrandingDto Branding, string AiMode, IReadOnlyCollection<string> Features);

public record UpdateTenantRequest(string Name, TenantBrandingDto Branding, string AiMode, IReadOnlyCollection<string> Features);
