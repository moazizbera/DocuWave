using DocuWave.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DocuWave.Infrastructure.Persistence;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<Tenant> Tenants => Set<Tenant>();
    public DbSet<DocumentScheme> Schemes => Set<DocumentScheme>();
    public DbSet<Document> Documents => Set<Document>();
    public DbSet<DocumentTag> DocumentTags => Set<DocumentTag>();
    public DbSet<DocumentAudit> DocumentAudits => Set<DocumentAudit>();
    public DbSet<DocumentAiField> DocumentAiFields => Set<DocumentAiField>();
    public DbSet<Annotation> Annotations => Set<Annotation>();
    public DbSet<WorkflowTemplate> WorkflowTemplates => Set<WorkflowTemplate>();
    public DbSet<WorkflowDefinition> WorkflowDefinitions => Set<WorkflowDefinition>();
    public DbSet<WorkflowInstance> WorkflowInstances => Set<WorkflowInstance>();
    public DbSet<FormDefinition> Forms => Set<FormDefinition>();
    public DbSet<RepositoryConnector> RepositoryConnectors => Set<RepositoryConnector>();
    public DbSet<RepositorySyncJob> RepositoryJobs => Set<RepositorySyncJob>();
    public DbSet<AiSettings> AiSettings => Set<AiSettings>();
    public DbSet<OrgUnit> OrgUnits => Set<OrgUnit>();
    public DbSet<OrgRole> OrgRoles => Set<OrgRole>();
    public DbSet<OrgDelegation> OrgDelegations => Set<OrgDelegation>();
    public DbSet<WorkingCalendar> WorkingCalendars => Set<WorkingCalendar>();
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<TenantFeatureToggle>().HasKey(x => x.Id);
        modelBuilder.Entity<DocumentTag>().HasKey(x => x.Id);
        modelBuilder.Entity<DocumentAudit>().HasKey(x => x.Id);
        modelBuilder.Entity<DocumentAiField>().HasKey(x => x.Id);

        modelBuilder.Entity<Tenant>().OwnsOne(x => x.Branding);
        modelBuilder.Entity<Document>().OwnsOne(x => x.Ai, ai =>
        {
            ai.ToJson();
            ai.OwnsMany(x => x.Fields, fields => fields.ToJson());
        });

        modelBuilder.Entity<AiSettings>().OwnsOne(x => x.Throttle);
        modelBuilder.Entity<AiSettings>().OwnsOne(x => x.Logging);
        modelBuilder.Entity<AiSettings>().OwnsOne(x => x.Redaction);

        modelBuilder.Entity<Tenant>().HasData(SeedData.Tenant);
        modelBuilder.Entity<TenantFeatureToggle>().HasData(SeedData.TenantFeatureToggles);
        modelBuilder.Entity<AiSettings>().HasData(SeedData.AiSettings);
        modelBuilder.Entity<DocumentScheme>().HasData(SeedData.Schemes);
    }
}
