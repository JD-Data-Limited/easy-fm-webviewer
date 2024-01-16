/*
 * Copyright (c) 2023-2024. See LICENSE file for more information
 */

import {LayoutRecordManager} from "./layoutRecordManager";
import {Script, ScriptResult} from "../types";
import {LayoutInterface} from "./layoutInterface";
import {FMError} from "../FMError";
import {LayoutBase} from "./layoutBase"
import {DatabaseBase} from "../connection/databaseBase";
import {ApiLayoutMetadata, ApiResults, ApiScriptResult} from "../models/apiResults";
import {REQUEST_TYPES} from "../models/fmScriptData";

export class Layout<T extends LayoutInterface> implements LayoutBase {
    readonly database: DatabaseBase;
    readonly name: string;
    readonly records = new LayoutRecordManager<T>(this)
    metadata: ApiLayoutMetadata;

    constructor(database: DatabaseBase, name: string) {
        this.database = database
        this.name = name
    }

    async runScript(script: Script): Promise<ScriptResult> {
        let req = this.database.request<ApiScriptResult>({
            type: REQUEST_TYPES.RunScript,
            layout: this.name,
            name: script.name,
            parameter: script.parameter
        })
        let res = await req.async()
        console.log(res)

        let error = parseInt(res.scriptError)
        return {
            scriptError: error ? new FMError(error) : undefined,
            scriptResult: res.scriptResult
        }
    }

    public async getLayoutMeta(): Promise<ApiLayoutMetadata> {
        if (this.metadata) {
            return this.metadata
        }

        let req = this.database.request<ApiResults<ApiLayoutMetadata>>({
            type: REQUEST_TYPES.GetLayoutMetadata,
            layout: this.name
        })

        let res = await req.async()
        this.metadata = res.response
        return this.metadata
    }
}