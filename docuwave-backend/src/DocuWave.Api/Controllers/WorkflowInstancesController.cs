using DocuWave.Application.Common;
using DocuWave.Application.DTOs;
using DocuWave.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace DocuWave.Api.Controllers;

[ApiController]
[Route("api/workflow/instances")]
public class WorkflowInstancesController : ControllerBase
{
    private readonly IWorkflowService _workflowService;

    public WorkflowInstancesController(IWorkflowService workflowService)
    {
        _workflowService = workflowService;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResult<WorkflowInstanceListItemDto>>> Get([FromQuery] string? status, [FromQuery] string? q, [FromQuery] int page = 1, [FromQuery] int pageSize = 25, CancellationToken cancellationToken = default)
        => Ok(await _workflowService.GetInstancesAsync(status, q, page, pageSize, cancellationToken));

    [HttpPost]
    public async Task<ActionResult<WorkflowInstanceListItemDto>> Create([FromBody] StartWorkflowInstanceRequest request, CancellationToken cancellationToken)
    {
        var result = await _workflowService.StartInstanceAsync(request, cancellationToken);
        return CreatedAtAction(nameof(Get), new { id = result.Id }, result);
    }

    [HttpPost("{id}")]
    public async Task<ActionResult> Action(Guid id, [FromBody] WorkflowActionRequest request, CancellationToken cancellationToken)
    {
        await _workflowService.HandleInstanceActionAsync(id, request, cancellationToken);
        return Accepted();
    }

    [HttpPost("{id}:{actionName}")]
    public async Task<ActionResult> ActionRoute(Guid id, string actionName, CancellationToken cancellationToken)
    {
        await _workflowService.HandleInstanceActionAsync(id, new WorkflowActionRequest(actionName), cancellationToken);
        return Accepted();
    }
}
