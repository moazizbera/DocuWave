using Microsoft.AspNetCore.Http;

namespace DocuWave.Application.Requests;

public class DocumentUploadRequest
{
    public Guid SchemeId { get; set; }
    public IFormFileCollection Files { get; set; } = default!;
}
