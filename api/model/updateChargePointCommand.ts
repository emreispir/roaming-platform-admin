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


export interface UpdateChargePointCommand { 
    id?: string | null;
    userId?: string | null;
    workspaceId?: string | null;
    name?: string | null;
    identifier?: string | null;
    chargingMode?: ChargingMode;
    chargingLevel?: ChargingLevel;
    chargePointProtocol?: ChargePointProtocol;
    chargePointSourceType?: ChargePointSourceType;
    chargingPowerType?: ChargingPowerType;
    maxOutputKw?: number | null;
    chargePointAccessibility?: ChargePointAccessibility;
    address?: AddressDto;
    isGreenEnergy?: boolean | null;
    isActive?: boolean | null;
    extraNotes?: string | null;
    externalId?: string | null;
    heartBeatInterval?: number | null;
}
export namespace UpdateChargePointCommand {
}

