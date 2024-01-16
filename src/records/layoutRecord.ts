/*
 * Copyright (c) 2023-2024. See LICENSE file for more information
 */

import {extraBodyOptions, recordObject} from "../types";
import {RecordBase} from "./recordBase";
import {PortalRecord} from "./portalRecord";
import {Portal} from "./portal";
import {LayoutInterface} from "../layouts/layoutInterface";
import {FMError} from "../FMError";
import {LayoutRecordBase} from "./layoutRecordBase";
import {ApiRecordResponseObj, ApiResults} from "../models/apiResults";
import {REQUEST_TYPES} from "../models/fmScriptData";
import {LayoutBase} from "../layouts/layoutBase";

export class LayoutRecord<LAYOUT extends LayoutInterface, PORTALS_TO_INCLUDE = string> extends RecordBase<LAYOUT["fields"]> implements LayoutRecordBase {
    // @ts-ignore
    portals: Pick<LAYOUT["portals"], PORTALS_TO_INCLUDE> = {}
    private readonly portalsToInclude: PORTALS_TO_INCLUDE[]

    constructor(
        layout: LayoutBase,
        recordId: number | string,
        modId = recordId,
        fieldData: Record<string, string | number> = {},
        portalData = null, portalsToInclude: PORTALS_TO_INCLUDE[] = []) {
        super(layout, recordId, modId);
        this.processFieldData(fieldData)
        this.portalsToInclude = portalsToInclude
        if (portalData) {
            this.processPortalData(portalData)
        }
    }

    get portalsArray(): Portal<any>[] {
        return Object.values(this.portals)
    }

    async commit(extraBody: extraBodyOptions = {}): Promise<this> {
        let data = this.toObject()
        delete data.recordId
        delete data.modId

        if (extraBody.scripts?.after) {
            data["script"] = extraBody.scripts.after.name
            if (extraBody.scripts.after.parameter) data["script.param"] = extraBody.scripts.after.parameter
        }
        if (extraBody.scripts?.prerequest) {
            data["script.prerequest"] = extraBody.scripts.after.name
            if (extraBody.scripts.prerequest.parameter) data["script.prerequest.param"] = extraBody.scripts.prerequest.parameter
        }
        if (extraBody.scripts?.presort) {
            data["script.presort"] = extraBody.scripts.presort.name
            if (extraBody.scripts.presort.parameter) data["script.presort.param"] = extraBody.scripts.presort.parameter
        }

        if (this.recordId === -1) {
            // This is a new LayoutRecord
            let req = this.layout.database.request<{ error?: number, recordId: string, modId: string }>({
                type: REQUEST_TYPES.CreateRecord,
                layout: this.layout.name,
                fieldData: data.fieldData,
                portalData: data.portalData
            })

            let res = await req.async()

            if (res.error) {
                throw new FMError(res.error)
            }
            else {
                this.recordId = parseInt(res.recordId)
                this.modId = parseInt(res.modId)
                return this
            }
        }

        // for (let item of Object.keys(data)) extraBody[item] = data[item]
        let req = this.layout.database.request<{error?: number, recordId: string, modId: string}>({
            type: REQUEST_TYPES.ModifyRecord,
            recordId: this.recordId,
            layout: this.layout.name,
            fieldData: data.fieldData,
            portalData: data.portalData
        })
        let res = await req.async()

        if (res.error) {
            throw new FMError(res.error)
        }
        else {
            this.recordId = parseInt(res.recordId)
            this.modId = parseInt(res.modId)
            return this
        }
    }

    protected processPortalData(portalData): void {
        for (let portalName of Object.keys(portalData)) {
            let _portal = new Portal(this, portalName)
            _portal.records = portalData[portalName].map(item => {
                let fieldData = item;
                delete fieldData.recordId;
                delete fieldData.modId;
                return new PortalRecord(this, _portal, item.recordId, item.modId, fieldData);
            })

            // @ts-ignore
            this.portals[portalName] = _portal;
        }
    }

    async get(): Promise<this> {
        // let trace = new Error()
        if (this.recordId === -1) {
            throw "Cannot get this RecordBase until a commit() is done."
        }
        if (!this.layout.metadata) await this.layout.getLayoutMeta()
        let req = this.layout.database.request<ApiResults<ApiRecordResponseObj>>({
            type: REQUEST_TYPES.RAW,
            dateformats: "2",
            version: "v2",
            layouts: this.layout.name,
            recordId: this.recordId
        })
        let res = await req.async()

        if (res.messages[0].code === "0") {
            // console.log(res, res.response.data)
            this.modId = +res.response.data[0].modId
            this.processFieldData(res.response.data[0].fieldData)
            this.portalData = []
            if (res.response.data[0].portalData) this.processPortalData(res.response.data[0].portalData)
            return this
        } else {
            console.log(res)
            throw new FMError(res.messages[0].code)
        }
    }

    getPortal(portal) {
        return this.portalsArray.find(p => p.name === portal)
    }

    async duplicate(): Promise<LayoutRecord<LAYOUT>> {
        let trace = new Error()
        let req = this.layout.database.request<{error?: number, recordId: string, modId: string}>({
            type: REQUEST_TYPES.DuplicateRecord,
            layout: this.layout.name,
            recordId: this.recordId
        })
        let res = await req.async()

        if (res.error) {
            throw new FMError(res.error, trace)
        }
        else {
            let data = this.toObject((a) => true, (a) => true, (a) => false, (a) => false)
            let _res = new LayoutRecord<LAYOUT>(this.layout, parseInt(res.recordId), parseInt(res.modId), data.fieldData, data.portalData)

            this.emit("duplicated")
            return _res
        }
    }

    async delete(): Promise<void> {
        let req = this.layout.database.request<{error?: number}>({
            type: REQUEST_TYPES.DeleteRecord,
            layout: this.layout.name,
            recordId: this.recordId
        })
        let res = await req.async()
        console.log(res)
        if (res.error) {
            throw new FMError(res.error)
        }
        return
    }

    toObject(filter: (a) => any = (a) => a.edited, portalFilter: (a) => any = (a) => a.records.find(record => record.edited), portalRowFilter: (a) => any = (a) => a.edited, portalFieldFilter: (a) => any = (a) => a.edited): recordObject {
        let obj = super.toObject(filter, portalFilter, portalRowFilter, portalFieldFilter);

        // Check if there's been any edited portal information
        let portals = this.portalsArray.filter(a => portalFilter(a))
        if (portals) {
            obj["portalData"] = {}
            for (let portal of portals) {
                // @ts-ignore
                obj["portalData"][portal.name] = portal.records.filter(a => portalRowFilter(a)).map(record => {
                    return record.toObject(portalFieldFilter)
                })
            }
        }

        return obj
    }
}