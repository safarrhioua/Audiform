using Application.Interfaces;
using Application.Services;
using Audiform.Server.Requests;
using Domain.Entities;
using Infrastructure.Repos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Audiform.Server.Controllers
{
    [Authorize]
    [EnableCors("frontend")]
    [Route("api/[Controller]")]
    public class AdressController : ControllerBase
    {
        private readonly IAdressManagement _adressmanagement;
        private readonly UserManager<ApplicationUser> _usermanager;

        public AdressController(IAdressManagement adressmanagement,UserManager<ApplicationUser> usermanager)
        {
            _adressmanagement = adressmanagement;
            _usermanager = usermanager;
        }
        [HttpPost("save-adresses")]
        public async Task<IActionResult> AddNewAdresAsync([FromBody] AdressRequest adressRequest)
        {
            var loggedinuser = await _usermanager.GetUserAsync(User);

            if (loggedinuser == null)
            {
                return BadRequest("Gebruiker is niet ingelogd");
            }

            var hasBillingAddress =
                adressRequest.billingAdress != null &&
                !string.IsNullOrWhiteSpace(adressRequest.billingAdress.Straat);

            var hasShippingAddress =
                adressRequest.shippingAdress != null &&
                !string.IsNullOrWhiteSpace(adressRequest.shippingAdress.Straat);

            if (!hasBillingAddress && !hasShippingAddress)
            {
                return BadRequest("Vul minimaal één adres in.");
            }

            if (hasBillingAddress)
            {
                var billingresult = await _adressmanagement.AddNewAdressAsync(
                    loggedinuser,
                    adressRequest.billingAdress,
                    "Billing"
                );

                if (!billingresult.Success)
                {
                    return BadRequest(billingresult.Message);
                }
            }

            if (hasShippingAddress)
            {
                var shippingresult = await _adressmanagement.AddNewAdressAsync(
                    loggedinuser,
                    adressRequest.shippingAdress,
                    "Shipping"
                );

                if (!shippingresult.Success)
                {
                    return BadRequest(shippingresult.Message);
                }
            }

            return Ok("Adressen succesvol opgeslagen.");
        }

        [HttpGet("GetAdres/{adresType}")]
        public async Task<IActionResult> GetAdres(string adresType)
        {
            var loggedinUser = await _usermanager.GetUserAsync(User);
            if (loggedinUser == null)
            {
                return BadRequest("Gebruiker is niet ingelogd");
            }

            var result = await _adressmanagement.GetAdress(loggedinUser, adresType);

            if (!result.Success)
            {
                return BadRequest(result.Message);
            }

            return Ok(result);
        }
    }
  }  

