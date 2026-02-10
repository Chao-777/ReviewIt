namespace ReviewIt.Api.Models;

public class Review
{
    public int Id { get; set; }
    public int ItemId { get; set; }
    public int UserId { get; set; }
    public int Stars { get; set; } // 0-5
    public string Content { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Item Item { get; set; } = null!;
    public User User { get; set; } = null!;
    public ICollection<Comment> Comments { get; set; } = new List<Comment>();
    public ICollection<ReviewReaction> Reactions { get; set; } = new List<ReviewReaction>();
}
