namespace ReviewIt.Api.Models;

public class ReviewReaction
{
    public int Id { get; set; }
    public int ReviewId { get; set; }
    public int UserId { get; set; }
    public bool IsUp { get; set; } // true = thumb up, false = thumb down

    public Review Review { get; set; } = null!;
    public User User { get; set; } = null!;
}
