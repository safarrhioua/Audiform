using System.Text.Json;
using System.Text.Json.Serialization;
using Application.Interfaces;

namespace Application.Orders;

public sealed class CreateEarpieceOrderService(
    IUserShopContext userShopContext,
    IShopEmployeeRepository shopEmployeeRepository,
    IOrderRepository orderRepository,
    IOrderFileStorage orderFileStorage) : ICreateEarpieceOrderService
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true,
    };

    public async Task<CreateEarpieceOrderResponse> CreateOrderAsync(
        CreateEarpieceOrderRequest request,
        CancellationToken cancellationToken = default)
    {
        try
        {
            return await CreateOrderInternalAsync(request, cancellationToken);
        }
        finally
        {
            foreach (var file in request.Files)
            {
                file.Content.Dispose();
            }
        }
    }

    private async Task<CreateEarpieceOrderResponse> CreateOrderInternalAsync(
        CreateEarpieceOrderRequest request,
        CancellationToken cancellationToken)
    {
        ValidateRequiredOrderFields(request);
        OrderUploadFileValidator.Validate(request.Files);

        var selectionInputs = ParseSelections(request.SelectionsJson!);
        var selections = await CreateValidatedSelectionsAsync(selectionInputs, cancellationToken);
        var sendMethod = NormalizeSendMethod(request.SendMethod);

        var userId = userShopContext.GetCurrentUserId();
        var shopEmployeeId = await shopEmployeeRepository.GetShopEmployeeIdByUserIdAsync(
            userId,
            cancellationToken);

        if (shopEmployeeId is null)
        {
            throw new InvalidOperationException(
                $"User '{userId}' is not linked to a shop_employee.");
        }

        var orderId = await orderRepository.CreateOrderAsync(
            new CreateOrderData(
                shopEmployeeId.Value,
                request.PatientName!.Trim(),
                request.PatientNumber!.Trim(),
                string.IsNullOrWhiteSpace(request.Remarks) ? null : request.Remarks.Trim(),
                sendMethod,
                DateTime.UtcNow,
                request.DeliveryDate!.Value,
                "nieuw"),
            cancellationToken);

        await orderRepository.AddOrderSelectionsAsync(
            orderId,
            selections,
            cancellationToken);

        IReadOnlyList<CreateOrderFileData> storedFiles = [];

        if (request.Files.Count > 0)
        {
            storedFiles = await orderFileStorage.SaveFilesAsync(
                orderId,
                request.Files,
                cancellationToken);

            await orderRepository.AddOrderFilesAsync(
                orderId,
                storedFiles,
                cancellationToken);
        }

        return new CreateEarpieceOrderResponse(
            orderId,
            $"ORD-{orderId:000}",
            request.PatientName.Trim(),
            request.PatientNumber.Trim(),
            request.DeliveryDate.Value,
            string.IsNullOrWhiteSpace(request.Remarks) ? null : request.Remarks.Trim(),
            sendMethod,
            storedFiles.Select(file => file.OriginalFileName).ToList(),
            selections);
    }

    private static void ValidateRequiredOrderFields(CreateEarpieceOrderRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.PatientName))
        {
            throw new ArgumentException("patient_name required.");
        }

        if (string.IsNullOrWhiteSpace(request.PatientNumber))
        {
            throw new ArgumentException("patient_number required.");
        }

        if (request.DeliveryDate is null)
        {
            throw new ArgumentException("delivery_date required.");
        }

        if (string.IsNullOrWhiteSpace(request.SelectionsJson))
        {
            throw new ArgumentException("selections_json required.");
        }
    }

    private static IReadOnlyList<OrderSelectionInput> ParseSelections(string selectionsJson)
    {
        List<OrderSelectionInput>? inputs;

        try
        {
            inputs = JsonSerializer.Deserialize<List<OrderSelectionInput>>(
                selectionsJson,
                JsonOptions);
        }
        catch (JsonException exception)
        {
            throw new ArgumentException("selections_json must contain valid JSON.", exception);
        }

        if (inputs is null || inputs.Count == 0)
        {
            throw new ArgumentException("selections_json must contain at least one selection.");
        }

        foreach (var input in inputs)
        {
            input.EarSide = input.EarSide?.Trim().ToLowerInvariant();

            if (input.EarSide is not ("left" or "right"))
            {
                throw new ArgumentException("ear_side must be either left or right.");
            }

            if (input.StepId is null)
            {
                throw new ArgumentException("step_id is required for every selection.");
            }
        }

        return inputs;
    }

    private async Task<IReadOnlyList<CreateOrderSelectionData>> CreateValidatedSelectionsAsync(
        IReadOnlyCollection<OrderSelectionInput> selectionInputs,
        CancellationToken cancellationToken)
    {
        var selections = new List<CreateOrderSelectionData>();

        foreach (var selectionInput in selectionInputs)
        {
            selections.Add(await orderRepository.CreateValidatedSelectionDataAsync(
                selectionInput.EarSide!,
                selectionInput.StepId!.Value,
                selectionInput.OptionId,
                NullIfWhiteSpace(selectionInput.ValueText),
                cancellationToken));
        }

        return selections;
    }

    private static string? NullIfWhiteSpace(string? value) =>
        string.IsNullOrWhiteSpace(value) ? null : value.Trim();

    private static string NormalizeSendMethod(string? sendMethod)
    {
        if (string.IsNullOrWhiteSpace(sendMethod))
        {
            return "physical";
        }

        var normalizedSendMethod = sendMethod.Trim().ToLowerInvariant();

        if (normalizedSendMethod is not ("physical" or "digital"))
        {
            throw new ArgumentException("send_method must be either physical or digital.");
        }

        return normalizedSendMethod;
    }

    private sealed class OrderSelectionInput
    {
        [JsonPropertyName("ear_side")]
        public string? EarSide { get; set; }

        [JsonPropertyName("step_id")]
        public int? StepId { get; init; }

        [JsonPropertyName("option_id")]
        public int? OptionId { get; init; }

        [JsonPropertyName("value_text")]
        public string? ValueText { get; init; }
    }
}
