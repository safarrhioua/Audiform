// GetOrdersServiceTests.cs
using Application.Interfaces;
using Application.Orders;
using Domain.Entities;
using Moq;

public class GetOrdersServiceTests
{
    private readonly Mock<IOrderRepository> _repoMock = new();
    private readonly GetOrdersService _sut;

    public GetOrdersServiceTests()
    {
        _sut = new GetOrdersService(_repoMock.Object);
    }

    // Test voor GetOrdersAsync, worden alleen orders niet ouder dan 7 dagen na leverdatum weergegeven?
    [Fact]
    public async Task GetOrdersAsync_FiltersOrdersOlderThanSevenDays()
    {
        // Arrange
        var userId = "user1";
        var orders = new List<Order>
{
    new() { Id = 1, DeliveryDate = (DateTime?)DateTime.Today, Status = "actief" },
    new() { Id = 2, DeliveryDate = (DateTime?)DateTime.Today.AddDays(-10), Status = "oud" }
};
        _repoMock.Setup(r => r.GetOrdersByUserAsync(userId, default))
         .ReturnsAsync((IReadOnlyList<Order>)orders);

        // Act
        var result = await _sut.GetOrdersAsync(userId);

        // Assert
        Assert.Single(result);
        Assert.Equal(1, result[0].Id);
    }

    // Test voor SearchOrdersAsync, worden resutaten correct gemapt naar OrderDTO
    [Fact]
    public async Task SearchOrdersAsync_GeeftGezochteOrdersTerug()
    {
        // Arrange
        var userId = "user1";
        var orders = new List<Order>
    {
        new() { Id = 3, OrderNumber = "A001", PatientName = "Jan Jansen", Status = "actief" },
        new() { Id = 4, OrderNumber = "A002", PatientName = "Piet Pietersen", Status = "actief" }
    };

        _repoMock.Setup(r => r.SearchOrdersByUserAsync(userId, "Jan", default))
                 .ReturnsAsync((IReadOnlyList<Order>)orders);

        // Act
        var result = await _sut.SearchOrdersAsync(userId, "Jan");

        // Assert
        Assert.Equal(2, result.Count);
        Assert.Equal("Jan Jansen", result[0].PatientName);
    }
}