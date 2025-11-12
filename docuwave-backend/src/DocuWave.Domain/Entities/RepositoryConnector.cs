namespace DocuWave.Domain.Entities;

public class RepositoryConnector : BaseEntity
{
    public string Type { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Config { get; set; } = "{}";
    public string Status { get; set; } = "healthy";
}

public class RepositorySyncJob : BaseEntity
{
    public Guid ConnectorId { get; set; }
    public string State { get; set; } = "pending";
    public int Progress { get; set; }
    public string Message { get; set; } = string.Empty;
}
