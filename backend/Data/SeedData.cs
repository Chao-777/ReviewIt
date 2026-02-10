using Microsoft.EntityFrameworkCore;
using ReviewIt.Api.Models;

namespace ReviewIt.Api.Data;

public static class SeedData
{
    public static async Task Initialize(AppDbContext db)
    {
        if (await db.Categories.AnyAsync())
            return;

        var categories = new[]
        {
            new Category { Name = "People", Slug = "people", Icon = "👤" },
            new Category { Name = "Product", Slug = "product", Icon = "📦" },
            new Category { Name = "Book", Slug = "book", Icon = "📚" },
            new Category { Name = "Food", Slug = "food", Icon = "🍽️" },
            new Category { Name = "Movie", Slug = "movie", Icon = "🎬" },
            new Category { Name = "Character", Slug = "character", Icon = "🦸" },
            new Category { Name = "Place", Slug = "place", Icon = "📍" },
            new Category { Name = "Game", Slug = "game", Icon = "🎮" }
        };
        db.Categories.AddRange(categories);
        await db.SaveChangesAsync();

        var demoUser = new User
        {
            Name = "Demo User",
            Email = "demo@reviewit.com",
            Phone = "+1234567890",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Demo123!")
        };
        db.Users.Add(demoUser);
        await db.SaveChangesAsync();

        var catIds = await db.Categories.ToDictionaryAsync(c => c.Slug, c => c.Id);
        var items = new List<Item>
        {
            new() { Name = "Pizza Margherita", Description = "Classic Italian pizza with tomato and mozzarella.", CategoryId = catIds["food"], CreatedByUserId = demoUser.Id, ImageUrl = "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400" },
            new() { Name = "The Great Gatsby", Description = "A novel by F. Scott Fitzgerald.", CategoryId = catIds["book"], CreatedByUserId = demoUser.Id, ImageUrl = "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400" },
            new() { Name = "iPhone 15", Description = "Latest Apple smartphone.", CategoryId = catIds["product"], CreatedByUserId = demoUser.Id, ImageUrl = "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400" },
            new() { Name = "Inception", Description = "Mind-bending sci-fi film by Christopher Nolan.", CategoryId = catIds["movie"], CreatedByUserId = demoUser.Id, ImageUrl = "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400" },
            new() { Name = "Sherlock Holmes", Description = "Famous detective character by Arthur Conan Doyle.", CategoryId = catIds["character"], CreatedByUserId = demoUser.Id, ImageUrl = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400" },
            new() { Name = "Sushi", Description = "Japanese cuisine with vinegared rice and seafood.", CategoryId = catIds["food"], CreatedByUserId = demoUser.Id, ImageUrl = "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400" },
            new() { Name = "1984", Description = "Dystopian novel by George Orwell.", CategoryId = catIds["book"], CreatedByUserId = demoUser.Id, ImageUrl = "https://images.unsplash.com/photo-1589998059171-988d887df646?w=400" },
            new() { Name = "Tokyo", Description = "Capital of Japan, vibrant megacity.", CategoryId = catIds["place"], CreatedByUserId = demoUser.Id, ImageUrl = "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400" }
        };
        db.Items.AddRange(items);
        await db.SaveChangesAsync();

        var itemList = await db.Items.Take(4).ToListAsync();
        foreach (var item in itemList)
        {
            db.Reviews.Add(new Review
            {
                ItemId = item.Id,
                UserId = demoUser.Id,
                Stars = new Random().Next(3, 6),
                Content = "This is a sample review. Really enjoyed it!",
                CreatedAt = DateTime.UtcNow.AddDays(-new Random().Next(0, 7))
            });
        }
        await db.SaveChangesAsync();
    }
}
