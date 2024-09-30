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
import { HolderPlatform } from './holderPlatform';


export interface CreditCard { 
    readonly id?: string | null;
    created?: string;
    createdBy?: string | null;
    lastModified?: string | null;
    lastModifiedBy?: string | null;
    maskedCCNo?: string | null;
    tokenId?: string | null;
    userId?: string | null;
    externalUserId?: string | null;
    isPrimary?: boolean;
    holderPlatform?: HolderPlatform;
    isArchived?: boolean;
    archiveDate?: string | null;
    archivedBy?: string | null;
    isActive?: boolean;
    applicationClientId?: string | null;
    directoryId?: string | null;
}
export namespace CreditCard {
}


