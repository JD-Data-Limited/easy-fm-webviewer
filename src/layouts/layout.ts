/*
 * Copyright (c) 2023. See LICENSE file for more information
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
    readonly records = new LayoutRecordManager<T>(this)
    readonly name: string;
    metadata: ApiLayoutMetadata;

    constructor(database: DatabaseBase, name: string) {
        this.database = database
        this.name = name
    }

    async runScript(script: Script): Promise<ScriptResult> {
        let req = this.database.request<ApiResults<ApiScriptResult>>({
            type: REQUEST_TYPES.RunScript,
            name: script.name,
            parameter: script.parameter
        })
        let res = await req.async()

        if (res.messages[0].code === "0") {
            let error = parseInt(res.response.scriptError)
            return {
                scriptError: error ? new FMError(error, 200, res) : undefined,
                scriptResult: res.response.scriptResult
            }
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