using DocuWave.Application.DTOs;
using DocuWave.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace DocuWave.Api.Controllers;

[ApiController]
[Route("api/analytics")]
public class AnalyticsController : ControllerBase
{
    private readonly IAnalyticsService _analyticsService;

    public AnalyticsController(IAnalyticsService analyticsService)
    {
        _analyticsService = analyticsService;
    }

    [HttpGet("documents")]
    public async Task<ActionResult<DocumentAnalyticsDto>> Documents([FromQuery] DateTime? from, [FromQuery] DateTime? to, [FromQuery] Guid? schemeId, CancellationToken cancellationToken)
        => Ok(await _analyticsService.GetDocumentAnalyticsAsync(from, to, schemeId, cancellationToken));

    [HttpGet("workflows")]
    public async Task<ActionResult<WorkflowAnalyticsDto>> Workflows([FromQuery] DateTime? from, [FromQuery] DateTime? to, CancellationToken cancellationToken)
        => Ok(await _analyticsService.GetWorkflowAnalyticsAsync(from, to, cancellationToken));

    [HttpGet("users")]
    public async Task<ActionResult<UserAnalyticsDto>> Users([FromQuery] DateTime? from, [FromQuery] DateTime? to, CancellationToken cancellationToken)
        => Ok(await _analyticsService.GetUserAnalyticsAsync(from, to, cancellationToken));

    [HttpPost("export")]
    public async Task<ActionResult<AnalyticsExportResponse>> Export([FromBody] AnalyticsExportRequest request, CancellationToken cancellationToken)
        => Accepted(await _analyticsService.ExportAsync(request, cancellationToken));
}
