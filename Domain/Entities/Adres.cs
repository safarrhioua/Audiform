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
        public string UserId { get; set; } = string.Empty;
        public string AdresType { get; set; } = string.Empty;

        //public ApplicationUser ApplicationUser { get; set; } = null!;
    }
}
