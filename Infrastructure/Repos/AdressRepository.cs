using Application.IRepo;
using Application.Result;
using Domain.Entities;
using Infrastructure.Data;
using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Text;

namespace Infrastructure.Repos
{
    public class AdressRepository : IAdressRepo
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly SignInManager<ApplicationUser> _signInManager;
        private readonly ApplicationDbContext _context;
        
        public AdressRepository(UserManager<ApplicationUser> userManager, SignInManager<ApplicationUser> signInManager, ApplicationDbContext context)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _context = context;
        }

        public Task<UpdateResult> AddNewAdresAsync(string UserId, Adres newadres)
        {
            throw new NotImplementedException();
        }

        public Task<UpdateResult> GetAdress(string userId)
        {
            throw new NotImplementedException();
        }

        public Task<UpdateResult> UpdateAdressAsync(string userId, Adres updatedAdress)
        {
            throw new NotImplementedException();
        }
    }
}
