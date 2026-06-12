using Application.EarpieceTemplates;
using Application.Interfaces;
using Domain.Entities;
using Moq;

namespace UnitTests.EarpieceTemplates;

public class EarpieceTemplateServiceTests
{
    [Fact]
    public async Task GetAvailableTemplatesAsync_WhenTemplateIsBlocked_ReturnsOnlyAllowedTemplates()
    {
        // Arrange
        var userShopContextMock = new Mock<IUserShopContext>();
        var templateRepositoryMock = new Mock<IEarpieceTemplateRepository>();
        var restrictionRepositoryMock = new Mock<IShopRestrictionRepository>();

        userShopContextMock
            .Setup(x => x.GetCurrentShopIdAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        templateRepositoryMock
            .Setup(x => x.GetAllTemplatesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<EarpieceTemplate>
            {
                new()
                {
                    Id = 1,
                    Name = "Gesloten Oorstukje",
                    Description = "Beschikbaar template",
                    ImagePath = "/images/gesloten.png",
                    Version = 1
                },
                new()
                {
                    Id = 2,
                    Name = "Open Oorstukje",
                    Description = "Geblokkeerd template",
                    ImagePath = "/images/open.png",
                    Version = 1
                }
            });

        restrictionRepositoryMock
            .Setup(x => x.GetBlockedTemplateIdsAsync(1, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new HashSet<int> { 2 });

        var service = new EarpieceTemplateService(
            userShopContextMock.Object,
            templateRepositoryMock.Object,
            restrictionRepositoryMock.Object
        );

        // Act
        var result = await service.GetAvailableTemplatesAsync();

        // Assert
        Assert.Single(result);

        var template = result[0];

        Assert.Equal(1, template.Id);
        Assert.Equal("Gesloten Oorstukje", template.Name);
        Assert.Equal("Beschikbaar template", template.Description);
        Assert.Equal("/images/gesloten.png", template.ImagePath);
        Assert.Equal(1, template.Version);

        Assert.DoesNotContain(result, item => item.Id == 2);
    }
}