using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Interfaces
{
    public interface IAuthService
    {
        Task<AuthResult> RegisterUserAsync(ApplicationUser user,string password);
        Task<AuthResult> LoginUserAsync(ApplicationUser user,string password);
        Task<AuthResult> ConfirmEmailAsync(string userId, string token);
    }
}
