using Application;
using Application.Interfaces;
using Application.IRepo;
using Application.Services;
using Castle.Core.Smtp;
using Domain.Entities;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
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
        private readonly Mock<RoleManager<IdentityRole>> _mockRoleManager;
        private readonly Mock<IUserProfileRepository> _mockProfileRepository;
        public UserAuth()
        {
            _userStoreMock = new Mock<IUserStore<ApplicationUser>>();
            var roleStore = new Mock<IRoleStore<IdentityRole>>();

            _mockRoleManager = new Mock<RoleManager<IdentityRole>>(
                roleStore.Object,
                null!, null!, null!, null!
            );
            _mockProfileRepository = new Mock<IUserProfileRepository>();
            _Mockusermanager = new Mock<UserManager<ApplicationUser>>(
                _userStoreMock.Object,
                null!, null!, null!, null!, null!, null!, null!, null!);

            var contextAccessor = new Mock<IHttpContextAccessor>();
            var claimsFactory = new Mock<IUserClaimsPrincipalFactory<ApplicationUser>>();
            var options = new Mock<IOptions<IdentityOptions>>();
            var logger = new Mock<ILogger<SignInManager<ApplicationUser>>>();
            var schemes = new Mock<Microsoft.AspNetCore.Authentication.IAuthenticationSchemeProvider>();
            var confirmation = new Mock<IUserConfirmation<ApplicationUser>>();

            options.Setup(o => o.Value).Returns(new IdentityOptions());

            _mockSignInManager = new Mock<SignInManager<ApplicationUser>>(
                _Mockusermanager.Object,
                contextAccessor.Object,
                claimsFactory.Object,
                options.Object,
                logger.Object,
                schemes.Object,
                confirmation.Object
            );
            _mockConfig = new Mock<IConfiguration>();
            _mockConfirmationService = new Mock<IConfirmationService>();

        }
        [Fact]
        public async Task RegisterUserAsync_newuser_returnSucces()
        {
            _mockConfig
            .Setup(x => x["AppSettings:BackendBaseUrl"])
              .Returns("https://localhost:7050");
            _Mockusermanager.Setup(x => x.FindByEmailAsync("test@outlook.com"))
          .ReturnsAsync((ApplicationUser?)(null));
            _Mockusermanager.Setup(x => x.CreateAsync(It.IsAny<ApplicationUser>(), "Test"))
            .ReturnsAsync(IdentityResult.Success);

            _Mockusermanager.Setup(x => x.GenerateEmailConfirmationTokenAsync(It.IsAny<ApplicationUser>()))
            .ReturnsAsync("test_token");
            _mockRoleManager.Setup(x => x.RoleExistsAsync("ShopEmployee"))
            .ReturnsAsync(true);


            _mockProfileRepository.Setup(x => x.AssignRoleAsync(It.IsAny<ApplicationUser>(), "ShopEmployee"))
                .Returns(Task.CompletedTask);

            _mockConfirmationService
            .Setup(x => x.SendRegisterationConfirmationEmailAsync(
             It.IsAny<string>(),
             It.IsAny<string>()))
            .Returns(Task.CompletedTask);

            var authservice = new AuthService(_Mockusermanager.Object, null!, _mockConfig.Object, _mockConfirmationService.Object, _mockRoleManager.Object, _mockProfileRepository.Object);


            var newuser = new ApplicationUser
            {
                Fullname = "John",
                Email = "test@outlook.com",
                UserName = "john@outlook.com"
            };

            //Act
            var result = await authservice.RegisterUserAsync(newuser, "Test","ShopEmployee");

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
            _Mockusermanager.Setup(x => x.IsEmailConfirmedAsync(existeduser))
                .ReturnsAsync(true);
            _Mockusermanager.Setup(x=>x.IsInRoleAsync(existeduser,"PendingEmployee"))
                .ReturnsAsync(false);


            _mockSignInManager.Setup(x => x.PasswordSignInAsync(existeduser.UserName, "Test", false, false))
                .ReturnsAsync(SignInResult.Success);

            _Mockusermanager.Setup(x=>x.GetRolesAsync(existeduser))
                .ReturnsAsync(new List<string> { "ShopEmployee" });

            var authservice = new AuthService(_Mockusermanager.Object, _mockSignInManager.Object, _mockConfig.Object, _mockConfirmationService.Object, _mockRoleManager.Object, _mockProfileRepository.Object);

            //Act
            var result = await authservice.LoginUserAsync("Test123@outlook.com", "Test");

            Assert.True(result.Success);
            Assert.Equal("Inloggen is gelukt!", result.Message);
            Assert.Equal("ShopEmployee", result.Role);

        }
    }
}