/*
 * Copyright (c) 2023-2024. See LICENSE file for more information
 */

import {generateAuthorizationHeaders} from './generateAuthorizationHeaders.js'
import {FMError} from '../FMError.js'
import {type LayoutInterface} from '../layouts/layoutInterface.js'
import {Layout} from '../layouts/layout.js'
import {type databaseOptionsBase, type Script} from '../types.js'
import {type DatabaseBase} from './databaseBase.js'
import {type ApiLayout, type ApiResults} from '../models/apiResults.js'
import {type DatabaseStructure} from '../databaseStructure.js'
import {RequestFormat} from "../requestFormat.js";

declare global {
    interface Window {
        FileMaker: {
            PerformScript(script: string, params: string): void
            PerformScriptWithOption(script: string, params: string, option: string): void
        },
        EASYFM_onReceiveFileMakerFeedback(req_id: string, data: string): void
    }
}

type RequestHandler<T = unknown> = (data: ApiResults<T>) => void

/**
 * Represents a database connection.
 * @template T - The structure of the database.
 */
export class Database<T extends DatabaseStructure> implements DatabaseBase {
    private _token: string = ''
    readonly #layoutCache = new Map<string, Layout<any>>()
    #pendingRequests = new Map<string, RequestHandler<never>>()
    #key = "My Key"

    constructor () {
        window.EASYFM_onReceiveFileMakerFeedback = (req_id, data) => {
            let parsedData = JSON.parse(data)
            let method = this.#pendingRequests.get(req_id)
            if (method) void method(parsedData)
            this.#pendingRequests.delete(req_id)
        }
    }

    setKey(key: string) {
        this.#key = JSON.parse(JSON.stringify(key)) // Safely re-serialise the key to help prevent any hijacked methods
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    private generateExternalSourceLogin (data: databaseOptionsBase) {
        if (data.credentials.method === 'filemaker') {
            const _data = data.credentials
            return {
                database: data.database,
                username: _data.username,
                password: _data.password
            }
        }
        else {
            throw new Error('Not yet supported login method')
        }
    }

    /**
     * Logs out the user by deleting the current session token.
     * Throws an error if the user is not logged in.
     *
     * @returns {Promise<void>} A promise that resolves with no value once the logout is successful.
     * @throws {Error} Throws an error if the user is not logged in.
     */

    get token () {
        return this._token
    }

    sendApiRequest<T = any>(data: RequestFormat): Promise<ApiResults<T>> {
        return new Promise<ApiResults<T>>((resolve, reject) => {
            let req_id = crypto.randomUUID()
            const handler: RequestHandler<T> = (data) => resolve(data)
            this.#pendingRequests.set(req_id, handler)

            // Send request to FileMaker
            window.FileMaker.PerformScript("EasyFMWebViewerHandler", JSON.stringify({
                key: this.#key,
                req_id, data
            }))
        })
    }

    /**
     * Retrieves a list of layouts in the current FileMaker database.
     *
     * @returns {Promise<Layout[]>} A promise that resolves to an array of Layout objects.
     * @throws {FMError} If there was an error retrieving the layouts.
     */
    async listLayouts (page: number = 0) {
        const req = await this.sendApiRequest<{ layouts: ApiLayout[] }>({
            version: "v2",
            action: "metaData",
            layouts: "",
            tables: ""
        })
        console.log(req)
        if (!req.response) throw new FMError(req.messages[0].code, req.httpStatus, req.messages[0].message)

        const cycleLayoutNames = (layouts: ApiLayout[]) => {
            let names: string[] = []
            for (const layout of layouts) {
                if (layout.folderLayoutNames) names = names.concat(cycleLayoutNames(layout.folderLayoutNames))
                else names.push(layout.name)
            }
            return names
        }
        return cycleLayoutNames(req.response.layouts).map(layout => new Layout(this, layout))
    }

    layout<R extends keyof T['layouts']>(name: R): Layout<T['layouts'][R]>
    layout<R extends LayoutInterface>(name: string): Layout<R>
    layout (name: string): Layout<any> {
        let layout = this.#layoutCache.get(name)
        if (layout) return layout
        layout = new Layout<LayoutInterface>(this, name)
        this.#layoutCache.set(name, layout)
        return layout
    }

    clearLayoutCache () {
        this.#layoutCache.clear()
    }

    script (name: string, parameter = ''): Script {
        return ({name, parameter} satisfies Script)
    }
}


// @ts-ignore
window.EASYFM_database = new Database()
