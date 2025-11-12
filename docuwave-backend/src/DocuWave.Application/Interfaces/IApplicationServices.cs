using System.IO;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using DocuWave.Application.Common;
using DocuWave.Application.DTOs;
using DocuWave.Application.Requests;
using Microsoft.AspNetCore.Http;

namespace DocuWave.Application.Interfaces;

public interface ITenantService
{
    Task<PagedResult<TenantListItemDto>> SearchAsync(string? search, int page, int pageSize, CancellationToken cancellationToken);
    Task<TenantDetailDto> GetAsync(Guid id, CancellationToken cancellationToken);
    Task<TenantDetailDto> CreateAsync(CreateTenantRequest request, CancellationToken cancellationToken);
    Task UpdateAsync(Guid id, UpdateTenantRequest request, CancellationToken cancellationToken);
}

public interface ISchemeService
{
    Task<PagedResult<SchemeListItemDto>> GetAsync(int page, int pageSize, CancellationToken cancellationToken);
    Task<SchemeListItemDto> CreateAsync(CreateSchemeRequest request, CancellationToken cancellationToken);
}

public interface IDocumentService
{
    Task<PagedResult<DocumentListItemDto>> QueryAsync(DocumentQuery query, CancellationToken cancellationToken);
    Task<UploadResponse> UploadAsync(DocumentUploadRequest request, CancellationToken cancellationToken);
    Task<DocumentDetailDto> GetAsync(Guid id, CancellationToken cancellationToken);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken);
    Task<BulkJobResponse> BulkAsync(DocumentBulkRequest request, CancellationToken cancellationToken);
    Task<(Stream Stream, string MimeType, string FileName)> GetContentAsync(Guid id, string? rendition, CancellationToken cancellationToken);
}

public interface IAnnotationService
{
    Task<PagedResult<AnnotationDto>> GetAsync(Guid documentId, int page, int pageSize, CancellationToken cancellationToken);
    Task<AnnotationDto> CreateAsync(Guid documentId, AnnotationRequest request, CancellationToken cancellationToken);
    Task UpdateAsync(Guid documentId, Guid annotationId, AnnotationRequest request, CancellationToken cancellationToken);
    Task DeleteAsync(Guid documentId, Guid annotationId, CancellationToken cancellationToken);
}

public interface IWorkflowService
{
    Task<PagedResult<WorkflowTemplateListItemDto>> GetTemplatesAsync(string? search, string? tags, int page, int pageSize, CancellationToken cancellationToken);
    Task<WorkflowTemplateListItemDto> ImportTemplateAsync(ImportWorkflowTemplateRequest request, CancellationToken cancellationToken);
    Task<PagedResult<WorkflowDefinitionListItemDto>> GetDefinitionsAsync(int page, int pageSize, CancellationToken cancellationToken);
    Task<WorkflowDefinitionListItemDto> CreateDefinitionAsync(CreateWorkflowDefinitionRequest request, CancellationToken cancellationToken);
    Task<WorkflowPublishResponse> PublishDefinitionAsync(Guid id, CancellationToken cancellationToken);
    Task<PagedResult<WorkflowInstanceListItemDto>> GetInstancesAsync(string? status, string? query, int page, int pageSize, CancellationToken cancellationToken);
    Task<WorkflowInstanceListItemDto> StartInstanceAsync(StartWorkflowInstanceRequest request, CancellationToken cancellationToken);
    Task HandleInstanceActionAsync(Guid id, WorkflowActionRequest request, CancellationToken cancellationToken);
}

public interface IFormService
{
    Task<PagedResult<FormListItemDto>> GetAsync(int page, int pageSize, CancellationToken cancellationToken);
    Task<FormListItemDto> CreateAsync(CreateFormRequest request, CancellationToken cancellationToken);
    Task<PublishFormResponse> PublishAsync(Guid id, CancellationToken cancellationToken);
}

public interface IAiSettingsService
{
    Task<AiSettingsDto> GetAsync(CancellationToken cancellationToken);
    Task UpdateAsync(AiSettingsDto dto, CancellationToken cancellationToken);
    Task<TestAiSettingsResponse> TestAsync(CancellationToken cancellationToken);
}

public interface IRepositoryService
{
    Task<PagedResult<RepositoryListItemDto>> GetAsync(int page, int pageSize, CancellationToken cancellationToken);
    Task<RepositoryListItemDto> CreateAsync(CreateRepositoryRequest request, CancellationToken cancellationToken);
    Task<RepositoryTestResponse> TestAsync(Guid id, CancellationToken cancellationToken);
    Task<PagedResult<RepositoryJobListItemDto>> GetJobsAsync(string? status, int page, int pageSize, CancellationToken cancellationToken);
}

public interface IOrgService
{
    Task<OrgStructureDto> GetAsync(CancellationToken cancellationToken);
    Task<OrgImportResponse> ImportAsync(IFormFile file, CancellationToken cancellationToken);
}

public interface IAnalyticsService
{
    Task<DocumentAnalyticsDto> GetDocumentAnalyticsAsync(DateTime? from, DateTime? to, Guid? schemeId, CancellationToken cancellationToken);
    Task<WorkflowAnalyticsDto> GetWorkflowAnalyticsAsync(DateTime? from, DateTime? to, CancellationToken cancellationToken);
    Task<UserAnalyticsDto> GetUserAnalyticsAsync(DateTime? from, DateTime? to, CancellationToken cancellationToken);
    Task<AnalyticsExportResponse> ExportAsync(AnalyticsExportRequest request, CancellationToken cancellationToken);
}

public interface INotificationService
{
    Task<PagedResult<NotificationListItemDto>> GetAsync(DateTime? since, int page, int pageSize, CancellationToken cancellationToken);
    Task MarkReadAsync(Guid id, CancellationToken cancellationToken);
}

public interface ITenantProvider
{
    string GetTenantId();
}
