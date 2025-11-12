namespace DocuWave.Application.DTOs;

public record FormListItemDto(Guid Id, string Name, string Version, string State, DateTime CreatedAt);

public record CreateFormRequest(string Name, string JsonSchema, string State);

public record PublishFormResponse(string Version);
