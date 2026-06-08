using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Interfaces
{
    public interface IConfirmationService
    {
        Task SendRegisterationConfirmationEmailAsync(string ToEmail, string confirmationlink);
        Task SendAccountCreatedEmailAsync(string ToEmail, string loginlink);
        Task SendResendConfirmationEmailAsync(string ToEmail, string confirmationLink);
        Task SendAdminEmailConfirmationAsync(string UserEmail, string fullname, string requestedRole);
    }
}
