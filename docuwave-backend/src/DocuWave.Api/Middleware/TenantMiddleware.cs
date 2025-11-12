using System.Linq;
using System.Security.Claims;
using DocuWave.Infrastructure.Services;
using Microsoft.AspNetCore.Http;

namespace DocuWave.Api.Middleware;

public class TenantMiddleware
{
    private readonly RequestDelegate _next;

    public TenantMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task Invoke(HttpContext context)
    {
        if (HttpMethods.IsOptions(context.Request.Method)
            || context.Request.Path.StartsWithSegments("/swagger")
            || context.Request.Path.StartsWithSegments("/health")
            || context.Request.Path.StartsWithSegments("/metrics"))
        {
            await _next(context);
            return;
        }

        var header = context.Request.Headers["X-Tenant-Id"].FirstOrDefault();
        var tenantId = header ?? ResolveTenantFromClaims(context.User);

        if (string.IsNullOrWhiteSpace(tenantId))
        {
            context.Response.StatusCode = StatusCodes.Status400BadRequest;
            await context.Response.WriteAsJsonAsync(new { error = "Missing X-Tenant-Id" });
            return;
        }

        context.Items["TenantId"] = tenantId;
        TenantContext.SetTenant(tenantId);
        await _next(context);
    }

    private static string? ResolveTenantFromClaims(ClaimsPrincipal? principal)
    {
        if (principal == null)
        {
            return null;
        }

        return principal.FindFirst("tenantId")?.Value
            ?? principal.FindFirst("tid")?.Value
            ?? principal.FindFirst("http://schemas.microsoft.com/identity/claims/tenantid")?.Value;
    }
}
