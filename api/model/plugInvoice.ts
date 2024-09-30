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
import { InvoiceProfileId } from './invoiceProfileId';
import { PlugTransaction } from './plugTransaction';
import { InvoiceStatus } from './invoiceStatus';


export interface PlugInvoice { 
    readonly id?: string | null;
    created?: string;
    createdBy?: string | null;
    lastModified?: string | null;
    lastModifiedBy?: string | null;
    transaction?: PlugTransaction;
    supplierTaxNo?: string | null;
    supplierName?: string | null;
    customerTaxNo?: string | null;
    customerName?: string | null;
    transactionId?: string | null;
    userId?: string | null;
    statusMessage?: string | null;
    status?: InvoiceStatus;
    profileId?: InvoiceProfileId;
    readonly issueDate?: string;
    lastUpdate?: string | null;
    resultMessage?: string | null;
}
export namespace PlugInvoice {
}

