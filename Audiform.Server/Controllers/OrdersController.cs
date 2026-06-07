using Application.Orders;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Audiform.Server.Controllers;

[ApiController]
[Authorize]
[Route("api/orders")]
public sealed class OrdersController(
    IGetOrdersService getOrdersService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<OrderDto>>> GetOrders(
        CancellationToken cancellationToken)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null) return Unauthorized();

        try
        {
            var orders = await getOrdersService.GetOrdersAsync(userId, cancellationToken);
            return Ok(orders);
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized();
        }
    }
}