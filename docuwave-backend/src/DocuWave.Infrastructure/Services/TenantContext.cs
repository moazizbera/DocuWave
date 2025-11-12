using System.Threading;

namespace DocuWave.Infrastructure.Services;

public static class TenantContext
{
    private static readonly AsyncLocal<string?> CurrentTenant = new();

    public static void SetTenant(string tenantId)
    {
        CurrentTenant.Value = tenantId;
    }

    public static string? GetTenant()
    {
        return CurrentTenant.Value;
    }
}
