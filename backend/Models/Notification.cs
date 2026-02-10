namespace ReviewIt.Api.Models;

public enum NotificationType
{
    CommentOnReview,
    ThumbUpOnReview,
    ThumbDownOnReview,
    ReplyOnComment
}

public class Notification
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public NotificationType Type { get; set; }
    public int? RelatedReviewId { get; set; }
    public int? RelatedCommentId { get; set; }
    public int? FromUserId { get; set; }
    public bool IsRead { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public User User { get; set; } = null!;
}
