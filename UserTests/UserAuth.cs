using Application;
using Application.Interfaces;
using Moq;
using System.Net.WebSockets;
using System.Runtime.CompilerServices;
using System.Threading.Tasks;

namespace UserTests
{
    public class UserAuth
    {
        private readonly Mock<IAuthService> _authService;

        public UserAuth()
        {
            _authService = new Mock<IAuthService>(MockBehavior.Strict);
        }

        [Fact]
        public async Task RegisterUserAsync()
        {
            //user registration test case
            var user = new ApplicationUser
            {
                Name = "John Doe",
                Email = "John@123",
                Phonenumber = "1234567890"
            };

            var expectedresult = new AuthResult();
            _authService.Setup(x => x.RegisterUserAsync(user)).ReturnsAsync(expectedresult);

            var result = await _authService.Object.RegisterUserAsync(user);
            Assert.Equal(expectedresult, result);
        }
        [Fact]
        public async Task LoginUserAsync()
        {
            var mockservice = new Mock<IAuthService>();
            var usertest = new ApplicationUser
            {
                Email = "John@Doe",
                Password = "Test142",
                RememberMe = false

            };
            
        }
    }
}
