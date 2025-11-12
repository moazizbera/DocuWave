namespace DocuWave.Application.DTOs;

public record OrgStructureDto(
    IReadOnlyCollection<OrgUnitDto> Units,
    IReadOnlyCollection<OrgRoleDto> Roles,
    IReadOnlyCollection<OrgDelegationDto> Delegations,
    IReadOnlyCollection<WorkingCalendarDto> Calendars);

public record OrgUnitDto(Guid Id, string Name, Guid? ParentId);

public record OrgRoleDto(Guid Id, string Name);

public record OrgDelegationDto(Guid Id, Guid FromUserId, Guid ToUserId, DateTime From, DateTime To);

public record WorkingCalendarDto(Guid Id, string Timezone, string WorkingDays, string WorkingHours);

public record OrgImportResponse(Guid JobId);
