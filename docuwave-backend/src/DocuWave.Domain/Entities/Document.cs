namespace DocuWave.Domain.Entities;

public class Document : BaseEntity
{
    public string Filename { get; set; } = string.Empty;
    public string MimeType { get; set; } = "application/pdf";
    public long SizeBytes { get; set; }
    public Guid SchemeId { get; set; }
    public string Status { get; set; } = "pending";
    public string UploadedBy { get; set; } = string.Empty;
    public DateTime UploadedAt { get; set; } = DateTime.UtcNow;
    public double Confidence { get; set; }
    public string BlobKey { get; set; } = string.Empty;
    public Guid? WorkflowInstanceId { get; set; }
    public ICollection<DocumentTag> Tags { get; set; } = new List<DocumentTag>();
    public ICollection<DocumentAudit> AuditTrail { get; set; } = new List<DocumentAudit>();
    public DocumentAiSummary Ai { get; set; } = new();
}

public class DocumentTag
{
    public Guid Id { get; set; }
    public Guid DocumentId { get; set; }
    public string Name { get; set; } = string.Empty;
}

public class DocumentAudit
{
    public Guid Id { get; set; }
    public Guid DocumentId { get; set; }
    public string Action { get; set; } = string.Empty;
    public string Actor { get; set; } = string.Empty;
    public DateTime OccurredAt { get; set; } = DateTime.UtcNow;
    public string? Notes { get; set; }
}

public class DocumentAiSummary
{
    public ICollection<DocumentAiField> Fields { get; set; } = new List<DocumentAiField>();
    public ICollection<string> Errors { get; set; } = new List<string>();
}

public class DocumentAiField
{
    public Guid Id { get; set; }
    public Guid DocumentId { get; set; }
    public string Key { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
    public double Confidence { get; set; }
}
