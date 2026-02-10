using Microsoft.AspNetCore.Mvc;
using ReviewIt.Api.DTOs;
using ReviewIt.Api.Services;

namespace ReviewIt.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AuthService _auth;

    public AuthController(AuthService auth)
    {
        _auth = auth;
    }

    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register([FromBody] RegisterRequest req)
    {
        var user = await _auth.RegisterAsync(req.Name, req.Email, req.Phone, req.Password);
        if (user == null)
            return BadRequest("Email already registered.");
        var token = _auth.GenerateJwt(user);
        return Ok(new AuthResponse(user.Id, user.Name, user.Email, token));
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest req)
    {
        var user = await _auth.LoginAsync(req.Email, req.Password);
        if (user == null)
            return Unauthorized("Invalid email or password.");
        var token = _auth.GenerateJwt(user);
        return Ok(new AuthResponse(user.Id, user.Name, user.Email, token));
    }
}
