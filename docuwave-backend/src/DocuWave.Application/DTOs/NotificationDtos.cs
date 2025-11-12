namespace DocuWave.Application.DTOs;

public record NotificationListItemDto(Guid Id, string Type, string Title, string Body, DateTime CreatedAt, bool IsRead);
