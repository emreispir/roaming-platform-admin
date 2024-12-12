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
import { Amenity } from './amenity';
import { ConnectorType } from './connectorType';
import { ChargingLevel } from './chargingLevel';
import { ChargingPowerType } from './chargingPowerType';
import { ChargePointStatus } from './chargePointStatus';
import { RoamingConnectorDto } from './roamingConnectorDto';


export interface RoamingPointDto { 
    id?: string | null;
    distanceToRoad?: number;
    distanceFromOriginInMeters?: number;
    durationFromOriginInSeconds?: number;
    provider?: string | null;
    externalId?: string | null;
    latitude?: number;
    longitude?: number;
    isActive?: boolean;
    isFavorited?: boolean | null;
    surgeAvailable?: boolean;
    name?: string | null;
    address?: string | null;
    phone?: string | null;
    url?: string | null;
    operatorName?: string | null;
    kwh?: number;
    connectorTypes?: Array<ConnectorType> | null;
    status?: ChargePointStatus;
    currentType?: ChargingPowerType;
    chargingLevel?: ChargingLevel;
    lastModified?: string | null;
    brandName?: string | null;
    isGreenEnergy?: boolean;
    isSponsored?: boolean;
    lastSignalDate?: string | null;
    sockets?: Array<RoamingConnectorDto> | null;
    amenities?: Array<Amenity> | null;
    photoUrls?: Array<string> | null;
}
export namespace RoamingPointDto {
}


