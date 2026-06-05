using Application.Result;
using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Interfaces
{
    public interface IAdressManagement
    {
        Task<UpdateResult> AddNewAdressAsync(string userId, Adres newadress);
        Task<UpdateResult> UpdateAdressAsync(string userId, Adres updatedAdress);
        Task<UpdateResult> GetAdress(string userId);
    }
}
