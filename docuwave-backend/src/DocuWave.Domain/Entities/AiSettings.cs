namespace DocuWave.Domain.Entities;

public class AiSettings : BaseEntity
{
    public string Mode { get; set; } = "local";
    public string Provider { get; set; } = "openAI";
    public AiThrottleSettings Throttle { get; set; } = new();
    public AiLoggingSettings Logging { get; set; } = new();
    public AiRedactionSettings Redaction { get; set; } = new();
}

public class AiThrottleSettings
{
    public int Rpm { get; set; } = 60;
    public int Tpm { get; set; } = 6000;
}

public class AiLoggingSettings
{
    public bool Enabled { get; set; } = true;
    public string Level { get; set; } = "info";
}

public class AiRedactionSettings
{
    public bool Pii { get; set; } = true;
}
