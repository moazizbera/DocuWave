using Microsoft.Extensions.Configuration;
using DocuWave.Application.Interfaces;
using Microsoft.AspNetCore.Http;

namespace DocuWave.Infrastructure.Storage;

public sealed class LocalBlobStorageService : IBlobStorageService
{
    private readonly string _rootPath;

    public LocalBlobStorageService(IConfiguration configuration)
    {
        _rootPath = configuration.GetSection("Blob").GetValue<string>("RootPath") ?? "./storage";
        Directory.CreateDirectory(_rootPath);
    }

    public async Task DeleteAsync(string tenantId, string blobKey, CancellationToken cancellationToken)
    {
        var path = GetPath(tenantId, blobKey);
        if (File.Exists(path))
        {
            await Task.Run(() => File.Delete(path), cancellationToken);
        }
    }

    public async Task<Stream> GetAsync(string tenantId, string blobKey, CancellationToken cancellationToken)
    {
        var path = GetPath(tenantId, blobKey);
        if (!File.Exists(path))
        {
            throw new FileNotFoundException($"Blob {blobKey} not found for tenant {tenantId}");
        }

        var memory = new MemoryStream();
        await using var stream = File.OpenRead(path);
        await stream.CopyToAsync(memory, cancellationToken);
        memory.Position = 0;
        return memory;
    }

    public async Task<string> SaveAsync(string tenantId, IFormFile file, CancellationToken cancellationToken)
    {
        var blobKey = $"{Guid.NewGuid():N}-{file.FileName}";
        var path = GetPath(tenantId, blobKey);
        Directory.CreateDirectory(Path.GetDirectoryName(path)!);
        await using var stream = File.Create(path);
        await file.CopyToAsync(stream, cancellationToken);
        return blobKey;
    }

    private string GetPath(string tenantId, string blobKey)
    {
        return Path.Combine(_rootPath, tenantId, blobKey);
    }
}
