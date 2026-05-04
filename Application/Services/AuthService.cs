using Application.Interfaces;
using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Services
{
    public class AuthService : IAuthService
    {
        private readonly UserManager<IdentityUser> _usermanager;
        private readonly SignInManager<IdentityUser> _signinmanager;

        public AuthService(UserManager<IdentityUser> usermanager, SignInManager<IdentityUser> signinmanager)
        {
            _usermanager = usermanager;
            _signinmanager = signinmanager;
        }

        public Task<AuthResult> LoginUserAsync(UserDto userdto)
        {
            return //; 
        }

        public Task<AuthResult> RegisterUserAsync(UserDto userDto)
        {
            var newuser = new IdentityUser
            {
                UserName = userDto.Email

            };
        }
    }
}
