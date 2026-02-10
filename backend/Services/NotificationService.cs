using ReviewIt.Api.Data;
using ReviewIt.Api.Models;

namespace ReviewIt.Api.Services;

public class NotificationService
{
    private readonly AppDbContext _db;

    public NotificationService(AppDbContext db)
    {
        _db = db;
    }

    public async Task NotifyCommentOnReviewAsync(int reviewAuthorId, int fromUserId, int reviewId, int? commentId = null)
    {
        if (reviewAuthorId == fromUserId) return;
        _db.Notifications.Add(new Notification
        {
            UserId = reviewAuthorId,
            Type = NotificationType.CommentOnReview,
            RelatedReviewId = reviewId,
            RelatedCommentId = commentId,
            FromUserId = fromUserId
        });
        await _db.SaveChangesAsync();
    }

    public async Task NotifyThumbUpAsync(int reviewAuthorId, int fromUserId, int reviewId)
    {
        if (reviewAuthorId == fromUserId) return;
        _db.Notifications.Add(new Notification
        {
            UserId = reviewAuthorId,
            Type = NotificationType.ThumbUpOnReview,
            RelatedReviewId = reviewId,
            FromUserId = fromUserId
        });
        await _db.SaveChangesAsync();
    }

    public async Task NotifyThumbDownAsync(int reviewAuthorId, int fromUserId, int reviewId)
    {
        if (reviewAuthorId == fromUserId) return;
        _db.Notifications.Add(new Notification
        {
            UserId = reviewAuthorId,
            Type = NotificationType.ThumbDownOnReview,
            RelatedReviewId = reviewId,
            FromUserId = fromUserId
        });
        await _db.SaveChangesAsync();
    }
}
