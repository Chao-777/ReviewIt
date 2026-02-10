namespace ReviewIt.Api.DTOs;

public record ItemSummaryDto(
    int Id,
    string Name,
    string? Description,
    string? ImageUrl,
    string CategoryName,
    double AverageStars,
    int ReviewCount,
    string? MostPopularReviewSnippet,
    DateTime CreatedAt
);

public record ItemDetailDto(
    int Id,
    string Name,
    string? Description,
    string? ImageUrl,
    string CategoryName,
    int CategoryId,
    double AverageStars,
    int ReviewCount,
    string CreatedByUserName,
    DateTime CreatedAt
);

public record CreateItemRequest(string Name, string? Description, string? ImageUrl, int CategoryId);
