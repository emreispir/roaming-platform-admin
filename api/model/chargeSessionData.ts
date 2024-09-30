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


export interface ChargeSessionData { 
    readonly calculatedKWH?: number;
    readonly meterStart?: number;
    readonly startMeterTime?: string | null;
    readonly meterStop?: number;
    readonly stopMeterTime?: string | null;
    stateOfChargeStart?: number | null;
    stateOfChargeStop?: number | null;
    startIdleTime?: string | null;
}

