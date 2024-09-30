import { TemplateRef } from '@angular/core';
import { DirectoryDto, RoleDto, WorkspaceDto } from '../../../../api';

export interface TagResponse {
  icon: string;
  text: string;
  color?: string;
}

export interface ButtonOption {
  text: string;
  icon: any;
  color: string;
  size: string;
}

export interface SelectItemCustom {
  name: string;
  value: any;
}

export interface TabResponse {
  label: string;
  content: TemplateRef<any>;
  routerLink?: any;
  routeTab?: string;
}

export enum DataViewType {
  List = 'List',
  Table = 'Table',
}

export enum StepType {
  Next = 'Next',
  Previous = 'Previous',
}

export enum OperationType {
  Single = 'Single',
  Many = 'Many',
}

export interface JwtResponse {
  oid: string;
  sub: string;
  given_name: string;
  family_name: string;
  name: string;
  emails: string[];
  extension_Roles: string;
  extension_DirectoryId: string;
  extension_Directory: DirectoryDto;
  extension_Role: RoleDto;
  tfp: string;
  nonce: string;
  scp: string;
  azp: string;
  ver: string;
  iat: number;
  aud: string;
  exp: number;
  iss: string;
  nbf: number;
}

export enum Language {
  EN = 'en',
  TR = 'tr',
}

export enum CountryCode {
  TR = 'TR',
  US = 'US',
  CA = 'CA',
  GB = 'GB',
}

export enum Country {
  TR = 'Turkey',
  US = 'United States',
  CA = 'Canada',
  GB = 'United Kingdom',
}

export enum ConnectorActionType {
  START_CHARGE = 'START_CHARGE',
  STOP_CHARGE = 'STOP_CHARGE',
  UNLOCK_CONNECTOR = 'UNLOCK_CONNECTOR',
}

export enum InvoiceRequestType {
  ChargePoint = 'ChargePoint',
  Workspace = 'Workspace',
  SiteHost = 'SiteHost',
}
