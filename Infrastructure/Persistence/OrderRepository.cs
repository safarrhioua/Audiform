using Application.Interfaces;
using Application.Orders;
using Domain.Entities;
using Npgsql;
namespace Infrastructure.Persistence;

public sealed class OrderRepository(NpgsqlDataSource dataSource) : IOrderRepository
{
    public async Task<IReadOnlyList<Order>> GetAllOrdersAsync(
        CancellationToken cancellationToken = default)
    {
        const string sql = """
            SELECT id, shop_order_id, patient_name, patient_number, order_date, delivery_date, status
            FROM orders
            ORDER BY id;
            """;
        await using var command = dataSource.CreateCommand(sql);
        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        var orders = new List<Order>();
        while (await reader.ReadAsync(cancellationToken))
        {
            orders.Add(new Order
            {
                Id = reader.GetInt32(0),
                OrderNumber = reader.IsDBNull(1) ? null : reader.GetString(1),
                PatientName = reader.IsDBNull(2) ? null : reader.GetString(2),
                PatientNumber = reader.IsDBNull(3) ? null : reader.GetString(3),
                OrderDate = reader.IsDBNull(4) ? null : reader.GetDateTime(4),
                DeliveryDate = reader.IsDBNull(5) ? null : reader.GetDateTime(5),
                Status = reader.IsDBNull(6) ? null : reader.GetString(6),
            });
        }
        return orders;
    }
    public async Task<CreateOrderSelectionData> CreateValidatedSelectionDataAsync(
        string earSide,
        int stepId,
        int? optionId,
        string? valueText,
        CancellationToken cancellationToken = default)
    {
        if (optionId is null)
        {
            return await CreateTextSelectionDataAsync(
                earSide,
                stepId,
                valueText,
                cancellationToken);
        }
        const string sql = """
            SELECT
                s."name" AS step_name,
                so."name" AS option_name
            FROM "steps" s
            JOIN "step_options" so ON so."step_id" = s."id"
            WHERE s."id" = @stepId
              AND so."id" = @optionId;
            """;
        await using var command = dataSource.CreateCommand(sql);
        command.Parameters.AddWithValue("stepId", stepId);
        command.Parameters.AddWithValue("optionId", optionId.Value);
        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        if (!await reader.ReadAsync(cancellationToken))
        {
            throw new ArgumentException(
                $"option_id '{optionId}' does not belong to step_id '{stepId}'.");
        }
        return new CreateOrderSelectionData(
            earSide,
            stepId,
            reader.GetString(0),
            optionId,
            reader.GetString(1),
            valueText);
    }
    private async Task<CreateOrderSelectionData> CreateTextSelectionDataAsync(
        string earSide,
        int stepId,
        string? valueText,
        CancellationToken cancellationToken)
    {
        const string sql = """
            SELECT "name"
            FROM "steps"
            WHERE "id" = @stepId;
            """;
        await using var command = dataSource.CreateCommand(sql);
        command.Parameters.AddWithValue("stepId", stepId);
        var result = await command.ExecuteScalarAsync(cancellationToken);
        if (result is null or DBNull)
        {
            throw new ArgumentException($"step_id '{stepId}' does not exist.");
        }
        return new CreateOrderSelectionData(
            earSide,
            stepId,
            (string)result,
            null,
            null,
            valueText);
    }
    public async Task<int> CreateOrderAsync(
        CreateOrderData order,
        CancellationToken cancellationToken = default)
    {
        await using var connection = await dataSource.OpenConnectionAsync(cancellationToken);
        await using var transaction = await connection.BeginTransactionAsync(cancellationToken);
        const string insertSql = """
            INSERT INTO "orders"
                ("shop_employee_id", "patient_name", "patient_number", "remarks", "send_method", "order_date", "delivery_date", "status")
            VALUES
                (@shopEmployeeId, @patientName, @patientNumber, @remarks, @sendMethod, @orderDate, @deliveryDate, @status)
            RETURNING "id";
            """;
        await using var insertCommand = new NpgsqlCommand(insertSql, connection, transaction);
        insertCommand.Parameters.AddWithValue("shopEmployeeId", order.ShopEmployeeId);
        insertCommand.Parameters.AddWithValue("patientName", order.PatientName);
        insertCommand.Parameters.AddWithValue("patientNumber", order.PatientNumber);
        insertCommand.Parameters.AddWithValue("remarks", (object?)order.Remarks ?? DBNull.Value);
        insertCommand.Parameters.AddWithValue("sendMethod", order.SendMethod);
        insertCommand.Parameters.AddWithValue("orderDate", order.OrderDate);
        insertCommand.Parameters.AddWithValue("deliveryDate", order.DeliveryDate);
        insertCommand.Parameters.AddWithValue("status", order.Status);
        var orderId = (int)(await insertCommand.ExecuteScalarAsync(cancellationToken)
            ?? throw new InvalidOperationException("The order id could not be created."));
        const string updateSql = """
            UPDATE "orders"
            SET "shop_order_id" = @shopOrderId
            WHERE "id" = @orderId;
            """;
        await using var updateCommand = new NpgsqlCommand(updateSql, connection, transaction);
        updateCommand.Parameters.AddWithValue("shopOrderId", $"ORD-{orderId:000}");
        updateCommand.Parameters.AddWithValue("orderId", orderId);
        await updateCommand.ExecuteNonQueryAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);
        return orderId;
    }
    public async Task AddOrderSelectionsAsync(
        int orderId,
        IReadOnlyCollection<CreateOrderSelectionData> selections,
        CancellationToken cancellationToken = default)
    {
        if (selections.Count == 0)
        {
            return;
        }
        const string sql = """
            INSERT INTO "order_selections"
                ("order_id", "ear_side", "step_id", "step_name", "option_id", "option_name", "value_text")
            VALUES
                (@orderId, @earSide, @stepId, @stepName, @optionId, @optionName, @valueText);
            """;
        await using var connection = await dataSource.OpenConnectionAsync(cancellationToken);
        await using var transaction = await connection.BeginTransactionAsync(cancellationToken);
        foreach (var selection in selections)
        {
            await using var command = new NpgsqlCommand(sql, connection, transaction);
            command.Parameters.AddWithValue("orderId", orderId);
            command.Parameters.AddWithValue("earSide", selection.EarSide);
            command.Parameters.AddWithValue("stepId", selection.StepId);
            command.Parameters.AddWithValue("stepName", (object?)selection.StepName ?? DBNull.Value);
            command.Parameters.AddWithValue("optionId", (object?)selection.OptionId ?? DBNull.Value);
            command.Parameters.AddWithValue("optionName", (object?)selection.OptionName ?? DBNull.Value);
            command.Parameters.AddWithValue("valueText", (object?)selection.ValueText ?? DBNull.Value);
            await command.ExecuteNonQueryAsync(cancellationToken);
        }
        await transaction.CommitAsync(cancellationToken);
    }
    public async Task AddOrderFilesAsync(
        int orderId,
        IReadOnlyCollection<CreateOrderFileData> files,
        CancellationToken cancellationToken = default)
    {
        if (files.Count == 0)
        {
            return;
        }
        const string sql = """
            INSERT INTO "order_files"
                ("order_id", "original_file_name", "file_name", "file_path", "content_type", "file_size", "uploaded_at")
            VALUES
                (@orderId, @originalFileName, @fileName, @filePath, @contentType, @fileSize, @uploadedAt);
            """;
        await using var connection = await dataSource.OpenConnectionAsync(cancellationToken);
        await using var transaction = await connection.BeginTransactionAsync(cancellationToken);
        foreach (var file in files)
        {
            await using var command = new NpgsqlCommand(sql, connection, transaction);
            command.Parameters.AddWithValue("orderId", orderId);
            command.Parameters.AddWithValue("originalFileName", file.OriginalFileName);
            command.Parameters.AddWithValue("fileName", file.FileName);
            command.Parameters.AddWithValue("filePath", file.FilePath);
            command.Parameters.AddWithValue("contentType", (object?)file.ContentType ?? DBNull.Value);
            command.Parameters.AddWithValue("fileSize", file.FileSize);
            command.Parameters.AddWithValue("uploadedAt", file.UploadedAt);
            await command.ExecuteNonQueryAsync(cancellationToken);
        }
        await transaction.CommitAsync(cancellationToken);
    }
    public async Task<IReadOnlyList<Order>> GetOrdersByUserAsync(
        string userId, CancellationToken cancellationToken = default)
    {
        const string sql = """
            SELECT o.id, o.shop_order_id, o.patient_name, o.patient_number, o.order_date, o.delivery_date, o.status
            FROM orders o
            JOIN shop_employees se ON se.id = o.shop_employee_id
            WHERE se.aspnetusers_id = @userId
              AND (o.delivery_date IS NULL OR o.delivery_date >= @cutoffDate)
            ORDER BY o.order_date DESC
            LIMIT 20;
            """;
        await using var command = dataSource.CreateCommand(sql);
        command.Parameters.AddWithValue("@userId", userId);
        command.Parameters.AddWithValue("@cutoffDate", DateTime.Today.AddDays(-7));
        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        var orders = new List<Order>();
        while (await reader.ReadAsync(cancellationToken))
        {
            orders.Add(new Order
            {
                Id = reader.GetInt32(0),
                OrderNumber = reader.IsDBNull(1) ? null : reader.GetString(1),
                PatientName = reader.IsDBNull(2) ? null : reader.GetString(2),
                PatientNumber = reader.IsDBNull(3) ? null : reader.GetString(3),
                OrderDate = reader.IsDBNull(4) ? null : reader.GetDateTime(4),
                DeliveryDate = reader.IsDBNull(5) ? null : reader.GetDateTime(5),
                Status = reader.IsDBNull(6) ? null : reader.GetString(6),
            });
        }
        return orders;
    }
    public async Task<IReadOnlyList<Order>> SearchOrdersByUserAsync(
        string userId, string query, CancellationToken cancellationToken = default)
    {
        const string sql = """
            SELECT o.id, o.shop_order_id, o.patient_name, o.patient_number, o.order_date, o.delivery_date, o.status
            FROM orders o
            JOIN shop_employees se ON se.id = o.shop_employee_id
            WHERE se.aspnetusers_id = @userId
              AND (
                o.shop_order_id ILIKE @query
                OR o.patient_name ILIKE @query
                OR o.patient_number ILIKE @query
              )
            ORDER BY o.order_date DESC;
            """;
        await using var command = dataSource.CreateCommand(sql);
        command.Parameters.AddWithValue("@userId", userId);
        command.Parameters.AddWithValue("@query", $"%{query}%");
        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        var orders = new List<Order>();
        while (await reader.ReadAsync(cancellationToken))
        {
            orders.Add(new Order
            {
                Id = reader.GetInt32(0),
                OrderNumber = reader.IsDBNull(1) ? null : reader.GetString(1),
                PatientName = reader.IsDBNull(2) ? null : reader.GetString(2),
                PatientNumber = reader.IsDBNull(3) ? null : reader.GetString(3),
                OrderDate = reader.IsDBNull(4) ? null : reader.GetDateTime(4),
                DeliveryDate = reader.IsDBNull(5) ? null : reader.GetDateTime(5),
                Status = reader.IsDBNull(6) ? null : reader.GetString(6),
            });
        }
        return orders;
    }
    public async Task<(IReadOnlyList<Order> Orders, int TotalCount)> GetOrdersByUserPagedAsync(
        string userId, int page, int pageSize, DateTime cutoffDate, CancellationToken cancellationToken = default)
    {
        const string countSql = """
            SELECT COUNT(*)
            FROM orders o
            JOIN shop_employees se ON se.id = o.shop_employee_id
            WHERE se.aspnetusers_id = @userId
              AND (o.delivery_date IS NULL OR o.delivery_date >= @cutoffDate);
            """;
        await using var countCommand = dataSource.CreateCommand(countSql);
        countCommand.Parameters.AddWithValue("@userId", userId);
        countCommand.Parameters.AddWithValue("@cutoffDate", cutoffDate);
        var totalCount = Convert.ToInt32(await countCommand.ExecuteScalarAsync(cancellationToken));
        const string sql = """
            SELECT o.id, o.shop_order_id, o.patient_name, o.patient_number,
                   o.order_date, o.delivery_date, o.status
            FROM orders o
            JOIN shop_employees se ON se.id = o.shop_employee_id
            WHERE se.aspnetusers_id = @userId
              AND (o.delivery_date IS NULL OR o.delivery_date >= @cutoffDate)
            ORDER BY o.order_date DESC
            LIMIT @pageSize OFFSET @offset;
            """;
        await using var command = dataSource.CreateCommand(sql);
        command.Parameters.AddWithValue("@userId", userId);
        command.Parameters.AddWithValue("@cutoffDate", cutoffDate);
        command.Parameters.AddWithValue("@pageSize", pageSize);
        command.Parameters.AddWithValue("@offset", (page - 1) * pageSize);
        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        var orders = new List<Order>();
        while (await reader.ReadAsync(cancellationToken))
        {
            orders.Add(new Order
            {
                Id = reader.GetInt32(0),
                OrderNumber = reader.IsDBNull(1) ? null : reader.GetString(1),
                PatientName = reader.IsDBNull(2) ? null : reader.GetString(2),
                PatientNumber = reader.IsDBNull(3) ? null : reader.GetString(3),
                OrderDate = reader.IsDBNull(4) ? null : reader.GetDateTime(4),
                DeliveryDate = reader.IsDBNull(5) ? null : reader.GetDateTime(5),
                Status = reader.IsDBNull(6) ? null : reader.GetString(6),
            });
        }
        return (orders, totalCount);
    }

    public async Task<IReadOnlyList<Order>> GetAllOrdersForEmployeeAsync(
    CancellationToken cancellationToken = default)
    {
        const string sql = """
        SELECT id, shop_order_id, patient_name, patient_number,
               order_date, delivery_date, status
        FROM orders
        ORDER BY order_date DESC;
        """;

        await using var command = dataSource.CreateCommand(sql);
        await using var reader = await command.ExecuteReaderAsync(cancellationToken);

        var orders = new List<Order>();
        while (await reader.ReadAsync(cancellationToken))
        {
            orders.Add(new Order
            {
                Id = reader.GetInt32(0),
                OrderNumber = reader.IsDBNull(1) ? null : reader.GetString(1),
                PatientName = reader.IsDBNull(2) ? null : reader.GetString(2),
                PatientNumber = reader.IsDBNull(3) ? null : reader.GetString(3),
                OrderDate = reader.IsDBNull(4) ? null : reader.GetDateTime(4),
                DeliveryDate = reader.IsDBNull(5) ? null : reader.GetDateTime(5),
                Status = reader.IsDBNull(6) ? null : reader.GetString(6),
            });
        }
        return orders;
    }

    public async Task UpdateOrderStatusAsync(
        int orderId,
        string newStatus,
        CancellationToken cancellationToken = default)
    {
        const string sql = """
        UPDATE orders
        SET status = @status
        WHERE id = @orderId;
        """;

        await using var command = dataSource.CreateCommand(sql);
        command.Parameters.AddWithValue("status", newStatus);
        command.Parameters.AddWithValue("orderId", orderId);

        var rows = await command.ExecuteNonQueryAsync(cancellationToken);
        if (rows == 0)
            throw new KeyNotFoundException($"Order met id {orderId} niet gevonden.");
    }
}
