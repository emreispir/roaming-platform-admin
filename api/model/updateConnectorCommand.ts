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
import { ConnectorType } from './connectorType';
import { VoltageLevel } from './voltageLevel';
import { ChargingPowerType } from './chargingPowerType';
import { PowerType } from './powerType';
import { FormatType } from './formatType';


export interface UpdateConnectorCommand { 
    id?: string | null;
    powerType?: PowerType;
    formatType?: FormatType;
    connectorType?: ConnectorType;
    voltageLevel?: VoltageLevel;
    currentType?: ChargingPowerType;
    amps?: number | null;
    watts?: number | null;
    externalId?: string | null;
    qrCodeValue?: string | null;
}
export namespace UpdateConnectorCommand {
}


