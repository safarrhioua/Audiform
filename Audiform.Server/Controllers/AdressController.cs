using Application.Interfaces;
using Audiform.Server.Requests;
using Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace Audiform.Server.Controllers
{
    [Authorize]
    [EnableCors("frontend")]
    [Route("api/[controller]")]
    [ApiController]
    public class AdressController : ControllerBase
    {
        private readonly IAdressManagement _adressmanagement;
        private readonly UserManager<ApplicationUser> _usermanager;
        private readonly ILogger<AdressController> _logger;

        public AdressController(IAdressManagement adressmanagement,UserManager<ApplicationUser> usermanager, ILogger<AdressController> logger)
        {
            _adressmanagement = adressmanagement;
            _usermanager = usermanager;
            _logger = logger;
        }

        [HttpPost("save-adresses")]
        public async Task<IActionResult> AddNewAdresAsync([FromBody] AdressRequest adressRequest)
        {
            var loggedinuser = await _usermanager.GetUserAsync(User);

            if (loggedinuser == null)
            {
                _logger.LogWarning("Adres opslaan mislukt: gebruiker is niet ingelogd.");
                return Unauthorized("Gebruiker is niet ingelogd");
            }

            _logger.LogInformation(
                "Gebruiker {UserId} probeert adressen op te slaan.",
                loggedinuser.Id);

            var hasBillingAddress =
      adressRequest.billingAdress != null &&
      (
          !string.IsNullOrWhiteSpace(adressRequest.billingAdress.Straat) ||
          !string.IsNullOrWhiteSpace(adressRequest.billingAdress.Postcode) ||
          !string.IsNullOrWhiteSpace(adressRequest.billingAdress.Stad) ||
          !string.IsNullOrWhiteSpace(adressRequest.billingAdress.Land)
      );

            var hasShippingAddress =
                adressRequest.shippingAdress != null &&
                (
                    !string.IsNullOrWhiteSpace(adressRequest.shippingAdress.Straat) ||
                    !string.IsNullOrWhiteSpace(adressRequest.shippingAdress.Postcode) ||
                    !string.IsNullOrWhiteSpace(adressRequest.shippingAdress.Stad) ||
                    !string.IsNullOrWhiteSpace(adressRequest.shippingAdress.Land)
                );

            if (!hasBillingAddress && !hasShippingAddress)
            {
                _logger.LogWarning(
                    "Adres opslaan mislukt voor gebruiker {UserId}: geen adres ingevuld.",
                    loggedinuser.Id);

                return BadRequest("Vul minimaal één adres in.");
            }

            if (hasBillingAddress)
            {
                var billingresult = await _adressmanagement.AddNewAdressAsync(
                    loggedinuser,
                    adressRequest.billingAdress,
                    "Billing");

                if (!billingresult.Success)
                {
                    _logger.LogWarning(
                        "Billing adres opslaan mislukt voor gebruiker {UserId}: {Message}",
                        loggedinuser.Id,
                        billingresult.Message);

                    return BadRequest(billingresult.Message);
                }
            }

            if (hasShippingAddress)
            {
                var shippingresult = await _adressmanagement.AddNewAdressAsync(
                    loggedinuser,
                    adressRequest.shippingAdress,
                    "Shipping");

                if (!shippingresult.Success)
                {
                    _logger.LogWarning(
                        "Shipping adres opslaan mislukt voor gebruiker {UserId}: {Message}",
                        loggedinuser.Id,
                        shippingresult.Message);

                    return BadRequest(shippingresult.Message);
                }
            }

            _logger.LogInformation(
                "Adressen succesvol opgeslagen voor gebruiker {UserId}.",
                loggedinuser.Id);

            return Ok("Adressen succesvol opgeslagen.");
        }

        [HttpGet("GetAdres/{adresType}")]
        public async Task<IActionResult> GetAdres(string adresType)
        {
            var loggedinUser = await _usermanager.GetUserAsync(User);

            if (loggedinUser == null)
            {
                _logger.LogWarning("Adres ophalen mislukt: gebruiker is niet ingelogd.");
                return Unauthorized("Gebruiker is niet ingelogd");
            }

            _logger.LogInformation(
                "Gebruiker {UserId} vraagt {AdresType} adres op.",
                loggedinUser.Id,
                adresType);

            var result = await _adressmanagement.GetAdress(loggedinUser, adresType);

            if (!result.Success)
            {
                _logger.LogWarning(
                    "{AdresType} adres ophalen mislukt voor gebruiker {UserId}: {Message}",
                    adresType,
                    loggedinUser.Id,
                    result.Message);

                return NotFound(result.Message);
            }

            return Ok(result);
        }
    }
}