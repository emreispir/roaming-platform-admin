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
import { RoamingTariffDto } from './roamingTariffDto';
import { ConnectorType } from './connectorType';
import { ConnectorStatus } from './connectorStatus';
import { ChargingPowerType } from './chargingPowerType';
import { FormatType } from './formatType';


export interface RoamingConnectorDto { 
    id?: string | null;
    externalId?: string | null;
    powerType?: string | null;
    connectorType?: ConnectorType;
    currentType?: ChargingPowerType;
    status?: ConnectorStatus;
    formatType?: FormatType;
    power?: number | null;
    connectorNo?: string | null;
    tariff?: RoamingTariffDto;
}
export namespace RoamingConnectorDto {
}

