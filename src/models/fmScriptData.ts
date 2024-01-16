import {portalDataObject} from "../types";

export enum REQUEST_TYPES {
    RAW = -1,
    GetDBMetadata = 0,
    GetLayoutMetadata,
    RunScript,
    GetRecordRange,
    FindRecord,
    CreateRecord,
    ModifyRecord,
    DuplicateRecord,
    DeleteRecord,
    ContainerDataRequest,
    GetCurrentRecord,
}

export type RequestDataBase = {}
export type RequestData =
    RawRequest |
    GetDBMetadata |
    GetLayoutMetadata |
    RunScript |
    GetRecordRange |
    FindRecord |
    CreateRecord |
    ModifyRecord |
    DuplicateRecord |
    DeleteRecord |
    GetRecord |
    ContainerDataRequest

export type WebToFileMaker = {
    private_key: string,
    dataVersion: number,
    requests: RequestData[]
}

export type RawRequest = RequestDataBase & {
    type: REQUEST_TYPES.RAW,
    dateformats: "2",
    version: "v2",
    layouts: string,
    [key: string]: string | number
}

export type GetDBMetadata = RequestDataBase & {
    type: REQUEST_TYPES.GetDBMetadata
}

export type GetLayoutMetadata = RequestDataBase & {
    type: REQUEST_TYPES.GetLayoutMetadata,
    layout: string
}

export type RunScript = RequestDataBase & {
    type: REQUEST_TYPES.RunScript,
    layout: string,
    name: string,
    parameter?: string
}

export type GetRecordRange = RequestDataBase & {
    type: REQUEST_TYPES.GetRecordRange,
    layout: string,
    limit: number,
    offset: number
}

export type FindRecord = RequestDataBase & {
    type: REQUEST_TYPES.FindRecord,
    layout: string,
    limit: number,
    offset: number,
    query: {
        [key: string]: string
        omit?: "true" | "false"
    }
}

export type CreateRecord = RequestDataBase & {
    type: REQUEST_TYPES.CreateRecord,
    layout: string,
    fieldData: {
        [key: string]: string
    },
    portalData: portalDataObject
}

export type ModifyRecord = RequestDataBase & {
    type: REQUEST_TYPES.ModifyRecord,
    layout: string,
    recordId: number,
    fieldData: {
        [key: string]: string
    },
    portalData: portalDataObject
}

export type DuplicateRecord = RequestDataBase & {
    type: REQUEST_TYPES.DuplicateRecord,
    layout: string,
    recordId: number
}

export type DeleteRecord = RequestDataBase & {
    type: REQUEST_TYPES.DeleteRecord,
    layout: string,
    recordId: number
}

export type GetRecord = RequestDataBase & {
    type: REQUEST_TYPES.GetCurrentRecord
}

export type ContainerDataRequest = RequestDataBase & {
    type: REQUEST_TYPES.ContainerDataRequest,
    layout: string,
    recordId: number,
    fieldId: string
}