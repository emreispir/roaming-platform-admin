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
import { Currency } from './currency';
import { Country } from './country';


export interface Subscription { 
    readonly id?: string | null;
    created?: string;
    createdBy?: string | null;
    lastModified?: string | null;
    lastModifiedBy?: string | null;
    name?: string | null;
    description?: string | null;
    tier?: number;
    chargePointLimit?: number;
    price?: number;
    priceForAdditionalChargePoints?: number;
    canAddAdditionalChargePoints?: boolean;
    canCreatePublicChargePoints?: boolean;
    transactionFeeRate?: number;
    isCustom?: boolean;
    countryId?: string | null;
    country?: Country;
    currencyId?: string | null;
    currency?: Currency;
    isArchived?: boolean;
    archiveDate?: string | null;
    archivedBy?: string | null;
    isActive?: boolean;
}
