enum REQUEST_TYPES {
    GetDBMetadata,
    GetLayoutMetadata,
    RunScript,
    GetRecordRange,
    FindRecord,
    CreateRecord,
    ModifyRecord,
    DuplicateRecord,
    DeleteRecord,
    GetRecord,
    UploadContainer
}

export type RequestDataBase = {id: string}
export type RequestData =
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
    UploadContainer

export type WebToFileMaker = {
    private_key: string,
    requests: RequestData[]
}

export type GetDBMetadata = RequestDataBase & {
    type: REQUEST_TYPES.GetDBMetadata
}

export type GetLayoutMetadata = RequestDataBase & {
    type: REQUEST_TYPES.RunScript
}

export type RunScript = RequestDataBase & {
    type: REQUEST_TYPES.GetLayoutMetadata
}

export type GetRecordRange = RequestDataBase & {
    type: REQUEST_TYPES.GetRecordRange
}

export type FindRecord = RequestDataBase & {
    type: REQUEST_TYPES.FindRecord
}

export type CreateRecord = RequestDataBase & {
    type: REQUEST_TYPES.CreateRecord
}

export type ModifyRecord = RequestDataBase & {
    type: REQUEST_TYPES.ModifyRecord
}

export type DuplicateRecord = RequestDataBase & {
    type: REQUEST_TYPES.DuplicateRecord
}

export type DeleteRecord = RequestDataBase & {
    type: REQUEST_TYPES.DeleteRecord
}

export type GetRecord = RequestDataBase & {
    type: REQUEST_TYPES.GetRecord
}

export type UploadContainer = RequestDataBase & {
    type: REQUEST_TYPES.UploadContainer
}