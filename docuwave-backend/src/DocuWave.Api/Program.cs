using System.Text;
using DocuWave.Api.Extensions;
using DocuWave.Api.Hubs;
using DocuWave.Api.Middleware;
using Microsoft.AspNetCore.Http;
using DocuWave.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

builder.Host.UseSerilog((context, configuration) =>
{
    configuration.ReadFrom.Configuration(context.Configuration);
});

builder.Services.AddControllers().AddNewtonsoftJson();
builder.Services.AddSignalR();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
    {
        policy.WithOrigins("http://localhost:3000")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"] ?? "DocuWaveDevKey"))
        };
    });

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("RequireTenant", policy =>
    {
        policy.RequireClaim("tenantId");
    });
});

builder.Services.AddHealthChecks()
    .AddDbContextCheck<AppDbContext>("database");

builder.Services.AddDocuWavePlatform(builder.Configuration);

var app = builder.Build();

app.UseSerilogRequestLogging();
app.UseHttpsRedirection();
app.UseRouting();
app.Use(async (context, next) =>
{
    try
    {
        await next();
    }
    catch (KeyNotFoundException ex)
    {
        context.Response.StatusCode = StatusCodes.Status404NotFound;
        await context.Response.WriteAsJsonAsync(new { error = ex.Message });
    }
    catch (UnauthorizedAccessException ex)
    {
        context.Response.StatusCode = StatusCodes.Status403Forbidden;
        await context.Response.WriteAsJsonAsync(new { error = ex.Message });
    }
});

app.UseCors("Frontend");
app.UseAuthentication();
app.UseMiddleware<TenantMiddleware>();
app.UseAuthorization();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.MapControllers();
app.MapHub<DocumentHub>("/hubs/documents");
app.MapHub<WorkflowHub>("/hubs/workflows");
app.MapHub<NotificationHub>("/hubs/notifications");
app.MapHub<RepositoriesHub>("/hubs/repositories");
app.MapHub<AnalyticsHub>("/hubs/analytics");
app.MapHealthChecks("/health");

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();
}

app.Run();
