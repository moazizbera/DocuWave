using DocuWave.Application.Common;
using DocuWave.Application.DTOs;
using DocuWave.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace DocuWave.Api.Controllers;

[ApiController]
[Route("api/schemes")]
[Route("api/scheme")]
public class SchemesController : ControllerBase
{
    private readonly ISchemeService _schemeService;

    public SchemesController(ISchemeService schemeService)
    {
        _schemeService = schemeService;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResult<SchemeListItemDto>>> Get([FromQuery] int page = 1, [FromQuery] int pageSize = 25, CancellationToken cancellationToken = default)
        => Ok(await _schemeService.GetAsync(page, pageSize, cancellationToken));

    [HttpPost]
    public async Task<ActionResult<SchemeListItemDto>> Create([FromBody] CreateSchemeRequest request, CancellationToken cancellationToken)
    {
        var result = await _schemeService.CreateAsync(request, cancellationToken);
        return CreatedAtAction(nameof(Get), new { id = result.Id }, result);
    }
}
