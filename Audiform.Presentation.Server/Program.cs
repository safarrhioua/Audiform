using Application;
using Application.Interfaces;
using Application.Services;
using Infrastructure.Data;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

builder.Services.AddOpenApi();

builder.Services.AddDbContext<ApplicationDbContext>(options =>

    options.UseNpgsql(builder.Configuration.GetConnectionString("defaultconnection")));


builder.Services.AddIdentity<ApplicationUser, IdentityRole>()

    .AddEntityFrameworkStores<ApplicationDbContext>();

builder.Services.AddScoped<IAuthService, AuthService>();



builder.Services.AddCors(options =>

{

    options.AddPolicy("frontend", policy =>

        policy.WithOrigins("https://localhost:52914", "https://localhost:52915") 


              .AllowCredentials()
              .AllowAnyHeader()
              .AllowAnyMethod());

});



var app = builder.Build();



app.UseHttpsRedirection();
app.UseRouting();
app.UseCors("frontend");

app.UseDefaultFiles();

app.MapStaticAssets();



app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();


app.MapFallbackToFile("/index.html");


app.Run();