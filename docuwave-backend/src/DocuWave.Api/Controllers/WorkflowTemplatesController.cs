using DocuWave.Application.Common;
using DocuWave.Application.DTOs;
using DocuWave.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace DocuWave.Api.Controllers;

[ApiController]
[Route("api/workflow/templates")]
public class WorkflowTemplatesController : ControllerBase
{
    private readonly IWorkflowService _workflowService;

    public WorkflowTemplatesController(IWorkflowService workflowService)
    {
        _workflowService = workflowService;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResult<WorkflowTemplateListItemDto>>> Get([FromQuery] string? q, [FromQuery] string? tags, [FromQuery] int page = 1, [FromQuery] int pageSize = 25, CancellationToken cancellationToken = default)
        => Ok(await _workflowService.GetTemplatesAsync(q, tags, page, pageSize, cancellationToken));

    [HttpPost("import")]
    public async Task<ActionResult<WorkflowTemplateListItemDto>> Import([FromBody] ImportWorkflowTemplateRequest request, CancellationToken cancellationToken)
    {
        var result = await _workflowService.ImportTemplateAsync(request, cancellationToken);
        return CreatedAtAction(nameof(Get), new { id = result.Id }, result);
    }
}
