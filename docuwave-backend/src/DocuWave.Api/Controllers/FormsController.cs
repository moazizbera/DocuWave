using DocuWave.Application.Common;
using DocuWave.Application.DTOs;
using DocuWave.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace DocuWave.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FormsController : ControllerBase
{
    private readonly IFormService _formService;

    public FormsController(IFormService formService)
    {
        _formService = formService;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResult<FormListItemDto>>> Get([FromQuery] int page = 1, [FromQuery] int pageSize = 25, CancellationToken cancellationToken = default)
        => Ok(await _formService.GetAsync(page, pageSize, cancellationToken));

    [HttpPost]
    public async Task<ActionResult<FormListItemDto>> Create([FromBody] CreateFormRequest request, CancellationToken cancellationToken)
    {
        var result = await _formService.CreateAsync(request, cancellationToken);
        return CreatedAtAction(nameof(Get), new { id = result.Id }, result);
    }

    [HttpPost("{id}/publish")]
    public async Task<ActionResult<PublishFormResponse>> Publish(Guid id, CancellationToken cancellationToken)
        => Accepted(await _formService.PublishAsync(id, cancellationToken));
}
