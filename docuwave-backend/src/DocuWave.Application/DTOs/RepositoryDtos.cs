namespace DocuWave.Application.DTOs;

public record RepositoryListItemDto(Guid Id, string Type, string Name, string Status);

public record CreateRepositoryRequest(string Type, string Name, Dictionary<string, object> Config);

public record RepositoryTestResponse(bool Ok, string Details);

public record RepositoryJobListItemDto(Guid Id, Guid ConnectorId, string State, int Progress, string Message, DateTime CreatedAt);
