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
import { SideOfRoad } from './sideOfRoad';
import { TripPlannerSearchParams } from './tripPlannerSearchParams';
import { Location } from './location';


export interface GetEVTripPlanQuery { 
    origin?: Location;
    destination?: Location;
    readonly radius?: number;
    sideOfRoad?: SideOfRoad;
    tripPlannerSearchParams?: TripPlannerSearchParams;
}
export namespace GetEVTripPlanQuery {
}

