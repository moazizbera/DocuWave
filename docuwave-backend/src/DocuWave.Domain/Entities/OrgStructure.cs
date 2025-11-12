namespace DocuWave.Domain.Entities;

public class OrgUnit : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public Guid? ParentId { get; set; }
}

public class OrgRole : BaseEntity
{
    public string Name { get; set; } = string.Empty;
}

public class OrgDelegation : BaseEntity
{
    public Guid FromUserId { get; set; }
    public Guid ToUserId { get; set; }
    public DateTime From { get; set; }
    public DateTime To { get; set; }
}

public class WorkingCalendar : BaseEntity
{
    public string Timezone { get; set; } = "UTC";
    public string WorkingDays { get; set; } = "Mon-Fri";
    public string WorkingHours { get; set; } = "09:00-17:00";
}
