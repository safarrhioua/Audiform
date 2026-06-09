using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Npgsql;

namespace Audiform.Server.Controllers;

[ApiController]
[ApiExplorerSettings(IgnoreApi = false)]
[Route("dev-login")]
public sealed class DevLoginController(
    IWebHostEnvironment environment,
    NpgsqlDataSource dataSource) : ControllerBase
{
    [HttpPost]
    public async Task<IActionResult> Login(
        DevLoginRequest request,
        CancellationToken cancellationToken)
    {
        if (!environment.IsDevelopment())
        {
            return NotFound();
        }

        if (string.IsNullOrWhiteSpace(request.Email))
        {
            return BadRequest("Email is verplicht.");
        }

        var userId = await GetUserIdByEmailAsync(request.Email, cancellationToken);

        if (userId is null)
        {
            return NotFound($"Geen gebruiker gevonden met email: {request.Email}");
        }

        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, userId),
            new(ClaimTypes.Email, request.Email)
        };

        var identity = new ClaimsIdentity(
            claims,
            IdentityConstants.ApplicationScheme
        );

        await HttpContext.SignInAsync(
            IdentityConstants.ApplicationScheme,
            new ClaimsPrincipal(identity)
        );

        return Ok(new
        {
            userId,
            email = request.Email,
            message = "Dev login gelukt. De authentication cookie is aangemaakt."
        });
    }

    private async Task<string?> GetUserIdByEmailAsync(
        string email,
        CancellationToken cancellationToken)
    {
        const string sql = """
            SELECT "Id"
            FROM "AspNetUsers"
            WHERE "Email" = @email
            LIMIT 1;
            """;

        await using var command = dataSource.CreateCommand(sql);
        command.Parameters.AddWithValue("email", email);

        var result = await command.ExecuteScalarAsync(cancellationToken);

        return result is null or DBNull ? null : (string)result;
    }
}

public sealed record DevLoginRequest(string? Email = null);