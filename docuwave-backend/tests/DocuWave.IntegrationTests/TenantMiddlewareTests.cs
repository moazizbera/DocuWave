using DocuWave.Api.Middleware;
using DocuWave.Infrastructure.Services;
using Microsoft.AspNetCore.Http;
using Xunit;

namespace DocuWave.IntegrationTests;

public class TenantMiddlewareTests
{
    [Fact]
    public async Task ReturnsBadRequestWhenHeaderMissing()
    {
        var context = new DefaultHttpContext();
        var middleware = new TenantMiddleware(_ => Task.CompletedTask);

        await middleware.Invoke(context);

        Assert.Equal(StatusCodes.Status400BadRequest, context.Response.StatusCode);
    }

    [Fact]
    public async Task SetsTenantWhenHeaderPresent()
    {
        var context = new DefaultHttpContext();
        context.Request.Headers["X-Tenant-Id"] = "tenant-1";
        var middleware = new TenantMiddleware(_ => Task.CompletedTask);

        await middleware.Invoke(context);

        Assert.Equal("tenant-1", context.Items["TenantId"]);
        Assert.Equal(StatusCodes.Status200OK, context.Response.StatusCode == 0 ? StatusCodes.Status200OK : context.Response.StatusCode);
    }
}
