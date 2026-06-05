using System;
using System.Collections.Generic;
using System.Text;

namespace Domain.Entities
{
    public class Adres
    {
        public int AdresId { get; set; } 
        public string Straat { get; set; } = string.Empty;
        public string Postcode { get; set; } = string.Empty;
        public string Stad { get; set; } = string.Empty;
        public string Land { get; set; } = string.Empty;
        public int UserId { get; set; }

        public ApplicationUser ApplicationUser { get; set; } = null!;
    }
}
