using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using ReviewIt.Api.Data;
using ReviewIt.Api.Models;

namespace ReviewIt.Api.Services;

public class AuthService
{
    private readonly AppDbContext _db;
    private readonly IConfiguration _config;

    public AuthService(AppDbContext db, IConfiguration config)
    {
        _db = db;
        _config = config;
    }

    /// <summary>
    /// Returns (user, null) on success, or (null, errorMessage) when registration should be declined.
    /// </summary>
    public async Task<(User? user, string? errorMessage)> RegisterAsync(string name, string email, string phone, string password)
    {
        if (string.IsNullOrWhiteSpace(phone))
            return (null, "Phone number is required.");
        if (await _db.Users.AnyAsync(u => u.Email == email))
            return (null, "Email already registered.");
        if (await _db.Users.AnyAsync(u => u.Phone == phone))
            return (null, "This phone number is already in use. Please use a different number.");
        var user = new User
        {
            Name = name,
            Email = email,
            Phone = phone.Trim(),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(password)
        };
        _db.Users.Add(user);
        await _db.SaveChangesAsync();
        return (user, null);
    }

    public async Task<User?> LoginAsync(string email, string password)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == email);
        if (user == null || !BCrypt.Net.BCrypt.Verify(password, user.PasswordHash))
            return null;
        return user;
    }

    public string GenerateJwt(User user)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Name, user.Name)
        };
        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"],
            audience: _config["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(int.Parse(_config["Jwt:ExpiryMinutes"] ?? "60")),
            signingCredentials: creds
        );
        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
