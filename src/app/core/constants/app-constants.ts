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
    },

    FormValidation: {
        COMMENT: { minLength: 10, maxLength: 1500 },
        NAME: { minLength: 2, maxLength: 100 },
        EMAIL: { minLength: 5, maxLength: 254 },
        PHONE: { minLength: 10, maxLength: 20 },
        SHORT_TEXT: { minLength: 1, maxLength: 255 },
        LONG_TEXT: { minLength: 1, maxLength: 3000 },
    },
    FileUpload: {
        maxSizeBytes: 5 * 1024 * 1024,
        maxSizeMB: 5,
        allowedTypes: [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        ] as string[]
    }
} as const;