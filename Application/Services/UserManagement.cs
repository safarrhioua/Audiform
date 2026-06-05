using Application.Interfaces;
using Application.Result;
using Domain.Entities;
using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Services
{
    public class UserManagement : IUserManagement
    {
        private readonly UserManager<ApplicationUser> _usermanager;
        private readonly SignInManager<ApplicationUser> _signinmanager;

        public UserManagement(UserManager<ApplicationUser> usermanager, SignInManager<ApplicationUser> signinmanager)
        {
            _usermanager = usermanager;
            _signinmanager = signinmanager;
        }

        public async Task<ApplicationUser> GetUserByIdAsync(string userId)
        {
            return await _usermanager.FindByIdAsync(userId);
        }

        public async Task<AuthResult> UpdateProfileUserAsync(ApplicationUser UpdatedUser)
        {
            var existedUser= await _usermanager.FindByIdAsync(UpdatedUser.Id);
            if (existedUser == null)
            {
                return AuthResult.FailedResult(false, "Gebruiker is niet gevonden!");
            }

            existedUser.Fullname = UpdatedUser.Fullname;
            existedUser.Email = UpdatedUser.Email;
            existedUser.NormalizedEmail = UpdatedUser.Email.ToUpper();
            existedUser.UserName = UpdatedUser.Email;
            existedUser.NormalizedUserName = UpdatedUser.Email.ToUpper();
            existedUser.PhoneNumber = UpdatedUser.PhoneNumber;
            existedUser.Dateofbirth = UpdatedUser.Dateofbirth;

            var result = await _usermanager.UpdateAsync(existedUser);
            if (result.Succeeded)
            { 
                return AuthResult.SuccessResult(true, "Profiel is succesvol bijgewerkt!","");
            }
            
            var errors = string.Join(" | ", result.Errors.Select(e => e.Description));
            return AuthResult.FailedResult(false, errors);
        }
    }
}
