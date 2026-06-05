using Application.Interfaces;
using Audiform.Server.Requests;
using Domain.Entities;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Audiform.Server.Controllers
{
    [EnableCors("frontend")]
    [Route("api/[Controller]")]
    public class UserManagementController : ControllerBase
    {
        private readonly IUserManagement _usermanagement;

        public UserManagementController(IUserManagement usermanagement)
        {
            _usermanagement = usermanagement;
        }
        [HttpPut("updateprofile")]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfile updateprofile)
        
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized("Gebruiker is niet ingelogd.");
            }

            var user =new ApplicationUser
            {
                Id = userId,
                Fullname = updateprofile.Fullname,
                Email = updateprofile.Email,
                PhoneNumber = updateprofile.PhoneNumber,
                Dateofbirth = updateprofile.Dateofbirth
            };

            var result = await _usermanagement.UpdateProfileUserAsync(user);
            if(!result.Success)
            {
                return BadRequest(result.Message);
            }
            return Ok(result.Message);
        }

        [HttpGet("GetUser")]

        public async Task<IActionResult> GetUser()
        {
            var userId= User.FindFirstValue(ClaimTypes.NameIdentifier);
            if(string.IsNullOrEmpty(userId))
            {
                return Unauthorized("Gebruiker is niet ingelogd.");
            }

            var user = await _usermanagement.GetUserByIdAsync(userId);
            if(user == null) 
                return NotFound("Gebruiker niet gevonden.");

            return Ok(new
            {
                fullname=user.Fullname,
                email=user.Email,
                phoneNumber=user.PhoneNumber,
                dateofbirth=user.Dateofbirth
            }
            );


        }
    }
}
