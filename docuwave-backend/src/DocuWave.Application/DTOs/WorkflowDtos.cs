namespace DocuWave.Application.DTOs;

public record WorkflowTemplateListItemDto(Guid Id, string Name, IReadOnlyCollection<string> Tags, string Version, DateTime CreatedAt);

public record WorkflowDefinitionListItemDto(Guid Id, string Name, string Version, string State, DateTime CreatedAt);

public record WorkflowInstanceListItemDto(Guid Id, string Status, Guid DefinitionId, DateTime StartedAt, DateTime? UpdatedAt, string? Step);

public record ImportWorkflowTemplateRequest(string Name, string Json);

public record CreateWorkflowDefinitionRequest(string Name, string Json, string Version);

public record WorkflowPublishResponse(string Version);

public record StartWorkflowInstanceRequest(Guid DefinitionId, Dictionary<string, object> Input);

public record WorkflowActionRequest(string Action);
