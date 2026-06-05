using Application.Interfaces;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Text;
using Microsoft.AspNetCore.Identity;
using System.Net.Mail;
using System.Net;
using System.Data.SqlTypes;
using Domain.Entities;

namespace Application.Services
{
    public class EmailService : IConfirmationService
    {

        private readonly IConfiguration _config;
        

        public EmailService(IConfiguration config)
        {
            _config = config;
        }
        public async Task SendAccountCreatedEmailAsync(string ToEmail, string loginlink)
        {
            string htmlcontent = $@"


    <html><body style='font-family: Arial, sans-serif; background-color: #f4f6f8; margin:0; padding:20px;'>
                  <div style='max-width:600px; margin:auto; background:#fff; padding:30px; border-radius:8px;'>
                    <h2 style='color:#333;'>Hallo,!</h2>
                    <p style='font-size:16px; color:#555;'>Uw account is succesvol aangemaakt en uw e-mailadres is bevestigd.
                    U kunt nu inloggen op uw account.</p>
                    <p style='text-align:center;'>
                      <a href='{loginlink}' style='background:#198754; color:#fff; padding:12px 24px; border-radius:6px; text-decoration:none; font-weight:bold;'>Inloggen op uw account</a>
                    </p>
                    <p style='font-size:12px; color:#999; margin-top:30px;'>&copy; {DateTime.UtcNow.Year} Audiform.</p>
                  </div>
                </body></html>
                ";

            await SendEmailAsync(ToEmail, "Account succesvol aangemaakt", htmlcontent, true);

        }

        public async Task SendRegisterationConfirmationEmailAsync(string ToEmail, string confirmationlink)
        {
            string htmlContent = $@"
            <html><body style='font-family: Arial, sans-serif; background-color: #f4f6f8; margin:0; padding:20px;'>
                  <div style='max-width:600px; margin:auto; background:#fff; padding:30px; border-radius:8px;'>
                    <h2 style='color:#333;'>Welkom!</h2>
                    <p style='font-size:16px; color:#555;'>Bedankt voor uw registratie.
                    Bevestig uw e-mailadres door op onderstaande knop te klikken.</p>
                    <p style='text-align:center;'>
                      <a href='{confirmationlink}' style='background:#0d6efd; color:#fff; padding:12px 24px; border-radius:6px; text-decoration:none; font-weight:bold;'>Bevestig uw e-mailadres</a>
                    </p>
                    <p style='font-size:12px; color:#999; margin-top:30px;'>&copy; {DateTime.UtcNow.Year} Audiform.</p>
                  </div>
                </body></html>";

            await SendEmailAsync(ToEmail, "Bevestig uw e-mailadres", htmlContent, true);
        }
        
        private async Task SendEmailAsync(string toEmail, string subject, string body, bool isBodyHtml = false)
        {
            try
            {
                var smtpServer = _config["EmailSettings:SmtpServer"];
                var smtpPort = int.Parse(_config["EmailSettings:SmtpPort"]);
                var senderEmail = _config["EmailSettings:SenderEmail"];
                var senderName = _config["EmailSettings:SenderName"];
                var password = _config["EmailSettings:Password"];

                using var message = new MailMessage
                {
                    From = new MailAddress(senderEmail, senderName),
                    Subject = subject,
                    Body = body,
                    IsBodyHtml = isBodyHtml,
                };

                message.To.Add(new MailAddress(toEmail));

                using var client = new SmtpClient(smtpServer, smtpPort)
                {
                    Credentials = new NetworkCredential(senderEmail, password),
                    EnableSsl = true
                };

                await client.SendMailAsync(message);
                
            }
            catch(Exception ex) 
            { 
                Console.WriteLine(ex.ToString());               
            
            }
        }
        public async Task SendResendConfirmationEmailAsync(string ToEmail, string confirmationLink)
        {
            string htmlcontent = $@"<html><body style='font-family: Arial, sans-serif; background-color: #f4f6f8; margin:0; padding:20px;'>
                  <div style='max-width:600px; margin:auto; background:#fff; padding:30px; border-radius:8px;'>
                    <h2 style='color:#333;'>Hallo!</h2>
                    <p style='font-size:16px; color:#555;'>U heeft een nieuwe e-mailbevestigingslink aangevraagd. Bevestig uw e-mailadres door op de onderstaande knop te klikken.</p>
                    <p style='text-align:center;'>
                      <a href='{confirmationLink}' style='background:#0d6efd; color:#fff; padding:12px 24px; border-radius:6px; text-decoration:none; font-weight:bold;'>Bevestig uw e-mailadres</a>
                    </p>
                    <p style='font-size:12px; color:#999; margin-top:30px;'>&copy; {DateTime.UtcNow.Year} Audiform.</p>
                  </div>
                </body></html>";

            await SendEmailAsync(ToEmail, "Nieuwe bevestigingsmail", htmlcontent, true);
        }

        public async Task SendAdminEmailConfirmationAsync(string ToEmail, string fullname, string requestedRole)
        {
            var adminemail = _config["EmailSettings:SenderEmail"];

            string htmlcontent = $@"<html><body style='font-family: Arial, sans-serif; background-color: #f4f6f8; margin:0; padding:20px;'>
                  <div style='max-width:600px; margin:auto; background:#fff; padding:30px; border-radius:8px;'>
                    <h2 style='color:#333;'>Nieuwe gebruikersregistratie</h2>
                    <p style='font-size:16px; color:#555;'>Er is een nieuwe gebruiker geregistreerd met de volgende gegevens:</p>
                    <ul style='font-size:16px; color:#555;'>
                      <li><strong>Naam:</strong> {fullname}</li>
                      <li><strong>Gevraagde rol:</strong> {requestedRole}</li>
                      <li><strong>E-mailadres:</strong> {ToEmail}</li>
                    </ul>
                    <p style='font-size:16px; color:#555;'>Gelieve deze registratie te beoordelen en de nodige acties te ondernemen.</p>
                    <p style='font-size:12px; color:#999; margin-top:30px;'>&copy; {DateTime.UtcNow.Year} Audiform.</p>
                  </div>
                </body></html>";

            await SendEmailAsync(adminemail!, "Nieuwe gebruikersregistratie", htmlcontent, true);

        }
    }
}