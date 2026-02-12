using System.Text.Json.Serialization;

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

public record DeleteNotificationsRequest([property: JsonPropertyName("ids")] int[] Ids);

