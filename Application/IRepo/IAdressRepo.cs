using Application.Result;
using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Text;

namespace Application.IRepo
{
    public interface IAdressRepo
    {
        Task<UpdateResult> AddNewAdresAsync(string UserId, Adres newadres);
        Task<UpdateResult> UpdateAdressAsync(string userId, Adres updatedAdress);
        Task<UpdateResult> GetAdress(string userId);
    }
}
