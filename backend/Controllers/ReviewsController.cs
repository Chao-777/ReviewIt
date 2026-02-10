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
public class ReviewsController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly NotificationService _notifications;

    public ReviewsController(AppDbContext db, NotificationService notifications)
    {
        _db = db;
        _notifications = notifications;
    }

    private int? GetCurrentUserId()
    {
        var id = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        return id != null ? int.Parse(id) : null;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ReviewCardDto>>> GetByItem(
        [FromQuery] int itemId,
        [FromQuery] string sort = "thumbs",
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var userId = GetCurrentUserId();
        var reviews = await _db.Reviews
            .Include(r => r.User)
            .Include(r => r.Reactions)
            .Include(r => r.Comments)
            .Where(r => r.ItemId == itemId)
            .ToListAsync();

        var dtos = reviews.Select(r =>
        {
            var up = r.Reactions.Count(x => x.IsUp);
            var down = r.Reactions.Count(x => !x.IsUp);
            var current = userId.HasValue ? r.Reactions.FirstOrDefault(x => x.UserId == userId) : null;
            return new ReviewCardDto(
                r.Id,
                r.ItemId,
                r.UserId,
                r.User.Name,
                r.Stars,
                r.Content,
                r.CreatedAt,
                up,
                down,
                r.Comments.Count,
                current == null ? null : (current.IsUp ? 1 : -1)
            );
        }).ToList();

        dtos = sort.ToLower() switch
        {
            "latest" => dtos.OrderByDescending(d => d.CreatedAt).ToList(),
            "oldest" => dtos.OrderBy(d => d.CreatedAt).ToList(),
            "best" => dtos.OrderByDescending(d => d.Stars).ThenByDescending(d => d.ThumbsUp).ToList(),
            "worst" => dtos.OrderBy(d => d.Stars).ThenBy(d => d.ThumbsDown).ToList(),
            "thumbs" or "mostthumbs" => dtos.OrderByDescending(d => d.ThumbsUp - d.ThumbsDown).ToList(),
            _ => dtos.OrderByDescending(d => d.ThumbsUp - d.ThumbsDown).ToList()
        };

        var skip = (page - 1) * pageSize;
        return Ok(dtos.Skip(skip).Take(pageSize).ToList());
    }

    [Authorize]
    [HttpPost]
    public async Task<ActionResult<ReviewCardDto>> Create([FromBody] CreateReviewRequest req)
    {
        var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value);
        if (req.Stars < 0 || req.Stars > 5)
            return BadRequest("Stars must be between 0 and 5.");
        var item = await _db.Items.FindAsync(req.ItemId);
        if (item == null) return NotFound("Item not found.");

        var review = new Review
        {
            ItemId = req.ItemId,
            UserId = userId,
            Stars = req.Stars,
            Content = req.Content
        };
        _db.Reviews.Add(review);
        await _db.SaveChangesAsync();
        await _db.Entry(review).Reference(r => r.User).LoadAsync();

        return CreatedAtAction(nameof(GetByItem), new { itemId = req.ItemId }, new ReviewCardDto(
            review.Id,
            review.ItemId,
            review.UserId,
            review.User.Name,
            review.Stars,
            review.Content,
            review.CreatedAt,
            0,
            0,
            0,
            null
        ));
    }

    [Authorize]
    [HttpPost("reaction")]
    public async Task<ActionResult> ToggleReaction([FromBody] ReactionRequest req)
    {
        var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value);
        var review = await _db.Reviews.Include(r => r.Reactions).FirstOrDefaultAsync(r => r.Id == req.ReviewId);
        if (review == null) return NotFound();

        var existing = review.Reactions.FirstOrDefault(x => x.UserId == userId);
        if (existing != null)
        {
            if (existing.IsUp == req.IsUp)
            {
                _db.ReviewReactions.Remove(existing);
                await _db.SaveChangesAsync();
                return Ok(new { thumbsUp = review.Reactions.Count(x => x.IsUp) - (existing.IsUp ? 1 : 0), thumbsDown = review.Reactions.Count(x => !x.IsUp) - (existing.IsUp ? 0 : 1), removed = true });
            }
            existing.IsUp = req.IsUp;
        }
        else
        {
            _db.ReviewReactions.Add(new ReviewReaction { ReviewId = req.ReviewId, UserId = userId, IsUp = req.IsUp });
        }

        await _db.SaveChangesAsync();
        if (req.IsUp)
            await _notifications.NotifyThumbUpAsync(review.UserId, userId, review.Id);
        else
            await _notifications.NotifyThumbDownAsync(review.UserId, userId, review.Id);

        await _db.Entry(review).Collection(r => r.Reactions).LoadAsync();
        return Ok(new { thumbsUp = review.Reactions.Count(x => x.IsUp), thumbsDown = review.Reactions.Count(x => !x.IsUp), removed = false });
    }
}
