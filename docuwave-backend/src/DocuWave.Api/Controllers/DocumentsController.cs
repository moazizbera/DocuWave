using DocuWave.Application.Common;
using DocuWave.Application.DTOs;
using DocuWave.Application.Interfaces;
using DocuWave.Application.Requests;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace DocuWave.Api.Controllers;

[ApiController]
[Route("api/documents")]
[Route("api/document")]
public class DocumentsController : ControllerBase
{
    private readonly IDocumentService _documentService;
    private readonly IAnnotationService _annotationService;
    
    public DocumentsController(IDocumentService documentService, IAnnotationService annotationService)
    {
        _documentService = documentService;
        _annotationService = annotationService;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResult<DocumentListItemDto>>> Get([FromQuery] string? status, [FromQuery] Guid? schemeId, [FromQuery] string? q, [FromQuery] DateTime? from, [FromQuery] DateTime? to, [FromQuery] int page = 1, [FromQuery] int pageSize = 25, CancellationToken cancellationToken = default)
    {
        var result = await _documentService.QueryAsync(new DocumentQuery(status, schemeId, q, from, to, page, pageSize), cancellationToken);
        return Ok(result);
    }

    [HttpPost("upload")]
    [RequestSizeLimit(1_000_000_000)]
    public async Task<ActionResult<UploadResponse>> Upload([FromQuery] Guid? schemeId, CancellationToken cancellationToken)
    {
        if ((!schemeId.HasValue || schemeId == Guid.Empty) && Guid.TryParse(Request.Form["schemeId"], out var schemeFromForm))
        {
            schemeId = schemeFromForm;
        }

        if (!schemeId.HasValue || schemeId == Guid.Empty)
        {
            return BadRequest(new { error = "schemeId is required" });
        }

        var request = new DocumentUploadRequest
        {
            SchemeId = schemeId.Value,
            Files = Request.Form.Files
        };

        var response = await _documentService.UploadAsync(request, cancellationToken);
        return Accepted(response);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<DocumentDetailDto>> GetById(Guid id, CancellationToken cancellationToken)
        => Ok(await _documentService.GetAsync(id, cancellationToken));

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        await _documentService.DeleteAsync(id, cancellationToken);
        return NoContent();
    }

    [HttpPost("bulk")]
    public async Task<ActionResult<BulkJobResponse>> Bulk([FromBody] DocumentBulkRequest request, CancellationToken cancellationToken)
        => Accepted(await _documentService.BulkAsync(request, cancellationToken));

    [HttpGet("{id}/content")]
    public async Task<IActionResult> Content(Guid id, [FromQuery] string? rendition, CancellationToken cancellationToken)
    {
        var (stream, mime, fileName) = await _documentService.GetContentAsync(id, rendition, cancellationToken);
        return File(stream, mime, fileName);
    }

    [HttpGet("{id}/annotations")]
    public async Task<ActionResult<PagedResult<AnnotationDto>>> GetAnnotations(Guid id, [FromQuery] int page = 1, [FromQuery] int pageSize = 50, CancellationToken cancellationToken = default)
        => Ok(await _annotationService.GetAsync(id, page, pageSize, cancellationToken));

    [HttpPost("{id}/annotations")]
    public async Task<ActionResult<AnnotationDto>> CreateAnnotation(Guid id, [FromBody] AnnotationRequest request, CancellationToken cancellationToken)
    {
        var result = await _annotationService.CreateAsync(id, request, cancellationToken);
        return CreatedAtAction(nameof(GetAnnotations), new { id }, result);
    }

    [HttpPut("{id}/annotations/{annotationId}")]
    public async Task<IActionResult> UpdateAnnotation(Guid id, Guid annotationId, [FromBody] AnnotationRequest request, CancellationToken cancellationToken)
    {
        await _annotationService.UpdateAsync(id, annotationId, request, cancellationToken);
        return NoContent();
    }

    [HttpDelete("{id}/annotations/{annotationId}")]
    public async Task<IActionResult> DeleteAnnotation(Guid id, Guid annotationId, CancellationToken cancellationToken)
    {
        await _annotationService.DeleteAsync(id, annotationId, cancellationToken);
        return NoContent();
    }
}
