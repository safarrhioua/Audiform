using Application.Interfaces;
using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Text;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Microsoft.AspNetCore.WebUtilities;

namespace Application.Services
{
    public class AuthService : IAuthService
    {
        private readonly UserManager<ApplicationUser> _usermanager;
        private readonly SignInManager<ApplicationUser> _signinmanager;
        private readonly IConfiguration _config;
        private readonly IConfirmationService _confirmationservice;

        public AuthService(UserManager<ApplicationUser> usermanager, SignInManager<ApplicationUser> signinmanager, IConfiguration config, IConfirmationService confirmationService)
        {
            _usermanager = usermanager;
            _signinmanager = signinmanager;
            _config = config;
            _confirmationservice = confirmationService;
        }


        public async Task<AuthResult> RegisterUserAsync(ApplicationUser user, string password)
        {

            IdentityResult result = await _usermanager.CreateAsync(user, password);

            if (!result.Succeeded)
            {
                return AuthResult.FailedResult(false, string.Join("; ", result.Errors.Select(e => e.Description)));
            }

            //this will assign the user to the "User" role, you can change it as per your "requirement"
            //IdentityResult roleassignResult = await _usermanager.AddToRoleAsync(user, "User");

            //if (!roleassignResult.Succeeded)
            //{
            //    await _usermanager.DeleteAsync(user);
            //    return AuthResult.FailedResult(false, "User registration failed! Please try again.");
            //}

            // Generate email confirmation token and send confirmation email
            var token = await _usermanager.GenerateEmailConfirmationTokenAsync(user);

            var BaseUrl = _config["AppSettings:BaseUrl"] ?? throw new InvalidOperationException("BaseUrl is not configured.");

            var confirmationLink = $"{BaseUrl}/Account/ConfirmEmail?userId={user.Id}&token={token}";

            await _confirmationservice.SendRegisterationConfirmationEmailAsync(user.Email!, confirmationLink);

            return AuthResult.SuccessResult(true, "Jij bent geregistreerd! ");


        }

        public async Task<AuthResult> ConfirmEmailAsync(string userId, string token)
        {
            if(userId == null || string.IsNullOrEmpty(token))
            {
                return AuthResult.FailedResult(false, "Invalid confirmation link.");
            }

            var user = await _usermanager.FindByIdAsync(userId.ToString());
            if(user== null)
            {
                return AuthResult.FailedResult(false, "User not found.");
            }
            // the token is URL-encoded, we need to decode it before confirming the email
            var decodedBytes =WebEncoders.Base64UrlDecode(token);

            // the decoded token is a UTF-8 string, need to convert it back to a string before confirming the email
            var decodedToken = Encoding.UTF8.GetString(decodedBytes);
            // now we can confirm the email using the decoded token
            var result = await _usermanager.ConfirmEmailAsync(user, decodedToken);

            if (result.Succeeded)
            {
                // After confirming the email, you can redirect the user to a specific page or return a success message
                var BaseUrl = _config["AppSettings:BaseUrl"] ?? throw new InvalidOperationException("BaseUrl is not configured.");
                var loginLink = $"{BaseUrl}/Account/Login";
                await _confirmationservice.SendAccountCreatedEmailAsync(user.Email!, loginLink);
                return AuthResult.SuccessResult(true, "Email confirmed successfully.");
            }
            
            return AuthResult.FailedResult(false, "Email confirmation failed.");
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
