namespace DocuWave.Domain.Entities;

public class FormDefinition : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string JsonSchema { get; set; } = string.Empty;
    public string Version { get; set; } = "1";
    public string State { get; set; } = "draft";
}
