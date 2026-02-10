using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReviewIt.Api.Data;
using ReviewIt.Api.DTOs;

namespace ReviewIt.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CategoriesController : ControllerBase
{
    private readonly AppDbContext _db;

    public CategoriesController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<CategoryListResponse>> GetAll()
    {
        var categories = await _db.Categories
            .Select(c => new CategoryDto(
                c.Id,
                c.Name,
                c.Slug,
                c.Icon,
                c.Items.Count
            ))
            .ToListAsync();
        return Ok(new CategoryListResponse(categories));
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<CategoryDto>> GetById(int id)
    {
        var c = await _db.Categories
            .Where(x => x.Id == id)
            .Select(x => new CategoryDto(x.Id, x.Name, x.Slug, x.Icon, x.Items.Count))
            .FirstOrDefaultAsync();
        if (c == null) return NotFound();
        return Ok(c);
    }
}
