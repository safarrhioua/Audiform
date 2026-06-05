using Application.Interfaces;
using Application.IRepo;
using Domain.Entities;
using Infrastructure.Data;
using System;
using System.Collections.Generic;
using System.Text;

namespace Infrastructure.Repos
{
    public class UserRepo : IUserProfileRepository
    {
        private readonly ApplicationDbContext _context;
        public UserRepo(ApplicationDbContext context)
        {
            _context = context;
        }
        public async Task AssignRoleAsync(ApplicationUser user, string role)
        {
            if (role == "Employee")
            {
                _context.Employees.Add(new Employee
                {
                    AspNetusers_Id = user.Id,
                    Name = user.Fullname,
                    Phone=""
                });
            }

            if (role == "ShopEmployee")
            {
                _context.ShopEmployees.Add(new ShopEmployee
                {
                    AspNetusers_Id = user.Id,
                    Name = user.Fullname,
                    Phone = "",
                    
                });
            }

            await _context.SaveChangesAsync();

        }
    }
}
