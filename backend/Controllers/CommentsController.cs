using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReviewIt.Api.Data;
using ReviewIt.Api.DTOs;
using ReviewIt.Api.Models;
using ReviewIt.Api.Services;

namespace ReviewIt.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CommentsController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly NotificationService _notifications;

    public CommentsController(AppDbContext db, NotificationService notifications)
    {
        _db = db;
        _notifications = notifications;
    }

    [HttpGet("review/{reviewId:int}")]
    public async Task<ActionResult<IEnumerable<CommentDto>>> GetByReview(int reviewId)
    {
        var comments = await _db.Comments
            .Include(c => c.User)
            .Where(c => c.ReviewId == reviewId)
            .OrderBy(c => c.CreatedAt)
            .Select(c => new CommentDto(c.Id, c.ReviewId, c.UserId, c.User.Name, c.Content, c.CreatedAt))
            .ToListAsync();
        return Ok(comments);
    }

    [Authorize]
    [HttpPost]
    public async Task<ActionResult<CommentDto>> Create([FromBody] CreateCommentRequest req)
    {
        var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value);
        var review = await _db.Reviews.Include(r => r.User).FirstOrDefaultAsync(r => r.Id == req.ReviewId);
        if (review == null) return NotFound("Review not found.");

        var comment = new Comment
        {
            ReviewId = req.ReviewId,
            UserId = userId,
            Content = req.Content
        };
        _db.Comments.Add(comment);
        await _db.SaveChangesAsync();
        await _db.Entry(comment).Reference(c => c.User).LoadAsync();

        await _notifications.NotifyCommentOnReviewAsync(review.UserId, userId, review.Id, comment.Id);

        return CreatedAtAction(nameof(GetByReview), new { reviewId = req.ReviewId }, new CommentDto(
            comment.Id,
            comment.ReviewId,
            comment.UserId,
            comment.User.Name,
            comment.Content,
            comment.CreatedAt
        ));
    }
}
