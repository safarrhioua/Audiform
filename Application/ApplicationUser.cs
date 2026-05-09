using Microsoft.AspNet.Identity.EntityFramework;
using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Text;

namespace Application
{
    //ApplicationUser class inherits from Identityuser class which is provided by Microsoft.AspNetCore.Identity package and it contains all the properties and methods required for user authentication and authorization.
    public class ApplicationUser:IdentityUser
    {
        public string Name { get; set; }
        public string Password { get; set; }
        public string Phonenumber { get; set; }
        public bool RememberMe { get; set; }

    }
}
