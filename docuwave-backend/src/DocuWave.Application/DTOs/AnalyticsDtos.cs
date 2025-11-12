namespace DocuWave.Application.DTOs;

public record AnalyticsSeriesPoint(DateTime X, double Y);

public record DocumentAnalyticsDto(IReadOnlyCollection<AnalyticsSeriesPoint> Series, DocumentAnalyticsTotals Totals);

public record DocumentAnalyticsTotals(int Processed, int Pending, int Rejected);

public record WorkflowAnalyticsDto(IReadOnlyCollection<AnalyticsSeriesPoint> Series);

public record UserAnalyticsDto(IReadOnlyCollection<AnalyticsSeriesPoint> Series);

public record AnalyticsExportRequest(string Scope, Dictionary<string, object> Filters);

public record AnalyticsExportResponse(Guid JobId);
