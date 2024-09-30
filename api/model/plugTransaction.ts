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
import { Coupon } from './coupon';
import { TariffIdleFee } from './tariffIdleFee';
import { Address } from './address';
import { DomainEvent } from './domainEvent';
import { ChargePoint } from './chargePoint';
import { TariffStartingFee } from './tariffStartingFee';
import { TransactionStatus } from './transactionStatus';
import { TariffChargingFee } from './tariffChargingFee';
import { CreditCard } from './creditCard';
import { TariffType } from './tariffType';
import { Currency } from './currency';
import { ChargeSession } from './chargeSession';
import { BasePriceType } from './basePriceType';
import { TariffMinuteFee } from './tariffMinuteFee';
import { ChargeSessionData } from './chargeSessionData';
import { PlugInvoice } from './plugInvoice';
import { Directory } from './directory';
import { Workspace } from './workspace';


export interface PlugTransaction { 
    readonly id?: string | null;
    created?: string;
    createdBy?: string | null;
    lastModified?: string | null;
    lastModifiedBy?: string | null;
    metadata?: string | null;
    taxRate?: number;
    totalFee?: number;
    totalTax?: number;
    totalKWH?: number;
    totalMinutes?: number;
    userId?: string | null;
    taxNo?: string | null;
    taxAdministration?: string | null;
    taxName?: string | null;
    plateNo?: string | null;
    totalAmount?: number;
    discountAmount?: number;
    chargeSessionData?: ChargeSessionData;
    tariffType?: TariffType;
    tariffBasePrice?: number;
    tariffBasePriceType?: BasePriceType;
    tariffMinuteFee?: TariffMinuteFee;
    tariffChargingFee?: TariffChargingFee;
    tariffIdleFee?: TariffIdleFee;
    tariffStartingFee?: TariffStartingFee;
    status?: TransactionStatus;
    readonly domainEvents?: Array<DomainEvent> | null;
    chargeSessionId?: string | null;
    connectorId?: string | null;
    chargePointId?: string | null;
    currencyId?: string | null;
    paymentMethodId?: string | null;
    externalTransactionId?: string | null;
    description?: string | null;
    workspaceId?: string | null;
    directoryId?: string | null;
    creditCardId?: string | null;
    couponId?: string | null;
    coupon?: Coupon;
    creditCard?: CreditCard;
    senderAddress?: Address;
    receiverAddress?: Address;
    currency?: Currency;
    chargePoint?: ChargePoint;
    chargeSession?: ChargeSession;
    workspace?: Workspace;
    directory?: Directory;
    readonly readableId?: string | null;
    receiptUrl?: string | null;
    paymentDate?: string | null;
    paymentGatewayTransactionId?: string | null;
    applicationClientId?: string | null;
    invoice?: PlugInvoice;
    invoiceId?: string | null;
}
export namespace PlugTransaction {
}

