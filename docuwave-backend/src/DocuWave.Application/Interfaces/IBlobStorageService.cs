using Microsoft.AspNetCore.Http;

namespace DocuWave.Application.Interfaces;

public interface IBlobStorageService
{
    Task<string> SaveAsync(string tenantId, IFormFile file, CancellationToken cancellationToken);
    Task<Stream> GetAsync(string tenantId, string blobKey, CancellationToken cancellationToken);
    Task DeleteAsync(string tenantId, string blobKey, CancellationToken cancellationToken);
}
