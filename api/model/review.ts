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
import { DomainEvent } from './domainEvent';
import { ReviewStatus } from './reviewStatus';
import { ChargePoint } from './chargePoint';
import { ChargeSession } from './chargeSession';


export interface Review { 
    readonly id?: string | null;
    created?: string;
    createdBy?: string | null;
    lastModified?: string | null;
    lastModifiedBy?: string | null;
    readonly readableId?: string | null;
    rating?: number | null;
    userId?: string | null;
    comment?: string | null;
    photoUrls?: Array<string> | null;
    status?: ReviewStatus;
    chargePointId?: string | null;
    chargePoint?: ChargePoint;
    readonly domainEvents?: Array<DomainEvent> | null;
    isArchived?: boolean;
    archiveDate?: string | null;
    archivedBy?: string | null;
    chargeSessionId?: string | null;
    chargeSession?: ChargeSession;
}
export namespace Review {
}

