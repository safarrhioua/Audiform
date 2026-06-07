using Application.Result;
using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Text;

namespace Application.IRepo
{
    public interface IAdressRepo
    {
        Task AddNewAdresAsync(string UserId, Adres newadres);
        Task UpdateAdressAsync(string userId, Adres updatedAdress,string adrestype);
        Task <Adres?> GetAdress(string userId,string adrestype);
    }
}
