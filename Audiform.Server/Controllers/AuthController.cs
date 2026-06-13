using Application.Interfaces;
using Audiform.Server.Requests;
using Domain.Entities;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity.Data;
using Microsoft.AspNetCore.Mvc;
using RegisterRequest = Audiform.Server.Requests.Registerrequest;

namespace Audiform.Presentation.Server.Controllers
{
    [EnableCors("frontend")]
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly ILogger<AuthController> _logger;

        public AuthController(
            IAuthService authService,
            ILogger<AuthController> logger)
        {
            _authService = authService;
            _logger = logger;
        }

        [HttpPost("register")]
        public async Task<IActionResult> RegisterUser([FromBody] Registerrequest request)
        {
            if (request == null)
            {
                _logger.LogWarning("Registratie mislukt: geen registratiegegevens ontvangen.");
                return BadRequest("Geen registratiegegevens ontvangen.");
            }

            _logger.LogInformation(
                "Registratie poging voor email {Email}",
                request.Email);

            var newuser = new ApplicationUser
            {
                Fullname = request.Fullname,
                Email = request.Email,
                UserName = request.Email
            };

            var result = await _authService.RegisterUserAsync(
                newuser,
                request.Password,
                request.Userrole);

            if (!result.Success)
            {
                _logger.LogWarning(
                    "Registratie mislukt voor email {Email}: {Message}",
                    request.Email,
                    result.Message);

                return BadRequest(result.Message);
            }

            _logger.LogInformation(
                "Registratie succesvol voor email {Email}",
                request.Email);

            return Ok(result.Message);
        }

        [HttpGet("ConfirmEmail")]
        public async Task<IActionResult> ConfirmEmailAsync(string userId, string token)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(userId) || string.IsNullOrWhiteSpace(token))
                {
                    _logger.LogWarning("Email bevestiging mislukt: userId of token ontbreekt.");
                    return BadRequest("Ongeldige bevestigingslink.");
                }

                _logger.LogInformation(
                    "Email bevestiging gestart voor userId {UserId}",
                    userId);

                var result = await _authService.ConfirmEmailAsync(userId, token);

                if (result.Success)
                {
                    _logger.LogInformation(
                        "Email succesvol bevestigd voor userId {UserId}",
                        userId);

                    return Redirect("https://localhost:60942/login?confirmed=true");
                }

                _logger.LogWarning(
                    "Email bevestiging mislukt voor userId {UserId}: {Message}",
                    userId,
                    result.Message);

                return BadRequest(result.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "Onverwachte fout bij email bevestiging voor userId {UserId}",
                    userId);

                return BadRequest("Bevestiging van e-mail mislukt. Probeer het opnieuw.");
            }
        }

        [HttpPost("resend-confirmation")]
        public async Task<IActionResult> ResendConfirmationEmail([FromBody] string email)
        {
            if (string.IsNullOrWhiteSpace(email))
            {
                _logger.LogWarning("Nieuwe bevestigingsmail mislukt: email ontbreekt.");
                return BadRequest("E-mailadres is verplicht.");
            }

            _logger.LogInformation(
                "Nieuwe bevestigingsmail aangevraagd voor {Email}",
                email);

            var result = await _authService.ResendConfirmationEmailAsync(email);

            if (!result.Success)
            {
                _logger.LogWarning(
                    "Versturen bevestigingsmail mislukt voor {Email}: {Message}",
                    email,
                    result.Message);

                return BadRequest(result.Message);
            }

            _logger.LogInformation(
                "Bevestigingsmail succesvol verzonden naar {Email}",
                email);

            return Ok(result.Message);
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest loginrequest)
        {
            if (loginrequest == null)
            {
                _logger.LogWarning("Login mislukt: geen login gegevens ontvangen.");
                return BadRequest(new
                {
                    message = "Geen login gegevens ontvangen."
                });
            }

            _logger.LogInformation(
                "Login poging voor email {Email}",
                loginrequest.Email);

            var result = await _authService.LoginUserAsync(
                loginrequest.Email,
                loginrequest.Password);

            if (!result.Success)
            {
                _logger.LogWarning(
                    "Login mislukt voor email {Email}: {Message}",
                    loginrequest.Email,
                    result.Message);

                return BadRequest(new
                {
                    message = result.Message
                });
            }

            _logger.LogInformation(
                "Login succesvol voor email {Email} met rol {Role}",
                loginrequest.Email,
                result.Role);

            return Ok(new
            {
                message = result.Message,
                role = result.Role
            });
        }

        [HttpPost("Forgot-Password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest forgotPasswordRequest)
        {
            var result = await _authService.ForgotPassword(forgotPasswordRequest.Email);

            if (!result.Success)
            {
                return BadRequest(result.Message);
            }
            return Ok(result.Message);
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordrequest resetPasswordRequest)
        {
            var resetresult = await _authService.ResetPasswordAsync(resetPasswordRequest.Email, resetPasswordRequest.Token, resetPasswordRequest.NewPassword);
            if (!resetresult.Success)
            {
                return BadRequest(resetresult.Message);
            }
            return Ok(resetresult.Message);
        }

        [HttpPost("Logout")]
        public async Task<IActionResult> LogoutAsync()
        {
            var result = await _authService.LogoutAsync();
            if (!result.Success)
            {
                return BadRequest(result.Message);
            }
            return Ok(result.Message);
        }


    }
}