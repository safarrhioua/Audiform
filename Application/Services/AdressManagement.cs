using Application.Interfaces;
using Application.IRepo;
using Application.Result;
using Domain.Entities;
using Microsoft.AspNetCore.Identity;

namespace Application.Services
{
    public class AdressManagement : IAdressManagement
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IAdressRepo _adressrepo;

        public AdressManagement(
            UserManager<ApplicationUser> usermanager,
            IAdressRepo adressrepo)
        {
            _userManager = usermanager;
            _adressrepo = adressrepo;
        }

        public async Task<UpdateResult> AddNewAdressAsync(
            ApplicationUser loggedinUser,
            Adres newadres,
            string adresType)
        {
            var user = await _userManager.FindByIdAsync(loggedinUser.Id);

            if (user == null)
            {
                return UpdateResult.FailedSucces(
                    "Deze gebruiker is niet gevonden!",
                    false);
            }

            var validationResult = ValidateAdres(newadres);

            if (!validationResult.Success)
            {
                return validationResult;
            }

            var existingAdres = await _adressrepo.GetAdress(
                loggedinUser.Id,
                adresType);

            if (existingAdres == null)
            {
                var adres = new Adres
                {
                    Straat = newadres.Straat,
                    Postcode = newadres.Postcode,
                    Stad = newadres.Stad,
                    Land = newadres.Land,
                    UserId = loggedinUser.Id,
                    AdresType = adresType
                };

                await _adressrepo.AddNewAdresAsync(
                    loggedinUser.Id,
                    adres);

                return UpdateResult.Succesresult(
                    $"{adresType} adres succesvol toegevoegd!",
                    true);
            }

            await _adressrepo.UpdateAdressAsync(
                loggedinUser.Id,
                newadres,
                adresType);

            return UpdateResult.Succesresult(
                $"{adresType} adres succesvol bijgewerkt!",
                true);
        }

        public async Task<UpdateResult> GetAdress(ApplicationUser loggedinUser, string adresType)
        {
            var user = await _userManager.FindByIdAsync(loggedinUser.Id);

            if (user == null)
            {
                return UpdateResult.FailedSucces(
                    "Deze gebruiker is niet gevonden",
                    false);
            }

            var adres = await _adressrepo.GetAdress(
                loggedinUser.Id,
                adresType);

            if (adres == null)
            {
                return UpdateResult.FailedSucces(
                    $"Deze gebruiker heeft nog geen {adresType} adres",
                    false);
            }

            return UpdateResult.SuccesresultData(
                $"{adresType} adres gevonden",
                true,
                new
                {
                    straat = adres.Straat,
                    postcode = adres.Postcode,
                    stad = adres.Stad,
                    land = adres.Land,
                    adresType = adres.AdresType
                });
        }

        public async Task<UpdateResult> UpdateAdressAsync(ApplicationUser loggedinUser,Adres updatedAdress, string adresType)
        {
            var user = await _userManager.FindByIdAsync(loggedinUser.Id);

            if (user == null)
            {
                return UpdateResult.FailedSucces(
                    "Jij bent niet ingelogd!",
                    false);
            }

            var existingAdres = await _adressrepo.GetAdress(
                loggedinUser.Id,
                adresType);

            if (existingAdres == null)
            {
                return UpdateResult.FailedSucces(
                    "Je hebt nog geen adres om aan te passen",
                    false);
            }

            var validationResult = ValidateAdres(updatedAdress);

            if (!validationResult.Success)
            {
                return validationResult;
            }

            await _adressrepo.UpdateAdressAsync(
                loggedinUser.Id,
                updatedAdress,
                adresType);

            return UpdateResult.Succesresult(
                $"{adresType} adres succesvol bijgewerkt!",
                true);
        }

        private UpdateResult ValidateAdres(Adres adres)
        {
            if (string.IsNullOrWhiteSpace(adres.Straat))
            {
                return UpdateResult.FailedSucces("Straat is verplicht", false);
            }

            if (string.IsNullOrWhiteSpace(adres.Postcode))
            {
                return UpdateResult.FailedSucces("Postcode is verplicht", false);
            }

            if (string.IsNullOrWhiteSpace(adres.Stad))
            {
                return UpdateResult.FailedSucces("Stad is verplicht", false);
            }

            if (string.IsNullOrWhiteSpace(adres.Land))
            {
                return UpdateResult.FailedSucces("Land is verplicht", false);
            }

            return UpdateResult.Succesresult("Adres is geldig", true);
        }
    }
}