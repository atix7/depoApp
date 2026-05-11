# Depo — Warehouse Management REST API

A Spring Boot backend for managing warehouse inventory. It tracks products, warehouses, stock levels, and stock movements, and exposes a secured REST API consumed by a frontend client.

## What it does

- **Products & Categories** — create and manage products grouped into categories
- **Warehouses** — maintain multiple warehouse locations, each with its own stock
- **Stock Items** — track how much of each product is stored in each warehouse
- **Stock Movements** — record every IN/OUT movement with a timestamp and reason
- **Low-stock alerts** — query products that have fallen below a defined threshold
- **Authentication** — JWT-based login; all endpoints (except `/api/auth/**`) require a valid token

## Tech stack

| Layer | Technology |
|---|---|
| Language | Java 21 |
| Framework | Spring Boot 3 |
| Security | Spring Security + JWT |
| Persistence | Spring Data JPA + MySQL (TiDB Cloud) |
| Build | Maven |
| Containerization | Docker |

## Branches

### `main` — Render deployment
The primary branch, configured to deploy on **[Render](https://render.com)**.

- Port defaults to `10000` (`${PORT:10000}`)
- Requires SSL for the MySQL connection (`trustServerCertificate=true` added for Render's network)
- Uses a `Dockerfile` for containerized deployment (multi-stage Maven build → JRE image)
- Database credentials and JWT secret are injected via environment variables (`MYSQLHOST`, `MYSQLPORT`, `MYSQLDATABASE`, `MYSQLUSER`, `MYSQLPASSWORD`, `JWT_SECRET`)

### `railway` — Railway deployment
An alternative deployment branch targeting **[Railway](https://railway.app)**.

- Port defaults to `8080` (`${PORT:8080}`)
- Slightly different SSL/TLS options suited to Railway's infrastructure
- Same environment-variable convention for secrets, but tuned for Railway's injected config

## Running locally

1. Copy `application-local.properties.example` to `application-local.properties` and fill in your DB credentials.
2. Run:
   ```bash
   ./mvnw spring-boot:run
   ```
3. The API will be available at `http://localhost:8080`.

## API overview

| Method | Path | Description |
|---|---|---|
| POST | `/api/auth/login` | Obtain a JWT token |
| GET/POST | `/api/products` | List or create products |
| GET/POST | `/api/warehouses` | List or create warehouses |
| GET/POST | `/api/stock` | List stock items or add stock |
| POST | `/api/stock/quick-in` | Quick stock intake |
| GET/POST | `/api/movements` | List or record stock movements |
| GET | `/api/products/low-stock` | Products below minimum quantity |
| GET/POST | `/api/categories` | List or create categories |