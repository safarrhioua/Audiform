using Application;
using Application.Interfaces;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using System.Net.WebSockets;

namespace Audiform.Presentation.Server.Controllers
{
    [EnableCors("frontend")]
    [Route("api/[Controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        //this is for logging purposes, you can inject it via constructor and use it to log any information or errors in your controller actions
        private readonly ILogger<AuthController> _logger;

        public AuthController(IAuthService authService, ILogger<AuthController> logger)
        {
            _authService = authService;
            _logger = logger;

        }

        //[HttpGet]
        //public IActionResult Register()
        //{
        //    return View();

        //}

        [HttpPost("register")]
        public async Task<IActionResult> RegisterUser([FromBody] RegisterRequest registerrequest)
        {

            var newuser = new ApplicationUser
            {
                Email = registerrequest.Email,
                UserName = registerrequest.Email
            };
            var result = await _authService.RegisterUserAsync(newuser, registerrequest.Password);

            if (!result.Success)
                return BadRequest(result);
            return Ok(result);

        }
    

    [HttpGet]
        public async Task<IActionResult> ConfirmEmailAsync(string userId, string token)
        {
            try
            {
                if (string.IsNullOrEmpty(userId) || string.IsNullOrEmpty(token))
                {
                    return BadRequest("Invalid confirmation link.");
                }

                var result = await _authService.ConfirmEmailAsync(userId, token);

                if (!result.Success)
                {
                    return BadRequest("Email confirmation failed. Please try again or contact support.");
                }

                
            }
            catch (Exception ex)
            {
                //this will log the exception details along with the userId for which the confirmation failed, you can also log the token if needed, but be cautious as it may contain sensitive information
                _logger.LogError(ex, "Error confirming email for userId: {UserId}", userId);
              
            }
            return Ok("Email confirmed successfully.");

        }

        [HttpPost("login")]
          public async Task<IActionResult> LoginUser([FromBody] LoginRequest loginrequest)
        {
            var User = new ApplicationUser
            {
                Email = loginrequest.Email,
                   
            };

            var result = await _authService.LoginUserAsync(User, loginrequest.Password);

            if (!result.Success)
                return BadRequest(result);
            return Ok(result);
        }


    } 
}
