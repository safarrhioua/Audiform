using Application;
using Application.Interfaces;
using Application.Services;
using Infrastructure;
using Infrastructure.Data;

using Microsoft.EntityFrameworkCore;
using Domain.Entities;
using Microsoft.AspNetCore.Identity;
using Application.IRepo;
using Infrastructure.Repos;

var builder = WebApplication.CreateBuilder(args);

// Controllers gebruiken voor REST API endpoints
builder.Services.AddControllers();

// Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Nodig voor UserShopContext
builder.Services.AddHttpContextAccessor();

// Database + infrastructure
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("defaultconnection")));

builder.Services.AddInfrastructure(builder.Configuration);

// Identity
builder.Services.AddIdentity<ApplicationUser, IdentityRole>()
    .AddEntityFrameworkStores<ApplicationDbContext>()
    .AddDefaultTokenProviders();

// Auth services
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IConfirmationService, EmailService>();
builder.Services.AddScoped<IUserManagement, UserManagement>();
builder.Services.AddScoped<IUserProfileRepository, UserRepo>();
builder.Services.AddScoped<IAdressManagement, AdressManagement>();
builder.Services.AddScoped<IAdressRepo, AdressRepository>();

// Cookie authentication voor API
builder.Services.ConfigureApplicationCookie(options =>
{
    options.Cookie.Name = ".AspNetCore.Identity.Application";
    options.LoginPath = "/dev-login";

    options.Events.OnRedirectToLogin = context =>
    {
        if (context.Request.Path.StartsWithSegments("/api"))
        {
            context.Response.StatusCode = StatusCodes.Status401Unauthorized;
            return Task.CompletedTask;
        }

        context.Response.Redirect(context.RedirectUri);
        return Task.CompletedTask;
    };

    options.Events.OnRedirectToAccessDenied = context =>
    {
        if (context.Request.Path.StartsWithSegments("/api"))
        {
            context.Response.StatusCode = StatusCodes.Status403Forbidden;
            return Task.CompletedTask;
        }

        context.Response.Redirect(context.RedirectUri);
        return Task.CompletedTask;
    };
});

// CORS voor frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("frontend", policy =>
        policy.WithOrigins("https://localhost:52914", "https://localhost:52915", "https://localhost:60942")
              .AllowCredentials()
              .AllowAnyHeader()
              .AllowAnyMethod());
});

builder.Services.AddAuthorization();

var app = builder.Build();
using (var scope = app.Services.CreateScope())
{
    var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();

    string[] roles = { "Employee", "ShopEmployee", "PendingEmployee"};

    foreach (var role in roles)
    {
        if (!await roleManager.RoleExistsAsync(role))
        {
            await roleManager.CreateAsync(new IdentityRole(role));
        }
    }
}

app.UseDefaultFiles();
app.MapStaticAssets();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseRouting();
app.UseCors("frontend");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.MapFallbackToFile("/index.html");

app.Run();