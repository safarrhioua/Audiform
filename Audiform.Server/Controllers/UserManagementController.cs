using Application.Interfaces;
using Audiform.Server.Requests;
using Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Audiform.Server.Controllers
{
    [Authorize]
    [EnableCors("frontend")]
    [Route("api/[controller]")]
    [ApiController]
    public class UserManagementController : ControllerBase
    {
        private readonly IUserManagement _usermanagement;
        private readonly ILogger<UserManagementController> _logger;

        public UserManagementController(
            IUserManagement usermanagement,
            ILogger<UserManagementController> logger)
        {
            _usermanagement = usermanagement;
            _logger = logger;
        }

        [HttpPut("updateprofile")]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfile updateprofile)
        {
            if (updateprofile == null)
            {
                _logger.LogWarning("Profiel bijwerken mislukt: geen profielgegevens ontvangen.");
                return BadRequest("Geen profielgegevens ontvangen.");
            }

            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(userId))
            {
                _logger.LogWarning("Profiel bijwerken mislukt: gebruiker is niet ingelogd.");
                return Unauthorized("Gebruiker is niet ingelogd.");
            }

            _logger.LogInformation(
                "Gebruiker {UserId} probeert profiel bij te werken.",
                userId);

            var user = new ApplicationUser
            {
                Id = userId,
                Fullname = updateprofile.Fullname,
                Email = updateprofile.Email,
                PhoneNumber = updateprofile.PhoneNumber,
                Dateofbirth = updateprofile.Dateofbirth
            };

            var result = await _usermanagement.UpdateProfileUserAsync(user);

            if (!result.Success)
            {
                _logger.LogWarning(
                    "Profiel bijwerken mislukt voor gebruiker {UserId}: {Message}",
                    userId,
                    result.Message);

                return BadRequest(result.Message);
            }

            _logger.LogInformation(
                "Profiel succesvol bijgewerkt voor gebruiker {UserId}.",
                userId);

            return Ok(result.Message);
        }

        [HttpGet("GetUser")]
        public async Task<IActionResult> GetUser()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(userId))
            {
                _logger.LogWarning("Gebruiker ophalen mislukt: gebruiker is niet ingelogd.");
                return Unauthorized("Gebruiker is niet ingelogd.");
            }

            _logger.LogInformation(
                "Gebruiker {UserId} vraagt profielgegevens op.",
                userId);

            var user = await _usermanagement.GetUserByIdAsync(userId);

            if (user == null)
            {
                _logger.LogWarning(
                    "Gebruiker {UserId} niet gevonden tijdens ophalen profiel.",
                    userId);

                return NotFound("Gebruiker niet gevonden.");
            }

            return Ok(new
            {
                fullname = user.Fullname,
                email = user.Email,
                phoneNumber = user.PhoneNumber,
                dateofbirth = user.Dateofbirth
            });
        }
    }
}