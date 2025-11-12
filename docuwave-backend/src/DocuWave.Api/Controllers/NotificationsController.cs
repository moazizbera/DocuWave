using DocuWave.Application.Common;
using DocuWave.Application.DTOs;
using DocuWave.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace DocuWave.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class NotificationsController : ControllerBase
{
    private readonly INotificationService _notificationService;

    public NotificationsController(INotificationService notificationService)
    {
        _notificationService = notificationService;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResult<NotificationListItemDto>>> Get([FromQuery] DateTime? since, [FromQuery] int page = 1, [FromQuery] int pageSize = 50, CancellationToken cancellationToken = default)
        => Ok(await _notificationService.GetAsync(since, page, pageSize, cancellationToken));

    [HttpPost("{id}/read")]
    public async Task<IActionResult> Read(Guid id, CancellationToken cancellationToken)
    {
        await _notificationService.MarkReadAsync(id, cancellationToken);
        return NoContent();
    }
}
