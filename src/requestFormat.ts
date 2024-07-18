export type RequestFormatBase = {
    version: "v2"
    layouts: string,
    tables: string
}

export type RequestFormatRead = RequestFormatBase & {
    action: "read",
    recordId: number
}

export type RequestFormatReadQuery = RequestFormatBase & {
    action: "read",
    query: {
        [key: string]: string
    }[],
    sort?: {}[],
    offset: number,
    limit: number,
    portal: string[],
    [key: `offset.${string}`]: number,
    [key: `limit.${string}`]: number
}

export type RequestFormatMetaData = RequestFormatBase & {
    action: "metaData"
}

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
    | RequestFormatReadQuery
    | RequestFormatMetaData
    | RequestFormatCreate
    | RequestFormatUpdate
    | RequestFormatDelete
    | RequestFormatDuplicate
