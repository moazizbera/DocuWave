namespace DocuWave.Domain.Entities;

public class Annotation : BaseEntity
{
    public Guid DocumentId { get; set; }
    public string Type { get; set; } = "highlight";
    public string Rect { get; set; } = string.Empty;
    public string Text { get; set; } = string.Empty;
    public string Version { get; set; } = "1";
}
