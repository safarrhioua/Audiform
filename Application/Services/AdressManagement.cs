using Application.Interfaces;
using Application.Result;
using Domain.Entities;

using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Services
{
    public class AdressManagement : IAdressManagement
    {
       private readonly UserManager<ApplicationUser> _userManager;
       private readonly SignInManager<ApplicationUser> _signInManager;


        public async Task<UpdateResult> AddNewAdressAsync(string userId, Adres newadress)
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
