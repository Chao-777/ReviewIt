using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReviewIt.Api.Data;
using ReviewIt.Api.DTOs;
using ReviewIt.Api.Models;

namespace ReviewIt.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ItemsController : ControllerBase
{
    private readonly AppDbContext _db;

    public ItemsController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ItemSummaryDto>>> GetItems(
        [FromQuery] int? categoryId,
        [FromQuery] string? search,
        [FromQuery] string sort = "latest",
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var q = _db.Items
            .Include(i => i.Category)
            .Include(i => i.Reviews)
            .AsQueryable();

        if (categoryId.HasValue)
            q = q.Where(i => i.CategoryId == categoryId.Value);
        if (!string.IsNullOrWhiteSpace(search))
            q = q.Where(i => i.Name.ToLower().Contains(search.ToLower()) || (i.Description != null && i.Description.ToLower().Contains(search.ToLower())));

        var items = await q.ToListAsync();
        var summaries = items.Select(i =>
        {
            var reviews = i.Reviews.ToList();
            var avg = reviews.Count > 0 ? reviews.Average(r => r.Stars) : 0;
            var topReview = reviews.OrderByDescending(r => r.CreatedAt).FirstOrDefault();
            var snippet = topReview?.Content?.Length > 100 ? topReview.Content[..100] + "..." : topReview?.Content;
            return new ItemSummaryDto(
                i.Id,
                i.Name,
                i.Description,
                i.ImageUrl,
                i.Category.Name,
                Math.Round(avg, 1),
                reviews.Count,
                snippet,
                i.CreatedAt
            );
        }).ToList();

        summaries = sort.ToLower() switch
        {
            "best" => summaries.OrderByDescending(s => s.AverageStars).ThenByDescending(s => s.ReviewCount).ToList(),
            "worst" => summaries.OrderBy(s => s.AverageStars).ThenByDescending(s => s.ReviewCount).ToList(),
            "mostreviews" => summaries.OrderByDescending(s => s.ReviewCount).ToList(),
            "latest" => summaries.OrderByDescending(s => s.CreatedAt).ToList(),
            _ => summaries.OrderByDescending(s => s.CreatedAt).ToList()
        };

        var skip = (page - 1) * pageSize;
        return Ok(summaries.Skip(skip).Take(pageSize).ToList());
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<ItemDetailDto>> GetById(int id)
    {
        var item = await _db.Items
            .Include(i => i.Category)
            .Include(i => i.CreatedByUser)
            .Include(i => i.Reviews)
            .FirstOrDefaultAsync(i => i.Id == id);
        if (item == null) return NotFound();

        var avg = item.Reviews.Count > 0 ? item.Reviews.Average(r => r.Stars) : 0;
        var dto = new ItemDetailDto(
            item.Id,
            item.Name,
            item.Description,
            item.ImageUrl,
            item.Category.Name,
            item.CategoryId,
            Math.Round(avg, 1),
            item.Reviews.Count,
            item.CreatedByUser.Name,
            item.CreatedAt
        );
        return Ok(dto);
    }

    [Authorize]
    [HttpPost]
    public async Task<ActionResult<ItemDetailDto>> Create([FromBody] CreateItemRequest req)
    {
        var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value);
        var category = await _db.Categories.FindAsync(req.CategoryId);
        if (category == null) return BadRequest("Invalid category.");

        var item = new Item
        {
            Name = req.Name,
            Description = req.Description,
            ImageUrl = req.ImageUrl,
            CategoryId = req.CategoryId,
            CreatedByUserId = userId
        };
        _db.Items.Add(item);
        await _db.SaveChangesAsync();
        await _db.Entry(item).Reference(i => i.Category).LoadAsync();
        await _db.Entry(item).Reference(i => i.CreatedByUser).LoadAsync();

        return CreatedAtAction(nameof(GetById), new { id = item.Id }, new ItemDetailDto(
            item.Id,
            item.Name,
            item.Description,
            item.ImageUrl,
            item.Category.Name,
            item.CategoryId,
            0,
            0,
            item.CreatedByUser.Name,
            item.CreatedAt
        ));
    }
}
