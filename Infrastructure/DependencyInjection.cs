using Application.EarpieceTemplates;
using Application.Interfaces;
using Application.Orders;
using Infrastructure.Persistence;
using Infrastructure.Security;
using Infrastructure.Storage;
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
        services.AddScoped<IOrderRepository, OrderRepository>();
        services.AddScoped<IOrderFileStorage, OrderFileStorage>();
        services.AddScoped<IUserShopContext, UserShopContext>();
        services.AddScoped<IGetAvailableTemplatesService, EarpieceTemplateService>();
        services.AddScoped<ICreateEarpieceOrderService, CreateEarpieceOrderService>();

        return services;
    }
}
