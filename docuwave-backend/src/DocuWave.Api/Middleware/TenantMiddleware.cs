using Microsoft.AspNetCore.Http;
using DocuWave.Infrastructure.Services;

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
        if (context.Request.Path.StartsWithSegments("/swagger") || context.Request.Path.StartsWithSegments("/health"))
        {
            await _next(context);
            return;
        }

        var header = context.Request.Headers["X-Tenant-Id"].FirstOrDefault();
        var claim = context.User?.Claims?.FirstOrDefault(c => c.Type == "tenantId")?.Value;
        var tenantId = header ?? claim;

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
}
