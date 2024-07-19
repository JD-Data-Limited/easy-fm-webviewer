export type RequestFormatBase = {
    version: "v2"
    layouts: string,
}

export type RequestFormatReadSingle = RequestFormatBase & {
    action: "read",
    recordId: number
}

export type RequestFormatReadRange = RequestFormatBase & {
    action: "read",
    sort?: {}[],
    offset: number,
    limit: number,
    portal: string[],
    [key: `offset.${string}`]: number,
    [key: `limit.${string}`]: number
}

export type RequestFormatReadQuery = RequestFormatReadRange & {
    query: {
        [key: string]: string
    }[]
}

export type RequestFormatRead = RequestFormatReadSingle
    | RequestFormatReadRange
    | RequestFormatReadQuery

export type RequestFormatMetaData = Omit<RequestFormatBase, "layouts"> & {
    action: "metaData",
} & ({tables: string} | {layouts: string})

export type RequestFormatCreate = RequestFormatBase & {
    action: "create",
    fieldData: {
        [key: string]: string
    },
    portalData: {
        [key: string]: {
            [key: string]: string
        }[]
    },
    "options.entrymode": "user" | "script"
}

export type RequestFormatUpdate = RequestFormatCreate & {
    action: "update",
    recordId?: number,
}

export type RequestFormatDelete = RequestFormatBase & {
    action: "delete",
    recordId?: number,
}

export type RequestFormatDuplicate = RequestFormatBase & {
    action: "duplicate",
    recordId?: number,
}

export type RequestFormat = RequestFormatRead
    | RequestFormatMetaData
    | RequestFormatCreate
    | RequestFormatUpdate
    | RequestFormatDelete
    | RequestFormatDuplicate
