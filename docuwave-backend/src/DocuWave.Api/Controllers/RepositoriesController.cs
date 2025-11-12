using DocuWave.Application.Common;
using DocuWave.Application.DTOs;
using DocuWave.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace DocuWave.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RepositoriesController : ControllerBase
{
    private readonly IRepositoryService _repositoryService;

    public RepositoriesController(IRepositoryService repositoryService)
    {
        _repositoryService = repositoryService;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResult<RepositoryListItemDto>>> Get([FromQuery] int page = 1, [FromQuery] int pageSize = 25, CancellationToken cancellationToken = default)
        => Ok(await _repositoryService.GetAsync(page, pageSize, cancellationToken));

    [HttpPost]
    public async Task<ActionResult<RepositoryListItemDto>> Create([FromBody] CreateRepositoryRequest request, CancellationToken cancellationToken)
    {
        var result = await _repositoryService.CreateAsync(request, cancellationToken);
        return CreatedAtAction(nameof(Get), new { id = result.Id }, result);
    }

    [HttpPost("{id}/test")]
    public async Task<ActionResult<RepositoryTestResponse>> Test(Guid id, CancellationToken cancellationToken)
        => Ok(await _repositoryService.TestAsync(id, cancellationToken));

    [HttpGet("jobs")]
    public async Task<ActionResult<PagedResult<RepositoryJobListItemDto>>> Jobs([FromQuery] string? status, [FromQuery] int page = 1, [FromQuery] int pageSize = 25, CancellationToken cancellationToken = default)
        => Ok(await _repositoryService.GetJobsAsync(status, page, pageSize, cancellationToken));
}
