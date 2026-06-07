    using Microsoft.AspNetCore.Identity;

    namespace Domain.Entities
    {
        public class ApplicationUser : IdentityUser
        {
            public string Fullname { get; set; } = string.Empty;
            public int? ShopEmployeeId { get; set; }

    }
    }
