using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReviewIt.Api.Data;
using ReviewIt.Api.DTOs;
using ReviewIt.Api.Models;

namespace ReviewIt.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class NotificationsController : ControllerBase
{
    private readonly AppDbContext _db;

    public NotificationsController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<NotificationDto>>> GetMy([FromQuery] bool unreadOnly = false)
    {
        var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value);
        var list = await _db.Notifications
            .Where(n => n.UserId == userId && (!unreadOnly || !n.IsRead))
            .OrderByDescending(n => n.CreatedAt)
            .Take(50)
            .Select(n => new
            {
                n.Id,
                n.Type,
                n.RelatedReviewId,
                n.FromUserId,
                n.IsRead,
                n.CreatedAt
            })
            .ToListAsync();

        var fromIds = list.Where(x => x.FromUserId.HasValue).Select(x => x.FromUserId!.Value).Distinct().ToList();
        var users = await _db.Users.Where(u => fromIds.Contains(u.Id)).ToDictionaryAsync(u => u.Id, u => u.Name);
        var reviewIds = list.Where(x => x.RelatedReviewId.HasValue).Select(x => x.RelatedReviewId!.Value).Distinct().ToList();
        var itemIds = reviewIds.Count > 0
            ? await _db.Reviews.Where(r => reviewIds.Contains(r.Id)).ToDictionaryAsync(r => r.Id, r => r.ItemId)
            : new Dictionary<int, int>();

        var dtos = list.Select(n => new NotificationDto(
            n.Id,
            n.Type.ToString(),
            n.RelatedReviewId,
            n.RelatedReviewId.HasValue && itemIds.TryGetValue(n.RelatedReviewId.Value, out var itemId) ? itemId : null,
            n.FromUserId.HasValue ? users.GetValueOrDefault(n.FromUserId.Value) : null,
            n.IsRead,
            n.CreatedAt
        )).ToList();

        return Ok(dtos);
    }

    [HttpPut("{id:int}/read")]
    public async Task<ActionResult> MarkRead(int id)
    {
        var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value);
        var n = await _db.Notifications.FirstOrDefaultAsync(x => x.Id == id && x.UserId == userId);
        if (n == null) return NotFound();
        n.IsRead = true;
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpPut("read-all")]
    public async Task<ActionResult> MarkAllRead()
    {
        var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value);
        await _db.Notifications.Where(n => n.UserId == userId).ExecuteUpdateAsync(s => s.SetProperty(n => n.IsRead, true));
        return NoContent();
    }
}
