using Application.Orders;

namespace UnitTests.Orders;

public sealed class OrderUploadFileValidatorTests
{
    [Fact]
    public void Validate_AllowsUpToFourValidFiles()
    {
        var files = new[]
        {
            CreateFile("afdruk-1.png", "image/png", 1024),
            CreateFile("afdruk-2.jpg", "image/jpeg", 1024),
            CreateFile("afdruk-3.jpeg", "image/jpeg", 1024),
            CreateFile("afdruk-4.pdf", "application/pdf", 1024),
        };

        var exception = Record.Exception(() => OrderUploadFileValidator.Validate(files));

        Assert.Null(exception);
    }

    [Fact]
    public void Validate_RejectsMoreThanFourFiles()
    {
        var files = Enumerable
            .Range(1, 5)
            .Select(index => CreateFile($"afdruk-{index}.png", "image/png", 1024))
            .ToList();

        var exception = Assert.Throws<ArgumentException>(
            () => OrderUploadFileValidator.Validate(files));

        Assert.Equal("Er mogen maximaal 4 bestanden worden geüpload.", exception.Message);
    }

    [Fact]
    public void Validate_RejectsFilesLargerThanTenMb()
    {
        var files = new[]
        {
            CreateFile("te-groot.pdf", "application/pdf", 10 * 1024 * 1024 + 1),
        };

        var exception = Assert.Throws<ArgumentException>(
            () => OrderUploadFileValidator.Validate(files));

        Assert.Equal("Bestand 'te-groot.pdf' is groter dan 10MB.", exception.Message);
    }

    [Theory]
    [InlineData("script.exe", "application/pdf")]
    [InlineData("afdruk.pdf", "text/plain")]
    public void Validate_RejectsInvalidFileTypes(string fileName, string contentType)
    {
        var files = new[]
        {
            CreateFile(fileName, contentType, 1024),
        };

        var exception = Assert.Throws<ArgumentException>(
            () => OrderUploadFileValidator.Validate(files));

        Assert.Equal(
            $"Bestand '{fileName}' heeft een ongeldig bestandstype. Alleen PNG, JPG, JPEG en PDF zijn toegestaan.",
            exception.Message);
    }

    [Fact]
    public void Validate_RejectsEmptyFiles()
    {
        var files = new[]
        {
            CreateFile("leeg.png", "image/png", 0),
        };

        var exception = Assert.Throws<ArgumentException>(
            () => OrderUploadFileValidator.Validate(files));

        Assert.Equal("Bestand 'leeg.png' is leeg.", exception.Message);
    }

    private static OrderUploadFile CreateFile(
        string fileName,
        string contentType,
        long length) =>
        new(
            fileName,
            contentType,
            length,
            new MemoryStream());
}
