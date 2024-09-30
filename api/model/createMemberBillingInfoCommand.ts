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


export interface CreateMemberBillingInfoCommand { 
    title?: string | null;
    name?: string | null;
    billingInfoType?: MemberBillingInfoType;
    taxNumber?: string | null;
    address?: string | null;
    city?: string | null;
    country?: string | null;
    taxAdministration?: string | null;
    isPrimary?: boolean;
}
export namespace CreateMemberBillingInfoCommand {
}

