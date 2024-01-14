/*
 * Copyright (c) 2023. See LICENSE file for more information
 */

import {LayoutBase} from "../layouts/layoutBase"

export interface LayoutRecordBase {
    layout: LayoutBase
    commit(extraBody: object): Promise<this>
}