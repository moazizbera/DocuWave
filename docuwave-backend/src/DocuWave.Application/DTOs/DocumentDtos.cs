namespace DocuWave.Application.DTOs;

public record DocumentListItemDto(
    Guid Id,
    string Filename,
    Guid SchemeId,
    string Status,
    long SizeBytes,
    string UploadedBy,
    DateTime UploadedAt,
    double Confidence);

public record DocumentDetailDto(
    Guid Id,
    string Filename,
    string MimeType,
    long SizeBytes,
    Guid SchemeId,
    string Status,
    IReadOnlyCollection<string> Tags,
    IReadOnlyCollection<DocumentAuditEntryDto> AuditTrail,
    Guid? WorkflowInstanceId,
    DocumentAiDto Ai);

public record DocumentAuditEntryDto(string Action, string Actor, DateTime OccurredAt, string? Notes);

public record DocumentAiDto(IReadOnlyCollection<DocumentAiFieldDto> Fields, IReadOnlyCollection<string> Errors);

public record DocumentAiFieldDto(string Key, string Value, double Confidence);

public record UploadResponse(Guid BatchId, int Accepted, IReadOnlyCollection<string> Rejected);

public record DocumentQuery(string? Status, Guid? SchemeId, string? Q, DateTime? From, DateTime? To, int Page = 1, int PageSize = 25);

public record DocumentBulkRequest(string Action, IReadOnlyCollection<Guid> Ids);

public record BulkJobResponse(Guid JobId);
