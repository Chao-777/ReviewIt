namespace ReviewIt.Api.DTOs;

public record ReviewCardDto(
    int Id,
    int ItemId,
    int UserId,
    string UserName,
    int Stars,
    string Content,
    DateTime CreatedAt,
    int ThumbsUp,
    int ThumbsDown,
    int CommentCount,
    int? CurrentUserReaction
);

public record CreateReviewRequest(int ItemId, int Stars, string Content);
public record CommentDto(int Id, int ReviewId, int UserId, string UserName, string Content, DateTime CreatedAt);
public record CreateCommentRequest(int ReviewId, string Content);
public record ReactionRequest(int ReviewId, bool IsUp);
