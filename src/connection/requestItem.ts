import {RequestData} from "../models/fmScriptData";

export class RequestItem<T = unknown> {
    private _callback = (data: T) => {}
    readonly data: Omit<RequestData, "id">;

    constructor(data: Omit<RequestData, "id">) {
        this.data = data
    }

    async(): Promise<T> {
        return new Promise((resolve) => {
            this._callback = resolve
        });
    }

    callback(func: typeof this._callback) {
        this._callback = func
    }

    _resolve(data: T) {
        this._callback(data)
    }
}