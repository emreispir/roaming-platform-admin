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
import { UserDetailsDto } from './userDetailsDto';
import { ChargeSessionStatus } from './chargeSessionStatus';
import { MemberBillingInfoDto } from './memberBillingInfoDto';
import { TariffIdleFee } from './tariffIdleFee';
import { TariffStartingFee } from './tariffStartingFee';
import { TransactionStatus } from './transactionStatus';
import { TariffChargingFee } from './tariffChargingFee';
import { CurrencyDto } from './currencyDto';
import { TariffType } from './tariffType';
import { InvoiceDto } from './invoiceDto';
import { BasePriceType } from './basePriceType';
import { TariffMinuteFee } from './tariffMinuteFee';
import { ChargeSessionData } from './chargeSessionData';


export interface TransactionDto { 
    id?: string | null;
    taxRate?: number;
    totalFee?: number;
    totalTax?: number;
    totalKWH?: number;
    totalMinutes?: number;
    userId?: string | null;
    taxNo?: string | null;
    taxAdministration?: string | null;
    taxName?: string | null;
    totalAmount?: number;
    discountAmount?: number | null;
    tariffType?: TariffType;
    tariffBasePrice?: number;
    tariffBasePriceType?: BasePriceType;
    chargeSessionData?: ChargeSessionData;
    tariffMinuteFee?: TariffMinuteFee;
    tariffChargingFee?: TariffChargingFee;
    tariffIdleFee?: TariffIdleFee;
    tariffStartingFee?: TariffStartingFee;
    plateNo?: string | null;
    couponCode?: string | null;
    couponId?: string | null;
    readonly chargeSessionId?: string | null;
    connectorId?: string | null;
    chargePointId?: string | null;
    currencyId?: string | null;
    paymentMethodId?: string | null;
    externalTransactionId?: string | null;
    description?: string | null;
    workspaceId?: string | null;
    directoryId?: string | null;
    created?: string;
    status?: TransactionStatus;
    user?: UserDetailsDto;
    currency?: CurrencyDto;
    invoiceId?: string | null;
    paymentGatewayTransactionId?: string | null;
    readableId?: string | null;
    chargePointName?: string | null;
    chargeSessionStatus?: ChargeSessionStatus;
    creditCardNumber?: string | null;
    isInvoiceDownloadable?: boolean;
    memberBillingInfo?: MemberBillingInfoDto;
    invoice?: InvoiceDto;
    metadata?: string | null;
}
export namespace TransactionDto {
}

