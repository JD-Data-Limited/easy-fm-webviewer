/*
 * Copyright (c) 2023. See LICENSE file for more information
 */

import {FMError} from "./FMError";
import * as TYPES from "./types"
import {Database, getDatabaseConnection} from "./connection/database";
import {Layout} from "./layouts/layout";
import {RecordBase} from "./records/recordBase";
import {LayoutRecord} from "./records/layoutRecord";
import {LayoutInterface, PortalInterface} from "./layouts/layoutInterface";
import {PortalRecord} from "./records/portalRecord";
import {Portal} from "./records/portal";
import {Container, Field} from "./records/field";
import {Find} from "./records/getOperations/find";
import {RecordGetOperation} from "./records/getOperations/recordGetOperation";
import {RecordGetRange} from "./records/getOperations/recordGetRange";
import {LayoutRecordManager} from "./layouts/layoutRecordManager";
import {RecordFieldsMap} from "./layouts/recordFieldsMap";

export default {getDatabaseConnection}

export {
    FMError,
    TYPES,
    Database,
    Layout,
    RecordBase,
    LayoutRecord,
    LayoutInterface,
    RecordFieldsMap,
    PortalInterface,
    PortalRecord,
    Portal,
    Field,
    Find,
    RecordGetOperation,
    RecordGetRange,
    LayoutRecordManager,
    Container,
    getDatabaseConnection
}