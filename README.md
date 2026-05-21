# 🎧 Audiform

## 📌 Structuur
Nieuw bestelportaal voor Audiform met een scheiding tussen frontend en backend.

- Frontend: React (Vite) met Material UI
- Backend: .NET (ASP.NET Core)
- Architectuur: Clean Architecture (Application, Domain, Infrastructure)

---

## ⚙️ Configuratie

De file `appsettings.Development.json` staat **niet in Git**.

Pas de database gegevens aan naar jouw omgeving. Maak zelf een `appsettings.Development.json` aan op bassis van `appsettings.Development.TEMPLATE.json`

---

## 📁 Structuur

- `Audiform.client` → React frontend  
- `Audiform.Server` → .NET backend  
- `Application` → use cases  
- `Domain` → entiteiten  
- `Infrastructure` → database  

---
