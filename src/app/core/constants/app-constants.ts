export const AppConstants = {
    GeneralUserRole: {
        Internal: "internal" as string,
        External: "external" as string
    },
    AdRoleName: {
        Admin: "Admin" as string,
        DO: "DO" as string,
        DA: "DA" as string,
        ExternalUser: "ExternalUser" as string
    },

    AdRoleList: {
        InternalRoles: ['DA', 'DO', 'Admin'] as string[],
        ExternalRoles: ['ExternalUser'] as string[]
    },
    AdGroupList: {
        InternalGroups: ['CC-FIFC3'] as string[],
        ExternalGroups: ['CC-External'] as string[]
    }
} as const;