namespace DocuWave.Domain.Entities;

public class Notification : BaseEntity
{
    public string Type { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
    public bool IsRead { get; set; }
    public string UserId { get; set; } = string.Empty;
}

public class AuditLog : BaseEntity
{
    public string ActorId { get; set; } = string.Empty;
    public string Action { get; set; } = string.Empty;
    public string Entity { get; set; } = string.Empty;
    public Guid EntityId { get; set; }
    public string Data { get; set; } = "{}";
}
