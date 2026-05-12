using Application;
using Application.Interfaces;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity.Data;
using Microsoft.AspNetCore.Mvc;
using System.Net.WebSockets;

namespace Audiform.Presentation.Server.Controllers
{
    [EnableCors("frontend")]
    [Route("api/[Controller]")]
    public class AuthController : ControllerBase    
    {
        private readonly IAuthService _authService;
        public ApplicationUser user;
        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }
        

        [HttpPost("register")]
        public async Task<IActionResult> RegisterUser([FromBody]RegisterRequest request)
        {
            
            var newuser = new ApplicationUser
            {
                Email = request.Email,
                UserName = request.Email
            };
            var result = await _authService.RegisterUserAsync(newuser,request.Password);

            if(!result.Success)
                return BadRequest(result);
            return Ok(result);

          }

    }
}
