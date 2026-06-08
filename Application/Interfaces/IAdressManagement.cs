using Application.Result;
using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Interfaces
{
    public interface IAdressManagement
    {
        Task<UpdateResult> AddNewAdressAsync(ApplicationUser loggedinUser,Adres newadres, string AdresType);
        Task<UpdateResult> UpdateAdressAsync(ApplicationUser loggedinUser, Adres updatedAdress, string AdresType);
        Task<UpdateResult> GetAdress(ApplicationUser loggedinUser, string AdresType);
    }
}
