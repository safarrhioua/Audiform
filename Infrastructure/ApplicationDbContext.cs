using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Infrastructure.Data;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;


namespace Infrastructure.Data
{
    public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {

        }

        public DbSet<Adres> Adressen => Set<Adres>();
        public DbSet<Employee> Employees => Set<Employee>();
        public DbSet<ShopEmployee> ShopEmployees => Set<ShopEmployee>();
        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            builder.Entity<ShopEmployee>().ToTable("shop_employees");
            builder.Entity<Employee>().ToTable("employees");

            builder.Entity<ShopEmployee>(entity =>
            {
                entity.ToTable("shop_employees");

                entity.HasKey(e => e.Id);

                entity.Property(e => e.Id)
                      .HasColumnName("id")
                      .ValueGeneratedOnAdd();

                entity.Property(e => e.Shop_Id).HasColumnName("shop_id");
                entity.Property(e => e.AspNetusers_Id).HasColumnName("aspnetusers_id");
                entity.Property(e => e.Name).HasColumnName("name");
                entity.Property(e => e.Phone).HasColumnName("phone");

            });
            builder.Entity<Employee>(entity =>
            {
                entity.ToTable("employees");

                entity.HasKey(e => e.Id);

                entity.Property(e => e.Id)
                      .HasColumnName("id")
                      .ValueGeneratedOnAdd();

                entity.Property(e => e.AspNetusers_Id).HasColumnName("aspnetusers_id");
                entity.Property(e => e.Name).HasColumnName("name");
                entity.Property(e => e.Phone).HasColumnName("phone");

            });

        }
    }
}
    
