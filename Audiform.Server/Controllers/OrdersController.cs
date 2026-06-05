using Application.Orders;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Audiform.Server.Controllers;

[ApiController]
//[Authorize]
[Route("api/orders")]
public sealed class OrdersController(
    IGetOrdersService getOrdersService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<OrderDto>>> GetOrders(
        CancellationToken cancellationToken)
    {
        try
        {
            var orders = await getOrdersService.GetOrdersAsync(cancellationToken);
            return Ok(orders);
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized();
        }
    }
}