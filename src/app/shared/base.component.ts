import { TranslateService } from '@ngx-translate/core';
import { environment } from '../../environments/environment';
import { Keys, Patterns } from '../@core/constants/keys';
import { MenuItem, SelectItem } from 'primeng/api';
import {
  DialogService,
  DynamicDialogConfig,
  DynamicDialogRef
} from 'primeng/dynamicdialog';
import {
  FormBuilder,
  FormGroup,
  UntypedFormControl,
  UntypedFormGroup,
  Validators
} from '@angular/forms';
import { JwtResponse, StepType, TabResponse } from '../@core/models/common';
import { ElementRef, QueryList } from '@angular/core';
import { Router } from '@angular/router';
import { Icons, IconsArray } from '../../assets/svg/svg-variables';
import { Policy } from '../@core/models/policy';
import { SharedService } from '../@core/services/shared.service';
import jwt_decode from 'jwt-decode';
import * as moment from 'moment';
import * as atlas from 'azure-maps-control';
import { Subscription } from 'rxjs';
import { version } from '../../environments/version';
import { DynamicFormConfig, TableColumn, TableConfig } from 'surge-components';

export class BaseComponent {
  version = version;
  policy = Policy;
  environment = environment;
  loading: boolean;
  buttonLoading: boolean;
  loaderMessage = this.getTranslate('COMMON.LOADING');
  searchItem = new UntypedFormControl();
  stepTypes = StepType;
  page: any = 1;
  pageSize: any = 50;
  sort_by: string = null;
  // order_by = OrderBy.Desc;
  // sortOrder = OrderBy.Asc;
  sortField = null;
  patterns = Patterns;
  totalItemCount: any = 0;
  first = 0;
  filterDelay = 1000;
  currentPageReportText = '';
  dateNow = moment();
  breadcrumbMenuItems: MenuItem[];
  filter: any = {};
  components?: any = {};
  dialogConfig: DynamicDialogConfig = { closable: false, data: null };
  myForm: UntypedFormGroup;
  formConfig: DynamicFormConfig;
  submitted: boolean;
  tabs: TabResponse[];
  menuItems: MenuItem[];
  filterMenuItems: MenuItem[];
  stepNumber = 1;
  selectedFilter: string = null;
  selectedFilters: any[] = [];
  isSearchActive: boolean;
  map: atlas.Map;
  dataSource: atlas.source.DataSource | undefined;
  point: atlas.Shape | null = null;
  mapOptions: atlas.ServiceOptions &
    atlas.StyleOptions &
    atlas.UserInteractionOptions &
    (atlas.CameraOptions | atlas.CameraBoundsOptions) = {
    center: new atlas.data.Position(29, 41),
    zoom: 10,
    showLogo: false,
    showFeedbackLink: false,
    style: 'road',
    authOptions: {
      authType: atlas.AuthenticationType.subscriptionKey,
      subscriptionKey: environment.azure_maps_api_key
    }
  };
  xApplicationClientId = environment.x_application_client_id;
  showDialog: boolean;
  uploadSuccessFull: boolean;
  todayRange = {
    startDate: moment()
      .startOf('day')
      .format('YYYY-MM-DDTHH:mm:ss.SSSZ'),
    endDate: moment()
      .endOf('day')
      .format('YYYY-MM-DDTHH:mm:ss.SSSZ')
  };
  monthRange = {
    startDate: moment()
      .startOf('month')
      .format('YYYY-MM-DDTHH:mm:ss.SSSZ'),
    endDate: moment()
      .endOf('day')
      .format('YYYY-MM-DDTHH:mm:ss.SSSZ')
  };

  monthRangeDate = {
    startDate: moment()
      .subtract(1, 'months')
      .toDate(),
    endDate: moment().toDate()
  };
  surgeStartDate = moment()
    .startOf('day')
    .set({ year: 2021, month: 0, date: 1 })
    .format('YYYY-MM-DDTHH:mm:ss.SSSZ');
  subscription: Subscription = new Subscription();
  tableColumns: TableColumn[] = [];
  tableConfig: TableConfig = {
    lazy: true,
    page: this.page,
    pageSize: this.pageSize,
    isPaginated: true,
    totalItemCount: this.totalItemCount,
    loadLazy: null,
    filterDelay: this.filterDelay,
    first: this.first,
    showBaseInfo: false
  };

  constructor(
    private translate: TranslateService,
    protected dialogRef?: DynamicDialogRef,
    protected dialogService?: DialogService,
    protected router?: Router,
    protected sharedService?: SharedService,
    protected formBuilder?: FormBuilder
  ) {}

  checkSearchActive(search: any, filter?: any, filters?: any[]): void {
    if (search || filter || filters?.length > 0) {
      this.isSearchActive = true;
    } else {
      this.isSearchActive = false;
    }
  }

  getDecodedUserToken(jwt?: string): JwtResponse {
    let jwtDecodedResponse: JwtResponse = null;
    let jwtBase: any = jwt_decode(
      jwt ? jwt : localStorage.getItem(Keys.USER_TOKEN)
    );

    jwtDecodedResponse = {
      ...jwtBase
    };

    return jwtDecodedResponse;
  }

  getParameterByName(name, url) {
    if (!url) {
      url = url;
    }

    name = name.replace(/[\[\]]/g, '\\$&');
    const regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
      results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';

    return decodeURIComponent(results[2].replace(/\%20/g, '+'));
  }

  getTranslate(key: string, params?: any): string {
    let translateResult: string;
    this.translate.get(key, params).subscribe((t: string) => {
      translateResult = t;
    });

    return translateResult;
  }

  handleError(response: any) {
    const errorBody = response?.error;
    let objectError = '';

    if (response.status === 403) {
      objectError = errorBody?.detail
        ? errorBody?.detail
        : this.getTranslate('COMMON.NOT-AUTHORIZED');
    } else if (response.status === 400) {
      if (errorBody.errors) {
        Object.getOwnPropertyNames(errorBody.errors).forEach(x => {
          objectError += `- ${errorBody.errors[x]}\n`;
        });
      } else {
        if (errorBody.code === '308') {
          objectError = errorBody.code;
        } else {
          objectError = errorBody.detail;
        }
      }
    } else {
      objectError = errorBody?.detail ?? response;
    }

    return objectError;
  }

  getInitials(str: string, onlyFirst: boolean): string {
    if (str) {
      const words = str?.toUpperCase().split(' ');
      if (words.length === 1) {
        return words[0]?.substring(0, 1);
      }

      if (onlyFirst) {
        return words[0][0]?.toUpperCase();
      }

      return words[0][0]?.toUpperCase() + words[0][1]?.toLowerCase();
    }
  }

  open(component, config: DynamicDialogConfig = this.dialogConfig) {
    this.close();
    this.dialogRef = this.dialogService.open(component, config);
  }

  close(param?: any) {
    if (this.dialogRef) {
      this.dialogRef.close(param);
    }
  }

  generateSelectItemsFromEnum<T>(enumObject: T): SelectItem[] {
    const selectItems: SelectItem[] = [];
    for (const key in enumObject) {
      if (enumObject.hasOwnProperty(key)) {
        const value = enumObject[key];
        if (
          typeof value === 'number' ||
          typeof value === 'string' ||
          typeof value === 'boolean'
        ) {
          if (value !== 'Undefined') {
            selectItems.push({
              label: this.getTranslate(`ENUM.${key.toUpperCase()}`),
              value: key
            });
          }
        }
      }
    }
    return selectItems;
  }

  getEnumTypeTranslation<T>(enumObject: T, type: any): string {
    let result = '';
    for (const key in enumObject) {
      if (enumObject.hasOwnProperty(key)) {
        const value = key;
        if (
          typeof value === 'number' ||
          typeof value === 'string' ||
          typeof value === 'boolean'
        ) {
          if (value === type) {
            result = this.getTranslate(`ENUM.${key.toUpperCase()}`);
          }
        }
      }
    }
    return result;
  }

  scrollToSection(sectionId: string, sectionContainers: QueryList<ElementRef>) {
    if (sectionId && sectionContainers) {
      const section = sectionContainers.find(
        (el: ElementRef) => el.nativeElement.id === sectionId
      );
      if (
        section &&
        section.nativeElement &&
        typeof section.nativeElement.scrollIntoView === 'function'
      ) {
        section.nativeElement.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }

  isCurrentStepValid(currentFormGroup: UntypedFormGroup): boolean {
    return currentFormGroup.valid;
  }

  markCurrentStepAsTouched(currentFormGroup: UntypedFormGroup): void {
    currentFormGroup.markAllAsTouched();
  }

  dateDifference(start: string, end: string): string {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const startTime = startDate.getTime();
    const endTime = endDate.getTime();
    const timeDiff = endTime - startTime;

    if (timeDiff < 60000) {
      return this.getTranslate('PAGES.SESSIONS.LESS-THAN-A-MINUTE');
    }

    const seconds = Math.floor(timeDiff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    const minute = minutes % 60;
    const hour = hours % 24;

    const formattedTimeDiff = `${
      days ? days + this.getTranslate('PAGES.SESSIONS.DAY') + ' ' : ''
    }${hour ? hour + this.getTranslate('PAGES.SESSIONS.HOUR') + ' ' : ''}${
      minute ? minute + this.getTranslate('PAGES.SESSIONS.MINUTE') : ''
    }`;

    return formattedTimeDiff;
  }

  getIconWithClass(
    iconName: string,
    className: string,
    isArray?: boolean
  ): string {
    let svgString = null;

    let result = null;

    if (isArray) {
      svgString = IconsArray[iconName].value[0] || '';
      result = svgString.replace('svgIcon', `svgIcon ${className}`);
    } else {
      svgString = Icons[iconName] || '';
      result = svgString?.value.replace('svgIcon', `svgIcon ${className}`);
    }

    return result;
  }

  getMasked(item: any): string {
    const mask = '*'.repeat(item.length);
    return mask;
  }

  createFormGroupFromParameters(
    parameters: { [key: string]: any },
    values?: any
  ): FormGroup {
    const group: any = {};

    if (values != undefined) {
      Object.keys(parameters).forEach(key => {
        const controlValue = values[key] !== undefined ? values[key] : '';
        group[key] = [controlValue, Validators.required];
      });
    } else {
      Object.keys(parameters).forEach(key => {
        group[key] = [parameters[key] || ''];
      });
    }

    return this.formBuilder.group(group);
  }
}
