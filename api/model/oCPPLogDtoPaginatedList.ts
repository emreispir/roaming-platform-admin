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
import { OCPPLogDto } from './oCPPLogDto';


export interface OCPPLogDtoPaginatedList { 
    items?: Array<OCPPLogDto> | null;
    pageNumber?: number;
    readonly totalPages?: number;
    readonly totalCount?: number;
    readonly hasPreviousPage?: boolean;
    readonly hasNextPage?: boolean;
}

