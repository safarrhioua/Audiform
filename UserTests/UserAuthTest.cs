using Application.Interfaces;
using Application.IRepo;
using Application.Services;
using Domain.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Moq;
using System.Threading.Tasks;
using Xunit;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System.Collections.Generic;
using Microsoft.AspNetCore.Authentication;

namespace UserTests
{
    public class UserAuthTest
    {
        private readonly Mock<UserManager<ApplicationUser>> _userManagerMock;
        private readonly Mock<RoleManager<IdentityRole>> _roleManagerMock;
        private readonly Mock<IConfiguration> _configMock;
        private readonly Mock<IConfirmationService> _confirmationMock;
        private readonly Mock<IUserProfileRepository> _profileRepoMock;
        private readonly Mock<SignInManager<ApplicationUser>> _signInManagerMock;

        public UserAuthTest()
        {
            var userStoreMock = new Mock<IUserStore<ApplicationUser>>();

            _userManagerMock = new Mock<UserManager<ApplicationUser>>(
                userStoreMock.Object,
                null!, null!, null!, null!, null!, null!, null!, null!);
            var contextAccessor = new Mock<IHttpContextAccessor>();
            var claimsFactory = new Mock<IUserClaimsPrincipalFactory<ApplicationUser>>();
            var options = new Mock<IOptions<IdentityOptions>>();
            var logger = new Mock<ILogger<SignInManager<ApplicationUser>>>();
            var schemes = new Mock<IAuthenticationSchemeProvider>();
            var confirmation = new Mock<IUserConfirmation<ApplicationUser>>();
            

            options.Setup(x => x.Value).Returns(new IdentityOptions());

            _signInManagerMock = new Mock<SignInManager<ApplicationUser>>(
     _userManagerMock.Object,
     new Mock<IHttpContextAccessor>().Object,
     new Mock<IUserClaimsPrincipalFactory<ApplicationUser>>().Object,
     new Mock<IOptions<IdentityOptions>>().Object,
     new Mock<ILogger<SignInManager<ApplicationUser>>>().Object,
     new Mock<IAuthenticationSchemeProvider>().Object,
     new Mock<IUserConfirmation<ApplicationUser>>().Object
 );
            var roleStoreMock = new Mock<IRoleStore<IdentityRole>>();

            _roleManagerMock = new Mock<RoleManager<IdentityRole>>(
                roleStoreMock.Object,
                null!, null!, null!, null!);

            _configMock = new Mock<IConfiguration>();
            _confirmationMock = new Mock<IConfirmationService>();
            _profileRepoMock = new Mock<IUserProfileRepository>();
        }

        [Fact]
        public async Task RegisterUserAsync_NewShopEmployee_ReturnsSuccess()
        {
            var user = new ApplicationUser
            {
                Id = "user-1",
                Fullname = "John",
                Email = "test@outlook.com",
                UserName = "john@outlook.com"
            };

            _configMock
                .Setup(x => x["AppSettings:BackendBaseUrl"])
                .Returns("https://localhost:7050");

            _userManagerMock
                .Setup(x => x.FindByEmailAsync(user.Email!))
                .ReturnsAsync((ApplicationUser?)null);

            _userManagerMock
                .Setup(x => x.CreateAsync(user, "Test"))
                .ReturnsAsync(IdentityResult.Success);

            _roleManagerMock
                .Setup(x => x.RoleExistsAsync("ShopEmployee"))
                .ReturnsAsync(true);

            _userManagerMock
                .Setup(x => x.AddToRoleAsync(user, "ShopEmployee"))
                .ReturnsAsync(IdentityResult.Success);

            _profileRepoMock
                .Setup(x => x.AssignRoleAsync(user, "ShopEmployee"))
                .Returns(Task.CompletedTask);

            _userManagerMock
                .Setup(x => x.GenerateEmailConfirmationTokenAsync(user))
                .ReturnsAsync("test_token");

            _confirmationMock
                .Setup(x => x.SendRegisterationConfirmationEmailAsync(
                    user.Email!,
                    It.IsAny<string>()))
                .Returns(Task.CompletedTask);

            var authService = new AuthService(
                _userManagerMock.Object,
                null!,
                _configMock.Object,
                _confirmationMock.Object,
                _roleManagerMock.Object,
                _profileRepoMock.Object);

            var result = await authService.RegisterUserAsync(user, "Test", "ShopEmployee");

            Assert.True(result.Success);
            Assert.Equal("Jij bent geregistreerd! ", result.Message);

            _userManagerMock.Verify(x => x.AddToRoleAsync(user, "ShopEmployee"), Times.Once);
            _profileRepoMock.Verify(x => x.AssignRoleAsync(user, "ShopEmployee"), Times.Once);
            _confirmationMock.Verify(x => x.SendRegisterationConfirmationEmailAsync(
                user.Email!,
                It.IsAny<string>()), Times.Once);
        }


        [Fact]
        public async Task LoginUserAsync_ExistedUser_Returnsuccess()
        {
            var existeduser = new ApplicationUser
            {
                Id = "user-1",
                Email = "Test123@outlook.com",
                UserName = "Test",
                EmailConfirmed = true
            };

            _userManagerMock
                .Setup(x => x.FindByEmailAsync("Test123@outlook.com"))
                .ReturnsAsync(existeduser);

            _userManagerMock
                .Setup(x => x.IsEmailConfirmedAsync(existeduser))
                .ReturnsAsync(true);

            _userManagerMock
                .Setup(x => x.IsInRoleAsync(existeduser, "PendingEmployee"))
                .ReturnsAsync(false);

            _signInManagerMock
                .Setup(x => x.PasswordSignInAsync(
                    existeduser.UserName,
                    "Test",
                    false,
                    true))
                .ReturnsAsync(SignInResult.Success);

            _userManagerMock
                .Setup(x => x.GetRolesAsync(existeduser))
                .ReturnsAsync(new List<string> { "ShopEmployee" });

            var authService = new AuthService(
                _userManagerMock.Object,
                _signInManagerMock.Object,
                _configMock.Object,
                _confirmationMock.Object,
                _roleManagerMock.Object,
                _profileRepoMock.Object);

            var result = await authService.LoginUserAsync("Test123@outlook.com", "Test");

            Assert.True(result.Success);
            Assert.Equal("Inloggen is gelukt!", result.Message);
            Assert.Equal("ShopEmployee", result.Role);
        }
    }
}