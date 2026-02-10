namespace ReviewIt.Api.DTOs;

public record NotificationDto(
    int Id,
    string Type,
    int? RelatedReviewId,
    int? RelatedItemId,
    string? FromUserName,
    bool IsRead,
    DateTime CreatedAt
);

