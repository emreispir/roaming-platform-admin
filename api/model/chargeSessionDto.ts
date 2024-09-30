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
import { UserDetailsDto } from './userDetailsDto';
import { ChargeSessionStatus } from './chargeSessionStatus';
import { ChargeSessionReviewDto } from './chargeSessionReviewDto';
import { ChargeSessionData } from './chargeSessionData';
import { TariffDto } from './tariffDto';
import { ChargePointDto } from './chargePointDto';


export interface ChargeSessionDto { 
    readonly id?: string | null;
    readonly userId?: string | null;
    readonly connectorNumber?: string | null;
    readonly ocppTransactionId?: string | null;
    no?: number;
    readonly created?: string;
    startReason?: string | null;
    stopReason?: string | null;
    readonly chargePointId?: string | null;
    readonly connectorId?: string | null;
    readonly plateNo?: string | null;
    readonly workspaceId?: string | null;
    readonly directoryId?: string | null;
    readonly transactionId?: string | null;
    status?: ChargeSessionStatus;
    readonly startDate?: string | null;
    readonly endDate?: string | null;
    readableId?: string | null;
    tariffId?: string | null;
    tariff?: TariffDto;
    chargePoint?: ChargePointDto;
    user?: UserDetailsDto;
    chargeSessionData?: ChargeSessionData;
    review?: ChargeSessionReviewDto;
    chargeRateKW?: number | null;
}
export namespace ChargeSessionDto {
}

