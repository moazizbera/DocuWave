using DocuWave.Application.Common;
using DocuWave.Application.DTOs;
using DocuWave.Application.Interfaces;
using DocuWave.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;

namespace DocuWave.Infrastructure.Services;

public sealed class NotificationService : INotificationService
{
    private readonly AppDbContext _dbContext;
    private readonly ITenantProvider _tenantProvider;
    private readonly INotificationHubDispatcher _hubDispatcher;

    public NotificationService(AppDbContext dbContext, ITenantProvider tenantProvider, INotificationHubDispatcher hubDispatcher)
    {
        _dbContext = dbContext;
        _tenantProvider = tenantProvider;
        _hubDispatcher = hubDispatcher;
    }

    public async Task<PagedResult<NotificationListItemDto>> GetAsync(DateTime? since, int page, int pageSize, CancellationToken cancellationToken)
    {
        var tenantId = _tenantProvider.GetTenantId();
        var query = _dbContext.Notifications.AsNoTracking().Where(x => x.TenantId == tenantId);
        if (since.HasValue)
        {
            query = query.Where(x => x.CreatedAt >= since.Value);
        }

        var total = await query.CountAsync(cancellationToken);
        var items = await query
            .OrderByDescending(x => x.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(x => new NotificationListItemDto(x.Id, x.Type, x.Title, x.Body, x.CreatedAt, x.IsRead))
            .ToListAsync(cancellationToken);

        return new PagedResult<NotificationListItemDto>
        {
            Items = items,
            Total = total,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task MarkReadAsync(Guid id, CancellationToken cancellationToken)
    {
        var tenantId = _tenantProvider.GetTenantId();
        var notification = await _dbContext.Notifications.FirstOrDefaultAsync(x => x.Id == id && x.TenantId == tenantId, cancellationToken);
        if (notification is null)
        {
            throw new KeyNotFoundException("Notification not found");
        }

        notification.IsRead = true;
        await _dbContext.SaveChangesAsync(cancellationToken);
        await _hubDispatcher.PublishBulkUpdateAsync(new[] { id }, true, cancellationToken);
    }

    public async Task PublishSystemNotificationAsync(string tenantId, string type, string title, string body, CancellationToken cancellationToken)
    {
        TenantContext.SetTenant(tenantId);
        var notification = new Domain.Entities.Notification
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            Type = type,
            Title = title,
            Body = body,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = "system"
        };

        await _dbContext.Notifications.AddAsync(notification, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);
        await _hubDispatcher.PublishNewAsync(notification.Id, notification.Type, notification.Title, notification.Body, notification.CreatedAt, cancellationToken);
    }
}
