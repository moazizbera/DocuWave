using DocuWave.Api.Services;
using DocuWave.Application.Interfaces;
using DocuWave.Infrastructure.Services;
using DocuWave.Infrastructure.Storage;
using Hangfire;
using Hangfire.SqlServer;
using Microsoft.EntityFrameworkCore;
using DocuWave.Infrastructure.Persistence;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Caching.StackExchangeRedis;

namespace DocuWave.Api.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddDocuWavePlatform(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<AppDbContext>(options =>
        {
            options.UseSqlServer(configuration.GetConnectionString("Sql"));
        });

        services.AddStackExchangeRedisCache(options =>
        {
            options.Configuration = configuration.GetConnectionString("Redis");
        });

        services.AddHangfire(config =>
        {
            config.UseSimpleAssemblyNameTypeSerializer()
                  .UseRecommendedSerializerSettings()
                  .UseSqlServerStorage(configuration.GetConnectionString("Sql"));
        });

        services.AddHangfireServer();

        services.AddScoped<ITenantService, TenantService>();
        services.AddScoped<ISchemeService, SchemeService>();
        services.AddScoped<IDocumentService, DocumentService>();
        services.AddScoped<IAnnotationService, AnnotationService>();
        services.AddScoped<IWorkflowService, WorkflowService>();
        services.AddScoped<IFormService, FormService>();
        services.AddScoped<IAiSettingsService, AiSettingsService>();
        services.AddScoped<IRepositoryService, RepositoryService>();
        services.AddScoped<IOrgService, OrgService>();
        services.AddScoped<IAnalyticsService, AnalyticsService>();
        services.AddScoped<INotificationService, NotificationService>();
        services.AddSingleton<IBlobStorageService, LocalBlobStorageService>();

        services.AddScoped<IDocumentHubDispatcher, DocumentHubDispatcher>();
        services.AddScoped<IWorkflowHubDispatcher, WorkflowHubDispatcher>();
        services.AddScoped<INotificationHubDispatcher, NotificationHubDispatcher>();
        services.AddScoped<IRepositoryHubDispatcher, RepositoryHubDispatcher>();
        services.AddScoped<IAnalyticsHubDispatcher, AnalyticsHubDispatcher>();

        services.AddHttpContextAccessor();
        services.AddScoped<ITenantProvider, HttpTenantProvider>();

        return services;
    }
}
