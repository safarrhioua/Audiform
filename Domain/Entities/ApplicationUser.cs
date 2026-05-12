using Microsoft.AspNetCore.Identity;

namespace Application
{
    public class ApplicationUser : IdentityUser
    {
        public string Email { get; set; }
        public string Password { get; set; }
        public string Phonenumber { get; set; }
        public bool RememberMe { get; set; }
    }
}
