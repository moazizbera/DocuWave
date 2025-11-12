using DocuWave.Application.DTOs;
using DocuWave.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace DocuWave.Api.Controllers;

[ApiController]
[Route("api/ai/settings")]
public class AiSettingsController : ControllerBase
{
    private readonly IAiSettingsService _aiSettingsService;

    public AiSettingsController(IAiSettingsService aiSettingsService)
    {
        _aiSettingsService = aiSettingsService;
    }

    [HttpGet]
    public async Task<ActionResult<AiSettingsDto>> Get(CancellationToken cancellationToken)
        => Ok(await _aiSettingsService.GetAsync(cancellationToken));

    [HttpPut]
    public async Task<IActionResult> Put([FromBody] AiSettingsDto dto, CancellationToken cancellationToken)
    {
        await _aiSettingsService.UpdateAsync(dto, cancellationToken);
        return NoContent();
    }

    [HttpPost("test")]
    public async Task<ActionResult<TestAiSettingsResponse>> Test(CancellationToken cancellationToken)
        => Ok(await _aiSettingsService.TestAsync(cancellationToken));
}
