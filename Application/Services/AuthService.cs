using Application.Interfaces;
using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Text;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;

namespace Application.Services
{
    public class AuthService : IAuthService
    {
        private readonly UserManager<ApplicationUser> _usermanager;
        private readonly SignInManager<ApplicationUser> _signinmanager;
        private readonly IConfiguration _config;

        public AuthService(UserManager<ApplicationUser> usermanager, SignInManager<ApplicationUser> signinmanager, IConfiguration config)
        {
            _usermanager = usermanager;
            _signinmanager = signinmanager;
            _config = config;
        }


        public async Task<AuthResult> RegisterUserAsync(ApplicationUser user, string password)
        {
            
           var result = await _usermanager.CreateAsync(user, password);

            if (result.Succeeded)
                return AuthResult.SuccessResult(true, "You are registered!");
            else
            {
                return AuthResult.FailedResult(false, string.Join("; ", result.Errors.Select(e => e.Description)));
            }
        }
        public async Task<AuthResult> LoginUserAsync(ApplicationUser user)
        {
            var loggedinUser = await _usermanager.FindByEmailAsync(user.Email);

            if (loggedinUser == null)
                return AuthResult.FailedResult(false, "User not found.");

            if (!await _usermanager.IsEmailConfirmedAsync(user))

                return AuthResult.FailedResult(false, "User not found.");

            var result = await _signinmanager.PasswordSignInAsync(user.Email, user.PasswordHash, user.PhoneNumberConfirmed, lockoutOnFailure: false);
            if (result.Succeeded)
            {

                return AuthResult.SuccessResult(true, "You are logged in!");

            }
            else
            {
                return AuthResult.FailedResult(false, "Login failed! Please check your credentials.");

            }
        }
    }
}
