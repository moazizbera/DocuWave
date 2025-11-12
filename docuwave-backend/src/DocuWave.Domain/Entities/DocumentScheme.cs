namespace DocuWave.Domain.Entities;

public class DocumentScheme : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Version { get; set; } = "1.0";
    public bool IsActive { get; set; } = true;
    public string JsonDefinition { get; set; } = string.Empty;
}
