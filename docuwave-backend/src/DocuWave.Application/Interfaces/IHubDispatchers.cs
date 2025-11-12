namespace DocuWave.Application.Interfaces;

public interface IWorkflowHubDispatcher
{
    Task PublishStatusChangedAsync(Guid instanceId, string status, string? step, DateTime updatedAt, CancellationToken cancellationToken);
}

public interface INotificationHubDispatcher
{
    Task PublishNewAsync(Guid id, string type, string title, string body, DateTime createdAt, CancellationToken cancellationToken);
    Task PublishBulkUpdateAsync(IEnumerable<Guid> ids, bool isRead, CancellationToken cancellationToken);
}

public interface IRepositoryHubDispatcher
{
    Task PublishSyncProgressAsync(Guid connectorId, int percent, string state, string message, CancellationToken cancellationToken);
}

public interface IAnalyticsHubDispatcher
{
    Task PublishExportReadyAsync(Guid jobId, string downloadUrl, CancellationToken cancellationToken);
}
