namespace DocuWave.Application.Interfaces;

public interface IDocumentHubDispatcher
{
    Task PublishUploadProgressAsync(Guid batchId, int processed, int total, CancellationToken cancellationToken);
    Task PublishExtractionUpdateAsync(Guid documentId, string status, double confidence, CancellationToken cancellationToken);
    Task PublishUploadCompletedAsync(Guid batchId, int succeeded, int failed, CancellationToken cancellationToken);
    Task PublishBulkProgressAsync(Guid jobId, int progress, string state, CancellationToken cancellationToken);
}
