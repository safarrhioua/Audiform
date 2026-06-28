using Application.Orders;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Audiform.Server.Controllers;

[ApiController]
[Authorize(Roles = "Employee")]
[Route("api/employee/orders")]
public sealed class EmployeeOrdersController(
    IGetEmployeeOrdersService getOrdersService,
    IUpdateOrderStatusService updateStatusService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<OrderDto>>> GetAll(
        CancellationToken cancellationToken = default)
    {
        var orders = await getOrdersService.GetAllOrdersAsync(cancellationToken);
        return Ok(orders);
    }

    [HttpPatch("{id:int}/status")]
    public async Task<IActionResult> UpdateStatus(
        int id,
        [FromBody] UpdateStatusRequest request,
        CancellationToken cancellationToken = default)
    {
        try
        {
            await updateStatusService.UpdateAsync(id, request.Status, cancellationToken);
            return NoContent();
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
    }
}

public sealed record UpdateStatusRequest(string Status);