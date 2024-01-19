/*
 * Copyright (c) 2023-2024. See LICENSE file for more information
 */

import {Script, ScriptResult} from "../types.js";
import {DatabaseBase} from "../connection/databaseBase.js";
import {ApiLayoutMetadata} from "../models/apiResults.js";

export interface LayoutBase {
    readonly name: string
    metadata: any
    endpoint: string
    runScript(script: Script): Promise<ScriptResult>
    getLayoutMeta(): Promise<ApiLayoutMetadata>
    database: DatabaseBase
}