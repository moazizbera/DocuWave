using System.Collections.Generic;
using System.Threading.Tasks;
using DocuWave.Api.Hubs;
using DocuWave.Application.Interfaces;
using Microsoft.AspNetCore.SignalR;

namespace DocuWave.Api.Services;

public sealed class DocumentHubDispatcher : IDocumentHubDispatcher
{
    private readonly IHubContext<DocumentHub> _hubContext;

    public DocumentHubDispatcher(IHubContext<DocumentHub> hubContext)
    {
        _hubContext = hubContext;
    }

    public Task PublishBulkProgressAsync(Guid jobId, int progress, string state, CancellationToken cancellationToken)
        => _hubContext.Clients.All.SendAsync("bulkJobProgress", new { jobId, progress, state }, cancellationToken);

    public Task PublishExtractionUpdateAsync(Guid documentId, string status, double confidence, CancellationToken cancellationToken)
        => _hubContext.Clients.All.SendAsync("extractionUpdated", new { documentId, status, confidence }, cancellationToken);

    public Task PublishUploadCompletedAsync(Guid batchId, int succeeded, int failed, CancellationToken cancellationToken)
        => _hubContext.Clients.All.SendAsync("completed", new { batchId, succeeded, failed }, cancellationToken);

    public Task PublishUploadProgressAsync(Guid batchId, int processed, int total, CancellationToken cancellationToken)
        => _hubContext.Clients.All.SendAsync("uploadProgress", new { batchId, processed, total }, cancellationToken);
}

public sealed class WorkflowHubDispatcher : IWorkflowHubDispatcher
{
    private readonly IHubContext<WorkflowHub> _hubContext;

    public WorkflowHubDispatcher(IHubContext<WorkflowHub> hubContext)
    {
        _hubContext = hubContext;
    }

    public Task PublishStatusChangedAsync(Guid instanceId, string status, string? step, DateTime updatedAt, CancellationToken cancellationToken)
        => _hubContext.Clients.All.SendAsync("statusChanged", new { instanceId, status, step, updatedAt }, cancellationToken);
}

public sealed class NotificationHubDispatcher : INotificationHubDispatcher
{
    private readonly IHubContext<NotificationHub> _hubContext;

    public NotificationHubDispatcher(IHubContext<NotificationHub> hubContext)
    {
        _hubContext = hubContext;
    }

    public Task PublishBulkUpdateAsync(IEnumerable<Guid> ids, bool isRead, CancellationToken cancellationToken)
        => _hubContext.Clients.All.SendAsync("bulkUpdate", new { ids, isRead }, cancellationToken);

    public Task PublishNewAsync(Guid id, string type, string title, string body, DateTime createdAt, CancellationToken cancellationToken)
        => _hubContext.Clients.All.SendAsync("new", new { id, type, title, body, createdAt }, cancellationToken);
}

public sealed class RepositoryHubDispatcher : IRepositoryHubDispatcher
{
    private readonly IHubContext<RepositoriesHub> _hubContext;

    public RepositoryHubDispatcher(IHubContext<RepositoriesHub> hubContext)
    {
        _hubContext = hubContext;
    }

    public Task PublishSyncProgressAsync(Guid connectorId, int percent, string state, string message, CancellationToken cancellationToken)
        => _hubContext.Clients.All.SendAsync("syncProgress", new { connectorId, percent, state, message }, cancellationToken);
}

public sealed class AnalyticsHubDispatcher : IAnalyticsHubDispatcher
{
    private readonly IHubContext<AnalyticsHub> _hubContext;

    public AnalyticsHubDispatcher(IHubContext<AnalyticsHub> hubContext)
    {
        _hubContext = hubContext;
    }

    public Task PublishExportReadyAsync(Guid jobId, string downloadUrl, CancellationToken cancellationToken)
        => _hubContext.Clients.All.SendAsync("exportReady", new { jobId, downloadUrl }, cancellationToken);
}
