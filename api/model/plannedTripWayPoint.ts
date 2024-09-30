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
import { ChargePointInterestDto } from './chargePointInterestDto';
import { Location } from './location';


export interface PlannedTripWayPoint { 
    location?: Location;
    chargePointOfInterest?: ChargePointInterestDto;
    chargingMinutesAtPoint?: number;
    estimatedChargingInMeters?: number;
    estimatedBatteryLeftInMeters?: number;
    distanceFromPreviousWayPoint?: number;
    consumptionToWayPointInMeters?: number;
    stopIndex?: number;
    totalCostAtWayPoint?: number;
    arrivalTimeInMinutes?: number;
    departureTimeInMinutes?: number;
}

