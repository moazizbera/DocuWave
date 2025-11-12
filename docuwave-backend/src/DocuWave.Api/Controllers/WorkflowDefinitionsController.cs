using DocuWave.Application.Common;
using DocuWave.Application.DTOs;
using DocuWave.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace DocuWave.Api.Controllers;

[ApiController]
[Route("api/workflow/definitions")]
public class WorkflowDefinitionsController : ControllerBase
{
    private readonly IWorkflowService _workflowService;

    public WorkflowDefinitionsController(IWorkflowService workflowService)
    {
        _workflowService = workflowService;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResult<WorkflowDefinitionListItemDto>>> Get([FromQuery] int page = 1, [FromQuery] int pageSize = 25, CancellationToken cancellationToken = default)
        => Ok(await _workflowService.GetDefinitionsAsync(page, pageSize, cancellationToken));

    [HttpPost]
    public async Task<ActionResult<WorkflowDefinitionListItemDto>> Create([FromBody] CreateWorkflowDefinitionRequest request, CancellationToken cancellationToken)
    {
        var result = await _workflowService.CreateDefinitionAsync(request, cancellationToken);
        return CreatedAtAction(nameof(Get), new { id = result.Id }, result);
    }

    [HttpPost("{id}/publish")]
    public async Task<ActionResult<WorkflowPublishResponse>> Publish(Guid id, CancellationToken cancellationToken)
        => Accepted(await _workflowService.PublishDefinitionAsync(id, cancellationToken));
}
