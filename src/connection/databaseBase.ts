/*
 * Copyright (c) 2023. See LICENSE file for more information
 */
import {RequestData, WebToFileMaker} from "../models/fmScriptData";
import {RequestItem} from "./requestItem";

export interface DatabaseBase {
    timezoneOffset: number
    request<D = any>(item: RequestData): RequestItem<D>
}

