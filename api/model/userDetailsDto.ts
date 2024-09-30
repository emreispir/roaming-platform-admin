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
import { UserRoleDto } from './userRoleDto';


export interface UserDetailsDto { 
    id?: string | null;
    readonly firstName?: string | null;
    readonly lastName?: string | null;
    readonly userName?: string | null;
    readonly displayName?: string | null;
    readonly createdDate?: string | null;
    readonly imageUrl?: string | null;
    mobilePhone?: string | null;
    userPrincipalName?: string | null;
    email?: string | null;
    birthday?: string | null;
    streetAddress?: string | null;
    postalCode?: string | null;
    city?: string | null;
    state?: string | null;
    country?: string | null;
    readonly roles?: Array<UserRoleDto> | null;
}

