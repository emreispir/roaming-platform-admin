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
import { ChargePointAccessibility } from './chargePointAccessibility';
import { ChargingMode } from './chargingMode';
import { ChargePointProtocol } from './chargePointProtocol';
import { ChargePointSourceType } from './chargePointSourceType';
import { ChargingLevel } from './chargingLevel';
import { ChargingPowerType } from './chargingPowerType';
import { AddressDto } from './addressDto';


export interface CreateChargePointDto { 
    name?: string | null;
    chargingMode?: ChargingMode;
    chargingLevel?: ChargingLevel;
    chargePointProtocol?: ChargePointProtocol;
    chargePointSourceType?: ChargePointSourceType;
    chargingPowerType?: ChargingPowerType;
    maxOutputKw?: number;
    chargePointAccessibility?: ChargePointAccessibility;
    address?: AddressDto;
    extraNotes?: string | null;
}
export namespace CreateChargePointDto {
}


