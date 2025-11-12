namespace DocuWave.Domain.Entities;

/// <summary>
/// Base type for aggregate roots and entities with common audit properties.
/// </summary>
public abstract class BaseEntity
{
    public Guid Id { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    public string CreatedBy { get; set; } = string.Empty;
    public string? UpdatedBy { get; set; }
    public string TenantId { get; set; } = string.Empty;
}
