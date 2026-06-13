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
using Application.IRepo;
using Microsoft.EntityFrameworkCore.Storage.Internal;

namespace Application.Services
{

    public class AuthService : IAuthService

    {
        private readonly UserManager<ApplicationUser> _usermanager;
        private readonly SignInManager<ApplicationUser> _signinmanager;
        private readonly IConfiguration _config;
        private readonly IConfirmationService _confirmationservice;
        private readonly RoleManager<IdentityRole> _rolemanager;
        private readonly IUserProfileRepository _profileRepository;
       

        public AuthService(UserManager<ApplicationUser> usermanager, SignInManager<ApplicationUser> signinmanager, IConfiguration config, IConfirmationService confirmationService, RoleManager<IdentityRole> rolemanager, IUserProfileRepository profileRepository)
        {
            _usermanager = usermanager;
            _signinmanager = signinmanager;
            _config = config;
            _confirmationservice = confirmationService;
            _rolemanager = rolemanager;
            _profileRepository = profileRepository;
        }


        public async Task<AuthResult> RegisterUserAsync(ApplicationUser user, string password,string userrole)
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

            string assignedrole = userrole;
            if(userrole == "Employee")
            {
                assignedrole= "PendingEmployee";
            }
           
            
           if(!await _rolemanager.RoleExistsAsync(assignedrole))
            {
                await _usermanager.DeleteAsync(user);
                return AuthResult.FailedResult(false, $"De rol '{assignedrole}' bestaat niet. Probeer het opnieuw met een geldige rol.");
            }

           var roleAssignResult = await _usermanager.AddToRoleAsync(user, assignedrole);

            

            if (!roleAssignResult.Succeeded)
            {
                var errors = roleAssignResult.Errors.Select(e => e.Description);
                await _usermanager.DeleteAsync(user);
                return AuthResult.FailedResult(false, string.Join(" ", errors));
            }
            if (userrole == "ShopEmployee")
            {
                await _profileRepository.AssignRoleAsync(user, userrole);
            }

            if (userrole == "Employee")
            {
                await _confirmationservice.SendAdminEmailConfirmationAsync(
                    user.Email!,
                    user.Fullname,
                    userrole
                );
            }
           

            // Generate email confirmation token and send confirmation email
            var token = await _usermanager.GenerateEmailConfirmationTokenAsync(user);
            var encodedToken = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(token));

            var baseUrl = _config["AppSettings:BackendBaseUrl"] ?? "https://localhost:7050";

            var confirmationLink = $"{baseUrl}/api/Auth/ConfirmEmail?userId={user.Id}&token={encodedToken}";

            await _confirmationservice.SendRegisterationConfirmationEmailAsync(user.Email!, confirmationLink);

            return AuthResult.SuccessResult(true, "Jij bent geregistreerd! ", userrole);
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
                return AuthResult.SuccessResult(true, "E-mail succesvol bevestigd.","");
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
            return AuthResult.SuccessResult(true, "Bevestigingsmail opnieuw verzonden. Controleer uw e-mail."," ");
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

            if(await _usermanager.IsInRoleAsync(loggedinUser, "PendingEmployee"))
            {
                return AuthResult.FailedResult(false, "Uw account is nog in behandeling. U ontvangt een e-mail zodra uw account is goedgekeurd.");
            }
                
            var result = await _signinmanager.PasswordSignInAsync(loggedinUser.UserName, password, isPersistent: false, lockoutOnFailure: true);
            if (result.Succeeded)
            {
                var roles = await _usermanager.GetRolesAsync(loggedinUser);
                var role = roles.FirstOrDefault() ?? string.Empty;
                return AuthResult.SuccessResult(true, "Inloggen is gelukt!",role);
            }   

            return AuthResult.FailedResult(false, "Inloggen mislukt! Controleer uw gegevens.");
        }

        public async Task<AuthResult> LogoutAsync()
        {
            await _signinmanager.SignOutAsync();
            return AuthResult.SuccessResult(true, "Succesvol uitgelogd", "");
        }

        public async Task<AuthResult> ForgotPassword(string email)
        {
            var user = await _usermanager.FindByEmailAsync(email);
            if(user == null)
            {
                return AuthResult.FailedResult(false, "Er bestaat geen account met dit e-mail adres");
            }

            var token = await _usermanager.GeneratePasswordResetTokenAsync(user);
            var encodedtoken = Uri.EscapeDataString(token);
            var encodedemail = Uri.EscapeDataString(email);

            var resetlink = $"https://localhost:60942/reset-password?email={encodedemail}&token={encodedtoken}";

            await _confirmationservice.SendPasswordResetEmailAsync(email, resetlink);

            return AuthResult.SuccessResult(true, "Als dit e-mailadres bestaat, is er een resetlink verstuurd","");
        }

        public async Task<AuthResult> ResetPasswordAsync(string email, string token, string newPassword)
        {
            var loggedinUser = await _usermanager.FindByEmailAsync(email);
            if (loggedinUser == null)
            {
                return AuthResult.FailedResult(false, "Er bestaat geen account met dit e-mail adres");
            }

            var result = await _usermanager.ResetPasswordAsync(loggedinUser, token, newPassword);

            if (!result.Succeeded)
            {
                var errors = string.Join(", ", result.Errors.Select(e => e.Description));

                return AuthResult.FailedResult(false, errors);
            }

            return AuthResult.SuccessResult(
               true, "Wachtwoord succesvol gewijzigd.",""
                );
        }
    }
}
