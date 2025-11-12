# DocuWave Backend

This solution provides the .NET 8 backend for the DocuWave frontend. It exposes the REST APIs, SignalR hubs, background jobs, and persistence model required by the existing React application.

## Projects

- `DocuWave.Api` – ASP.NET Core Web API hosting controllers, middleware, and hubs.
- `DocuWave.Application` – CQRS contracts, DTOs, and service interfaces.
- `DocuWave.Domain` – entity definitions for the multi-tenant document workflow domain.
- `DocuWave.Infrastructure` – EF Core persistence, services, and platform integrations.
- `DocuWave.Background` – Hangfire worker host for asynchronous OCR/AI and repository sync jobs.
- `DocuWave.IntegrationTests` – smoke tests covering middleware behavior.

## Getting started

1. Ensure SQL Server and Redis are running. The provided `docker-compose.yml` launches development containers.
2. From `docuwave-backend/`, run `docker compose up -d` to start dependencies.
3. Trust the ASP.NET Core development certificate (`dotnet dev-certs https --trust`).
4. Run the API: `dotnet run --project src/DocuWave.Api/DocuWave.Api.csproj`.
5. Start the background worker: `dotnet run --project src/DocuWave.Background/DocuWave.Background.csproj`.

Swagger UI is available at `https://localhost:7095/swagger` and health checks at `https://localhost:7095/health`.

## Configuration

Key settings are located in `src/DocuWave.Api/appsettings.Development.json`:

- `ConnectionStrings:Sql` – SQL Server connection string.
- `ConnectionStrings:Redis` – Redis connection string.
- `Blob` – configuration for local blob storage root path.
- `Jwt:Key` – symmetric key used for JWT validation in development.

The React frontend should point to the backend via `REACT_APP_API_URL=https://localhost:7095`.

## Testing

Execute the test suite with `dotnet test DocuWave.sln` once the .NET SDK is installed locally.
