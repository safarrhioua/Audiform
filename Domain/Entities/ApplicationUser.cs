    using Microsoft.AspNetCore.Identity;

    namespace Domain.Entities
    {
        public class ApplicationUser : IdentityUser
        {
            public string Fullname { get; set; } = string.Empty;
            public DateOnly? Dateofbirth {  get; set; }
            
            public ICollection<Adres> Adressen { get; set; } = new List<Adres>();
    }
            public int? ShopEmployeeId { get; set; }

    }
    }
