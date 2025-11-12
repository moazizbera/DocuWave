namespace DocuWave.Domain.Entities;

public class WorkflowTemplate : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Json { get; set; } = string.Empty;
    public string Tags { get; set; } = string.Empty;
    public string Version { get; set; } = "1";
}

public class WorkflowDefinition : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Json { get; set; } = string.Empty;
    public string Version { get; set; } = "1";
    public string State { get; set; } = "draft";
}

public class WorkflowInstance : BaseEntity
{
    public Guid DefinitionId { get; set; }
    public string Status { get; set; } = "pending";
    public DateTime StartedAt { get; set; } = DateTime.UtcNow;
    public string Variables { get; set; } = "{}";
}
