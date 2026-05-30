using Application.Interfaces;
using Application.Result;
using Domain.Entities;
using Infrastructure.Data;
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
        private readonly ApplicationDbContext _context;

        public AdressManagement(UserManager<ApplicationUser> userManager, SignInManager<ApplicationUser> signInManager, ApplicationDbContext applicationDbContext)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _context = applicationDbContext;
        }
        public async Task<UpdateResult> AddNewAdressAsync(string userId, Adres newadress)
        {

            var user= _userManager.FindByIdAsync(userId).Result;
            if (user == null)
            {
                UpdateResult.FailedSucces("Gebruiker is niet gevonden! probeer opnieuw in te loggen", false);
            }

            _context.Adressen.Add(newadress);
            await _context.SaveChangesAsync();  

            return UpdateResult.Succesresult("Adres is succesvol toegevoegd!", true);   
            
            
            
        }

        public Task<UpdateResult> GetAdress(string userId, int adresId)
        {
            throw new NotImplementedException();
        }

        public Task<UpdateResult> UpdateAdressAsync(string userId, Adres updatedAdress)
        {
            throw new NotImplementedException();
        }
    }
}
