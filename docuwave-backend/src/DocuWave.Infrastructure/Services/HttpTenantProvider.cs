using DocuWave.Application.Interfaces;
using Microsoft.AspNetCore.Http;

namespace DocuWave.Infrastructure.Services;

public sealed class HttpTenantProvider : ITenantProvider
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public HttpTenantProvider(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public string GetTenantId()
    {
        var context = _httpContextAccessor.HttpContext;
        if (context?.Items.TryGetValue("TenantId", out var tenant) == true && tenant is string tenantId)
        {
            TenantContext.SetTenant(tenantId);
            return tenantId;
        }

        var ambient = TenantContext.GetTenant();
        if (!string.IsNullOrWhiteSpace(ambient))
        {
            return ambient;
        }

        throw new InvalidOperationException("Tenant not resolved for the current request.");
    }
}
