/*
 * Copyright (c) 2023-2024. See LICENSE file for more information
 */

import {type HostBase} from './HostBase.js'
import {type ApiResults} from '../models/apiResults.js'
import {RequestFormat} from "../requestFormat.js";

export interface DatabaseBase {
    token: string

    // layouts: DatabaseStructure["layouts"]

    sendApiRequest: <T = unknown>(data: RequestFormat) => Promise<ApiResults<T>>
}
