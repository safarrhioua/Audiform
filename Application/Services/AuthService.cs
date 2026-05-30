using Application.Interfaces;
using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Text;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Microsoft.AspNetCore.WebUtilities;
using Domain.Entities;
using Application.Result;

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

            var existeduser= await _usermanager.FindByEmailAsync(user.Email!);
            if (existeduser != null) 
            {

                return AuthResult.FailedResult(false, "Dit E-mail adres bestaat er al! Probeer het opnieuw!");
            }
            
                

            IdentityResult result = await _usermanager.CreateAsync(user, password);

            if (!result.Succeeded)
            {

                var errors = result.Errors.Select(e =>
                {
                    return e.Code switch
                    {
                        "PasswordTooShort" => "Wachtwoord moet minimaal 6 tekens bevatten",
                        "PasswordRequiresNonAlphanumeric" => "Wachtwoord moet minimaal één speciaal teken bevatten",
                        "PasswordRequiresDigit" => "Wachtwoord moet minimaal één cijfer bevatten",
                        "PasswordRequiresUpper" => "Wachtwoord moet minimaal één hoofdletter bevatten",
                        "DuplicateEmail" => "Dit e-mailadres is al geregistreerd.",
                        _ => e.Description
                    };
                });

               return AuthResult.FailedResult(false, string.Join(" ", errors));
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
            var encodedToken = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(token));

            var baseUrl = _config["AppSettings:BackendBaseUrl"] ?? "https://localhost:7050";

            var confirmationLink = $"{baseUrl}/api/Auth/ConfirmEmail?userId={user.Id}&token={encodedToken}";

            await _confirmationservice.SendRegisterationConfirmationEmailAsync(user.Email!, confirmationLink);

            return AuthResult.SuccessResult(true, "Jij bent geregistreerd! ");
        }

        public async Task<AuthResult> ConfirmEmailAsync(string userId, string token)
        {
            if(userId == null || string.IsNullOrEmpty(token))
            {
                return AuthResult.FailedResult(false, "Ongeldige bevestigingslink.");
            }

            var user = await _usermanager.FindByIdAsync(userId);
            if(user== null)
            {
                return AuthResult.FailedResult(false, "Er bestaat geen account met dit e-mail adres");
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
                var loginLink = $"{BaseUrl}/login?confirmed=true";
                await _confirmationservice.SendAccountCreatedEmailAsync(user.Email!, loginLink);
                return AuthResult.SuccessResult(true, "E-mail succesvol bevestigd.");
            }
            
            return AuthResult.FailedResult(false, "Bevestiging van e-mail mislukt.");
        }

        public async Task<AuthResult> ResendConfirmationEmailAsync(string email)
        {
            if (string.IsNullOrWhiteSpace(email))
            {
                return AuthResult.FailedResult(false, "E-mailadres is verplicht.");
            }
            var user = await _usermanager.FindByEmailAsync(email);
            if (user == null)
            {
                return AuthResult.FailedResult(false, "Er bestaat geen account met dit e-mail adres");
            }
            if (await _usermanager.IsEmailConfirmedAsync(user))
            {
                return AuthResult.FailedResult(false, "Uw e-mailadres is al bevestigd. U kunt inloggen.");
            }
            var token = await _usermanager.GenerateEmailConfirmationTokenAsync(user);
            var encodedToken = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(token));
            var baseUrl = _config["AppSettings:BackendBaseUrl"] ?? "https://localhost:7050";
            var confirmationLink = $"{baseUrl}/api/Auth/ConfirmEmail?userId={user.Id}&token={encodedToken}";
            await _confirmationservice.SendRegisterationConfirmationEmailAsync(user.Email!, confirmationLink);
            return AuthResult.SuccessResult(true, "Bevestigingsmail opnieuw verzonden. Controleer uw e-mail.");
        }

        public async Task<AuthResult> LoginUserAsync(string email, string password)
        {
            if (string.IsNullOrWhiteSpace(email))
            {
                return AuthResult.FailedResult(false, "E-mailadres is verplicht.");
            }

            var loggedinUser = await _usermanager.FindByEmailAsync(email);

            if (loggedinUser == null)
                return AuthResult.FailedResult(false, "Er bestaat geen account met dit e-mail adres");

            if (!await _usermanager.IsEmailConfirmedAsync(loggedinUser))
                return AuthResult.FailedResult(false, "Uw e-mailadres is nog niet bevestigd. Controleer uw e-mail voor de bevestigingslink.");

            var result = await _signinmanager.PasswordSignInAsync(loggedinUser.UserName, password, isPersistent: false, lockoutOnFailure: false);
            if (result.Succeeded)
                return AuthResult.SuccessResult(true, "Inloggen is gelukt!");

            return AuthResult.FailedResult(false, "Inloggen mislukt! Controleer uw gegevens.");
        }
    }
}
