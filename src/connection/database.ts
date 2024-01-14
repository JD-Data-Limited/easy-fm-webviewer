/*
 * Copyright (c) 2023. See LICENSE file for more information
 */

import {EventEmitter} from "events";
import fetch, {HeadersInit, Request} from "node-fetch";
import {generateAuthorizationHeaders} from "./generateAuthorizationHeaders.js";
import {FMError} from "../FMError.js";
import {LayoutInterface} from "../layouts/layoutInterface.js";
import {Layout} from "../layouts/layout.js";
import {
    databaseOptionsBase,
    databaseOptionsWithExternalSources, DatabaseStructure,
    loginOptionsFileMaker,
    loginOptionsToken,
    Script
} from "../types.js";
import {HostBase} from "./HostBase.js"
import {DatabaseBase} from "./databaseBase";
import {ApiLayout, ApiResults} from "../models/apiResults";
import {RequestData, WebToFileMaker} from "../models/fmScriptData";
import {RequestItem} from "./requestItem";
import * as crypto from "crypto";

type GetLayoutReturnType<T extends DatabaseStructure, R extends LayoutInterface | string> = R extends string ? T["layouts"][R] : R

declare global {
    interface Window {
        FileMaker: {
            PerformScript(name: string, parameter?: string): void
        },
        EasyFMDataIn(data: string): void
    }
}

export class Database<T extends DatabaseStructure> extends EventEmitter implements DatabaseBase {
    protected pendingRequests = new Map<string, RequestItem<any>>()
    protected readonly privateKey: string = ""
    protected requestTimeout: NodeJS.Timeout

    constructor() {
        super()
    }

    private generateExternalSourceLogin(data: databaseOptionsBase) {
        if (data.credentials.method === "filemaker") {
            let _data = <loginOptionsFileMaker>data.credentials
            return {
                database: data.database,
                username: _data.username,
                password: _data.password
            }
        }
        else {
            throw "Not yet supported login method"
        }
    }

    getLayout<R extends string>(name: R): Layout<T["layouts"][R]>
    getLayout<R extends LayoutInterface>(name: string): Layout<R>
    getLayout(name: string): Layout<LayoutInterface> {
        return new Layout<LayoutInterface>(this, name)
    }

    script(name, parameter = ""): Script {
        return ({name, parameter} as Script)
    }

    _tokenExpired() {
        this.emit("token_expired")
    }

    request(item: Omit<RequestData, "id">) {
        let requestItem = new RequestItem(item)
        let id = crypto.randomUUID()
        this.pendingRequests.set(id, requestItem)
        if (this.requestTimeout) clearTimeout(this.requestTimeout)

        this.requestTimeout = setTimeout(() => {
            this.processRequestsOut();
        }, 1000);

        return requestItem
    }

    processRequestsOut() {
        this.pendingRequests
        let requests: RequestData[] = []
        for (let item of this.pendingRequests) requests.push({id: item[0], ...item[1].data})

        const data: WebToFileMaker = {
            private_key: this.privateKey,
            requests
        }
    }

    processRequestsIn(data: [string, any][]) {
        for (let item of data) {
            let req = this.pendingRequests.get(item[0])
            if (!req) continue

            this.pendingRequests.delete(item[0])
            req._resolve(item[1])
        }
    }
}

let database = new Database()
window.EasyFMDataIn = (data: string)=>  {
    database.processRequestsIn(JSON.parse(data))
}

export function getDatabaseConnection() {
    return database
}