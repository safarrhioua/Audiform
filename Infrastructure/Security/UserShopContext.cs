using System.Security.Claims;
using Application.Interfaces;
using Microsoft.AspNetCore.Http;

namespace Infrastructure.Security;

public sealed class UserShopContext(
    IHttpContextAccessor httpContextAccessor,
    IShopEmployeeRepository shopEmployeeRepository) : IUserShopContext
{
    public string GetCurrentUserId()
    {
        var user = httpContextAccessor.HttpContext?.User;
        var userId = user?.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrWhiteSpace(userId))
        {
            throw new UnauthorizedAccessException("No authenticated user id was found.");
        }

        return userId;
    }

    public async Task<int> GetCurrentShopIdAsync(CancellationToken cancellationToken = default)
    {
        var userId = GetCurrentUserId();
        var shopId = await shopEmployeeRepository.GetShopIdByUserIdAsync(userId, cancellationToken);

        return shopId
            ?? throw new InvalidOperationException(
                $"User '{userId}' is not linked to a shop in shop_employees.");
    }
}
