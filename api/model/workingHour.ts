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
import { TimeSpan } from './timeSpan';
import { DayOfWeek } from './dayOfWeek';


export interface WorkingHour { 
    isClosed?: boolean;
    openTime?: TimeSpan;
    closeTime?: TimeSpan;
    dayOfWeek?: DayOfWeek;
}
export namespace WorkingHour {
}

