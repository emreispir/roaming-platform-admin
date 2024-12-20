/**
 * AdminApp API
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 * The version of the OpenAPI document: v1
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */
import { UserBillingInfoType } from './userBillingInfoType';


export interface UserBillingInfoDto { 
    id?: string | null;
    name?: string | null;
    title?: string | null;
    billingInfoType?: UserBillingInfoType;
    taxNumber?: string | null;
    address?: string | null;
    city?: string | null;
    taxAdministration?: string | null;
    userId?: string | null;
    isPrimary?: boolean;
    country?: string | null;
}
export namespace UserBillingInfoDto {
}


