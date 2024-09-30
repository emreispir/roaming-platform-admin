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
import { MemberBillingInfoType } from './memberBillingInfoType';


export interface MemberBillingInfo { 
    readonly id?: string | null;
    title?: string | null;
    name?: string | null;
    billingInfoType?: MemberBillingInfoType;
    taxNumber?: string | null;
    address?: string | null;
    city?: string | null;
    country?: string | null;
    taxAdministration?: string | null;
    userId?: string | null;
    isPrimary?: boolean;
    isArchived?: boolean;
    archiveDate?: string | null;
    archivedBy?: string | null;
    applicationClientId?: string | null;
}
export namespace MemberBillingInfo {
}


