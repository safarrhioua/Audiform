using Application.IRepo;
using Application.Result;
using Domain.Entities;
using Infrastructure.Data;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;

namespace Infrastructure.Repos
{
    public class AdressRepository : IAdressRepo
    {
        private readonly ApplicationDbContext _context;
        
        public AdressRepository(ApplicationDbContext context)
        {            
            _context = context;
        }

        public async Task AddNewAdresAsync(string UserId, Adres newadres)
        {      
            newadres.UserId = UserId;
            _context.Adressen.Add(newadres);
            await _context.SaveChangesAsync();
                 
        }

        public async Task<Adres?> GetAdress(string userId,string adrestype)
        {
           var existedadres= await _context.Adressen.FirstOrDefaultAsync(a => a.UserId == userId && a.AdresType == adrestype);

            return existedadres; 
                       
        }

        public async Task UpdateAdressAsync(string userId, Adres updatedAdress,string adrestype)
        {
            var existingadres = await _context.Adressen.FirstOrDefaultAsync(a => a.UserId == userId && a.AdresType == adrestype);
            if(existingadres == null)
            {
                return;
            }

            existingadres.Straat = updatedAdress.Straat;
            existingadres.Postcode= updatedAdress.Postcode;
            existingadres.Stad= updatedAdress.Stad;
            existingadres.Land = updatedAdress.Land;
            
            _context.Adressen.Update(existingadres);
            await _context.SaveChangesAsync();

        }
    }
}
