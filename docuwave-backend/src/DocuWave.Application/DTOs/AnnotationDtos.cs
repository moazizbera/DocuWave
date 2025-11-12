namespace DocuWave.Application.DTOs;

public record AnnotationDto(Guid Id, string Type, string Rect, string Text, string CreatedBy, DateTime CreatedAt, string Version);

public record AnnotationRequest(string Type, string Rect, string Text, string Version);
