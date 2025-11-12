using DocuWave.Application.DTOs;
using DocuWave.Application.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace DocuWave.Api.Controllers;

[ApiController]
[Route("api/org/structure")]
public class OrgStructureController : ControllerBase
{
    private readonly IOrgService _orgService;

    public OrgStructureController(IOrgService orgService)
    {
        _orgService = orgService;
    }

    [HttpGet]
    public async Task<ActionResult<OrgStructureDto>> Get(CancellationToken cancellationToken)
        => Ok(await _orgService.GetAsync(cancellationToken));

    [HttpPost("import")]
    public async Task<ActionResult<OrgImportResponse>> Import([FromForm] IFormFile file, CancellationToken cancellationToken)
        => Accepted(await _orgService.ImportAsync(file, cancellationToken));
}
