/*
 * Copyright (c) 2023-2024. See LICENSE file for more information
 */

import {EventEmitter} from "events";
import {LayoutInterface} from "../layouts/layoutInterface";
import {Layout} from "../layouts/layout";
import {databaseOptionsBase, DatabaseStructure, loginOptionsFileMaker, Script} from "../types";
import {DatabaseBase} from "./databaseBase";
import {REQUEST_TYPES, RequestData, WebToFileMaker} from "../models/fmScriptData";
import {RequestItem} from "./requestItem";

type GetLayoutReturnType<T extends DatabaseStructure, R extends LayoutInterface | string> = R extends string ? T["layouts"][R] : R
const DATA_VERSION = 1

declare global {
    interface Window {
        FileMaker: {
            PerformScript(name: string, parameter?: string): void
        },
        EASY_FM_DATA_IN(data: string): void
    }
}

function uuidv4() {
    if (window.crypto.randomUUID) return window.crypto.randomUUID()
    return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c =>
        // SOURCE: https://stackoverflow.com/questions/105034/how-do-i-create-a-guid-uuid
        // @ts-ignore
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
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

    async getCurrentRecord() {
        let req = this.request<{recordId: number, layoutName: string}>({
            type: REQUEST_TYPES.GetCurrentRecord
        })
        let res = await req.async()
        let layout = this.getLayout(res.layoutName)
        let record = await layout.records.get(res.recordId)
        await record.get()
        return record
    }

    script(name, parameter = ""): Script {
        return ({name, parameter} as Script)
    }

    _tokenExpired() {
        this.emit("token_expired")
    }

    request<D = any>(item: RequestData) {
        let requestItem = new RequestItem<D>(item)
        let id = uuidv4()
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
            dataVersion: DATA_VERSION,
            requests
        }
        window.FileMaker.PerformScript("EASYFM_RESPONDER", JSON.stringify(data))
        console.log("DATA OUT", data, new Date())
    }

    processRequestsIn(data: [string, any][]) {
        console.log("DATA IN", data, new Date())
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