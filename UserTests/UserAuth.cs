using Application;
using Application.Interfaces;
using Application.Services;
using Castle.Core.Smtp;
using Domain.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Moq;
using System.Net.WebSockets;
using System.Runtime.CompilerServices;
using System.Threading.Tasks;

namespace UserTests
{
    public class UserAuth
    {

        private readonly Mock<IUserStore<ApplicationUser>> _userStoreMock;
        private readonly Mock<UserManager<ApplicationUser>> _Mockusermanager;
        private readonly Mock<SignInManager<ApplicationUser>> _mockSignInManager;
        private readonly Mock<IConfiguration> _mockConfig;
        private readonly Mock<IConfirmationService> _mockConfirmationService;
        public UserAuth()
        {
            _userStoreMock = new Mock<IUserStore<ApplicationUser>>();
            _Mockusermanager = new Mock<UserManager<ApplicationUser>>(
                _userStoreMock.Object,
                null, null, null, null, null, null, null, null);

            _mockSignInManager = new Mock<SignInManager<ApplicationUser>>(
                _Mockusermanager.Object,
                 null, null, null, null);

            _mockConfig = new Mock<IConfiguration>();
            _mockConfirmationService = new Mock<IConfirmationService>();

        }
        [Fact]
        public async Task RegisterUserAsync_newuser_returnSucces()
        {

            _mockConfig
            .Setup(x => x["AppSettings:BackendBaseUrl"])
              .Returns("https://localhost:7050");

            _mockConfirmationService
            .Setup(x => x.SendRegisterationConfirmationEmailAsync(
             It.IsAny<string>(),
             It.IsAny<string>()))
            .Returns(Task.CompletedTask);
            var authservice = new AuthService(_Mockusermanager.Object, null!, _mockConfig.Object, _mockConfirmationService.Object);


            _Mockusermanager.Setup(x => x.FindByEmailAsync("test@outlook.com"))
            .ReturnsAsync((ApplicationUser?)(null));
            _Mockusermanager.Setup(x => x.CreateAsync(It.IsAny<ApplicationUser>(), "Test"))
            .ReturnsAsync(IdentityResult.Success);

            _Mockusermanager.Setup(x => x.GenerateEmailConfirmationTokenAsync(It.IsAny<ApplicationUser>()))
            .ReturnsAsync("test_token");



            var newuser = new ApplicationUser
            {
                Fullname = "John",
                Email = "test@outlook.com",
                UserName = "john@outlook.com"
            };

            //Act
            var result = await authservice.RegisterUserAsync(newuser, "Test");

            //Assert    
            Assert.True(result.Success);
            Assert.Equal("Jij bent geregistreerd! ", result.Message);
        }
        [Fact]
        public async Task LoginUserAsync_ExistedUser_Returnsuccess()
        {
            var existeduser = new ApplicationUser
            {
                Email = "Test123@outlook.com",
                UserName = "Test",
                EmailConfirmed = true,
            };
                
            _Mockusermanager.Setup(x => x.FindByEmailAsync("Test123@outlook.com"))
                .ReturnsAsync(existeduser);
            _Mockusermanager.Setup(x => x.IsEmailConfirmedAsync(It.IsAny<ApplicationUser>()))
                .ReturnsAsync(true);

            _mockSignInManager.Setup(x => x.PasswordSignInAsync(existeduser.UserName, "Test", false, false))
                .ReturnsAsync(SignInResult.Success);
            var authservice = new AuthService(_Mockusermanager.Object, _mockSignInManager.Object, _mockConfig.Object, _mockConfirmationService.Object);

            //Act
            var result = await authservice.LoginUserAsync("Test123@outlook.com", "Test");

            Assert.True(result.Success);
            Assert.Equal("Inloggen is gelukt!", result.Message);
        }
    }
}