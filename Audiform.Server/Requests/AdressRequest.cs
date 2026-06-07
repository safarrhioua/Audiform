using Domain.Entities;

namespace Audiform.Server.Requests
{
    public class AdressRequest
    {
        public Adres billingAdress { get; set; } = new();
        public Adres shippingAdress { get; set; } = new();
    }
}
