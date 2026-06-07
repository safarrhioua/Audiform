using Application.Result;
using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Interfaces
{
    public interface IUserManagement
    {
        Task<ApplicationUser> GetUserByIdAsync(string userId);
        Task<AuthResult> UpdateProfileUserAsync(ApplicationUser existinguser);
        
    }
}
