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
import { Amenity } from './amenity';
import { ChargePointAccessibility } from './chargePointAccessibility';
import { ChargingMode } from './chargingMode';
import { ChargePointProtocol } from './chargePointProtocol';
import { ChargePointSourceType } from './chargePointSourceType';
import { ChargingLevel } from './chargingLevel';
import { ChargingPowerType } from './chargingPowerType';
import { WorkingHourDto } from './workingHourDto';
import { ChargePointStatus } from './chargePointStatus';
import { AddressDto } from './addressDto';


export interface ChargePointSimpleDto { 
    id?: string | null;
    identifier?: string | null;
    workspaceId?: string | null;
    name?: string | null;
    chargingMode?: ChargingMode;
    chargingLevel?: ChargingLevel;
    chargePointProtocol?: ChargePointProtocol;
    chargePointSourceType?: ChargePointSourceType;
    chargingPowerType?: ChargingPowerType;
    maxOutputKw?: number;
    lastHeartBeatTime?: string | null;
    lastModified?: string | null;
    chargePointAccessibility?: ChargePointAccessibility;
    status?: ChargePointStatus;
    extraNotes?: string | null;
    readableId?: string | null;
    isReservationsEnabled?: boolean;
    address?: AddressDto;
    workspaceName?: string | null;
    workspaceReadableId?: string | null;
    externalId?: string | null;
    photoUrls?: Array<string> | null;
    amenities?: Array<Amenity> | null;
    workingHours?: Array<WorkingHourDto> | null;
    isGreenEnergy?: boolean;
    isSponsored?: boolean;
    brandName?: string | null;
}
export namespace ChargePointSimpleDto {
}


