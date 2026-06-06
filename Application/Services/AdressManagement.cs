using Application.Interfaces;
using Application.IRepo;
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
       private readonly IAdressRepo _adressrepo;
        public AdressManagement(UserManager<ApplicationUser> usermanager, IAdressRepo adressrepo)
        {
            _userManager = usermanager;
          
            _adressrepo = adressrepo;
        }

        public async Task<UpdateResult> AddNewAdressAsync(ApplicationUser loggedinUser, Adres newadres,string AdresType)
        {
            var user =  await _userManager.FindByIdAsync(loggedinUser.Id);
            if (user == null)
            {
                return UpdateResult.FailedSucces("Deze Gebruiker is niet gevonden!", false); 
            }

            if (string.IsNullOrWhiteSpace(newadres.Straat))
            {
                return UpdateResult.FailedSucces("Straat is verplicht", false);
            }
            if (string.IsNullOrWhiteSpace(newadres.Postcode))
            {
                return UpdateResult.FailedSucces("Postcode is verplicht", false);
            }
            if (string.IsNullOrWhiteSpace(newadres.Stad))
            {
                return UpdateResult.FailedSucces("Stad is verplicht", false);
            }
            if (string.IsNullOrWhiteSpace(newadres.Land))
            {
                return UpdateResult.FailedSucces("land is verplicht", false);
            }

            var existedadres = await _adressrepo.GetAdress(loggedinUser.Id,AdresType);
            if(existedadres != null)
            {
                return UpdateResult.FailedSucces("Jij hebt al een adres", false);
            }
            var adress = new Adres
            {
               
                Straat = newadres.Straat,
                Postcode = newadres.Postcode,
                Stad = newadres.Stad,
                Land = newadres.Land,
                UserId =loggedinUser.Id,
                AdresType=AdresType

            };

            await _adressrepo.AddNewAdresAsync(loggedinUser.Id, adress);
            return UpdateResult.Succesresult("Adres succesvol toegevoegd!", true);

        }

        public async Task<UpdateResult> GetAdress(ApplicationUser loggedinUser, string AdresType)
        {
            var user = await _userManager.FindByIdAsync(loggedinUser.Id);
            if(user == null)
            {
                return UpdateResult.FailedSucces("Deze gebruiker is niet gevonden", false);
            }
            
            var adres = await _adressrepo.GetAdress(loggedinUser.Id,AdresType);
            if(adres == null)
            {
                return UpdateResult.FailedSucces("Deze gebruiker heeft nog geen ades", false);
            }
            return UpdateResult.Succesresult($"adres is {adres.Straat},{adres.Postcode},{adres.Stad}, ,{adres.Land}", true);

        }

        public async Task<UpdateResult> UpdateAdressAsync(ApplicationUser loggedinUser, Adres updatedAdress, string AdresType)
        {
            var user = await _userManager.FindByIdAsync(loggedinUser.Id);
            if(user == null)
            {
                return UpdateResult.FailedSucces("Jij bent niet ingelogd!", false);
            }
            var adres = _adressrepo.GetAdress(loggedinUser.Id,AdresType);
            if (adres == null)
            {
                return UpdateResult.FailedSucces("Je hebt nog geen adres om aan te passen", false);
            }

            if (string.IsNullOrWhiteSpace(updatedAdress.Straat))
            {
                return UpdateResult.FailedSucces("Straat is verplicht", false);
            }
            if (string.IsNullOrWhiteSpace(updatedAdress.Postcode))
            {
                return UpdateResult.FailedSucces("Postcode is verplicht", false);
            }
            if (string.IsNullOrWhiteSpace(updatedAdress.Stad))
            {
                return UpdateResult.FailedSucces("Stad is verplicht", false);
            }
            if (string.IsNullOrWhiteSpace(updatedAdress .Land))
            {
                return UpdateResult.FailedSucces("land is verplicht", false);
            }

            await _adressrepo.UpdateAdressAsync(loggedinUser.Id, updatedAdress,AdresType);

            return UpdateResult.Succesresult($"adres is {updatedAdress.Straat},{updatedAdress.Postcode},{updatedAdress.Stad}, ,{updatedAdress.Land}", true);
        }
    }
}
