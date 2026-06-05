using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Text;

namespace Application.IRepo
{
    public interface IUserProfileRepository
    {
        Task AssignRoleAsync(ApplicationUser user, string role);
    }
}
