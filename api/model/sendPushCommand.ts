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


export interface SendPushCommand { 
    userIds?: Array<string> | null;
    title?: string | null;
    body?: string | null;
    directoryId?: string | null;
    parameters?: { [key: string]: string; } | null;
}
