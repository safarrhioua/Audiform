using Application.EarpieceTemplates;
using Application.Interfaces;
using Application.Orders;
using Infrastructure.Persistence;
using Infrastructure.Security;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Npgsql;

namespace Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("Connection string 'DefaultConnection' is missing.");

        services.AddSingleton(_ => new NpgsqlDataSourceBuilder(connectionString).Build());
        services.AddScoped<IEarpieceTemplateRepository, EarpieceTemplateRepository>();  
        services.AddScoped<IShopRestrictionRepository, ShopRestrictionRepository>();
        services.AddScoped<IShopEmployeeRepository, ShopEmployeeRepository>();
        services.AddScoped<IUserShopContext, UserShopContext>();
        services.AddScoped<IGetAvailableTemplatesService, EarpieceTemplateService>();
        services.AddScoped<IOrderRepository, OrderRepository>();
        services.AddScoped<IGetOrdersService, GetOrdersService>();

        return services;
    }
}
