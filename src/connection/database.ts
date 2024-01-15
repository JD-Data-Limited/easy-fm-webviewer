/*
 * Copyright (c) 2023-2024. See LICENSE file for more information
 */

import {EventEmitter} from "events";
import {LayoutInterface} from "../layouts/layoutInterface";
import {Layout} from "../layouts/layout";
import {
    databaseOptionsBase,
    DatabaseStructure,
    loginOptionsFileMaker,
    Script
} from "../types";
import {DatabaseBase} from "./databaseBase";
import {RequestData, WebToFileMaker} from "../models/fmScriptData";
import {RequestItem} from "./requestItem";
import * as crypto from "crypto";

type GetLayoutReturnType<T extends DatabaseStructure, R extends LayoutInterface | string> = R extends string ? T["layouts"][R] : R

declare global {
    interface Window {
        FileMaker: {
            PerformScript(name: string, parameter?: string): void
        },
        EASY_FM_DATA_IN(data: string): void
    }
}

export class Database<T extends DatabaseStructure> extends EventEmitter implements DatabaseBase {
    protected pendingRequests = new Map<string, RequestItem<any>>()
    protected privateKey: string = ""
    protected requestTimeout: NodeJS.Timeout
    readonly timezoneOffset = new Date().getTimezoneOffset()

    constructor() {
        super()
    }

    apiRequest(...args): any {
        return
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

    getLayout<R extends keyof T["layouts"]>(name: R): Layout<T["layouts"][R]>
    getLayout<R extends LayoutInterface>(name: string): Layout<R>
    getLayout(name: string): Layout<any> {
        return new Layout<LayoutInterface>(this, name)
    }

    script(name, parameter = ""): Script {
        return ({name, parameter} as Script)
    }

    _tokenExpired() {
        this.emit("token_expired")
    }

    request<D = any>(item: RequestData) {
        let requestItem = new RequestItem<D>(item)
        let id = window.crypto.randomUUID()
        this.pendingRequests.set(id, requestItem)
        if (this.requestTimeout) clearTimeout(this.requestTimeout)

        this.requestTimeout = setTimeout(() => {
            this.processRequestsOut();
        }, 100);

        return requestItem
    }

    processRequestsOut() {
        this.pendingRequests
        let requests: any[] = []
        for (let item of this.pendingRequests) {
            if (item[1].sent) continue
            item[1].sent = true
            requests.push({id: item[0], ...item[1].data})
        }

        const data: WebToFileMaker = {
            private_key: this.privateKey,
            requests
        }
        window.FileMaker.PerformScript("EASYFM_RESPONDER", JSON.stringify(data))
    }

    processRequestsIn(data: [string, any][]) {
        for (let item of data) {
            let req = this.pendingRequests.get(item[0])
            if (!req) continue

            this.pendingRequests.delete(item[0])
            req._resolve(item[1])
        }
    }

    setKey(key: string) {
        this.privateKey = key
    }
}

let database = new Database()
window.EASY_FM_DATA_IN = (data: string)=>  {
    try {
        database.processRequestsIn(JSON.parse(data))
    } catch (e) {
        console.error(e)
    }
}

export function getDatabaseConnection(privateKey: string) {
    database.setKey(privateKey)
    return database
}