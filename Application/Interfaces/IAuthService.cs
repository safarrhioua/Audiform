using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Interfaces
{
    public interface IAuthService
    {
        Task<AuthResult> RegisterUserAsync(UserDto userDto);
        Task<AuthResult> LoginUserAsync(UserDto userdto);
    }
}
