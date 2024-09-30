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
import { BankAccountInfo } from './bankAccountInfo';
import { WorkspaceType } from './workspaceType';
import { Address } from './address';
import { ContactInfo } from './contactInfo';
import { LeaseSharingInfo } from './leaseSharingInfo';
import { BillingInfo } from './billingInfo';


export interface UpdateWorkspaceCommand { 
    id?: string | null;
    name?: string | null;
    description?: string | null;
    address?: Address;
    workspaceType?: WorkspaceType;
    contactInfo?: ContactInfo;
    bankAccountInfo?: BankAccountInfo;
    userId?: string | null;
    billingInfo?: BillingInfo;
    leaseSharingInfo?: LeaseSharingInfo;
}
export namespace UpdateWorkspaceCommand {
}

