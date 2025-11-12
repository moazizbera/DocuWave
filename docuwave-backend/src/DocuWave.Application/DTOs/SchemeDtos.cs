namespace DocuWave.Application.DTOs;

public record SchemeListItemDto(Guid Id, string Name, string Version, bool IsActive, DateTime CreatedAt);

public record CreateSchemeRequest(string Name, string Version, string JsonDefinition);
