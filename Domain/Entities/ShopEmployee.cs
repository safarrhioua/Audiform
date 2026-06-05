using System;
using System.Collections.Generic;
using System.Text;

namespace Domain.Entities
{
    public class ShopEmployee
    {
        public int Id { get; set; }
        public int? Shop_Id { get; set; }
        public string AspNetusers_Id { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string? Phone { get; set; }

       
    }
}
