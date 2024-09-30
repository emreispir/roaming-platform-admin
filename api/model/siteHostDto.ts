/**
 * CPMS API
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 * The version of the OpenAPI document: v1
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */
import { LeaseSharingInfo } from './leaseSharingInfo';


export interface SiteHostDto { 
    id?: string | null;
    readableId?: string | null;
    workspaceId?: string | null;
    name?: string | null;
    leaseSharingInfo?: LeaseSharingInfo;
    readonly chargePointsCount?: number;
    createdBy?: string | null;
    created?: string;
    isArchived?: boolean;
    archiveDate?: string | null;
    archivedBy?: string | null;
}
