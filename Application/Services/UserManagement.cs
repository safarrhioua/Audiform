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
            var existeduser = await _usermanager.FindByIdAsync(userId);
            return existeduser;
        }

        public async Task<AuthResult> UpdateProfileUserAsync(ApplicationUser UpdatedUser)
        {
            if (UpdatedUser == null)
            {
                return AuthResult.FailedResult(false, "Geen profielgegevens ontvangen.");
            }
            var existedUser= await _usermanager.FindByIdAsync(UpdatedUser.Id);
            if (existedUser == null)
            {
                return AuthResult.FailedResult(false, "Gebruiker is niet gevonden!");
            }

            if (!string.IsNullOrWhiteSpace(UpdatedUser.Email))
            {
                existedUser.Email = UpdatedUser.Email;
                existedUser.NormalizedEmail = UpdatedUser.Email.ToUpper();
            }
            if (!string.IsNullOrWhiteSpace(UpdatedUser.Fullname))
            {
                existedUser.Fullname = UpdatedUser.Fullname;
            }
            
            if (!string.IsNullOrWhiteSpace(UpdatedUser.UserName))
            {
                existedUser.UserName = UpdatedUser.Email;
                existedUser.NormalizedUserName = UpdatedUser.Email.ToUpper();
            }
            if (UpdatedUser.PhoneNumber != null)
            {
                existedUser.PhoneNumber = UpdatedUser.PhoneNumber;

            }
            if (!string.IsNullOrWhiteSpace(UpdatedUser.Dateofbirth.ToString()))
            {
                existedUser.Dateofbirth = UpdatedUser.Dateofbirth;

            }
            
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
