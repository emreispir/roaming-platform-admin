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
import { Invoice } from './invoice';
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
import { Directory } from './directory';
import { Workspace } from './workspace';


export interface Transaction { 
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
    status?: TransactionStatus;
    receiptUrl?: string | null;
    readonly domainEvents?: Array<DomainEvent> | null;
    invoiceId?: string | null;
    invoice?: Invoice;
    paymentDate?: string | null;
    paymentGatewayTransactionId?: string | null;
    applicationClientId?: string | null;
}
export namespace Transaction {
}

