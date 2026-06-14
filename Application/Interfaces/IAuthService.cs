using Application.Result;
using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Interfaces
{
    public interface IAuthService
    {
        Task<AuthResult> RegisterUserAsync(ApplicationUser user,string password,string userrole);
        Task<AuthResult> LoginUserAsync(string email, string password);
        Task<AuthResult> ConfirmEmailAsync(string userId, string token);
        Task<AuthResult> ResendConfirmationEmailAsync(string email);
        Task<AuthResult> ForgotPassword(string email);
        Task<AuthResult> ResetPasswordAsync(string email, string token, string newPassword);
        Task<AuthResult> LogoutAsync();
        
    }
}
