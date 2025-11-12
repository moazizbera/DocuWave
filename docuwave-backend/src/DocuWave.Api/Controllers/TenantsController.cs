using DocuWave.Application.Common;
using DocuWave.Application.DTOs;
using DocuWave.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace DocuWave.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TenantsController : ControllerBase
{
    private readonly ITenantService _tenantService;

    public TenantsController(ITenantService tenantService)
    {
        _tenantService = tenantService;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResult<TenantListItemDto>>> Get([FromQuery] string? search, [FromQuery] int page = 1, [FromQuery] int pageSize = 25, CancellationToken cancellationToken = default)
        => Ok(await _tenantService.SearchAsync(search, page, pageSize, cancellationToken));

    [HttpPost]
    public async Task<ActionResult<TenantDetailDto>> Create([FromBody] CreateTenantRequest request, CancellationToken cancellationToken)
    {
        var result = await _tenantService.CreateAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<TenantDetailDto>> GetById(Guid id, CancellationToken cancellationToken)
        => Ok(await _tenantService.GetAsync(id, cancellationToken));

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateTenantRequest request, CancellationToken cancellationToken)
    {
        await _tenantService.UpdateAsync(id, request, cancellationToken);
        return NoContent();
    }
}
