namespace DocuWave.Application.DTOs;

public record AiSettingsDto(string Mode, string Provider, AiThrottleDto Throttle, AiLoggingDto Logging, AiRedactionDto Redaction);

public record AiThrottleDto(int Rpm, int Tpm);

public record AiLoggingDto(bool Enabled, string Level);

public record AiRedactionDto(bool Pii);

public record TestAiSettingsResponse(bool Ok, int LatencyMs, string Message);
