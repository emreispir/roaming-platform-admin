import {
  AfterViewChecked,
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChildren
} from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
  DialogService,
  DynamicDialogConfig,
  DynamicDialogRef
} from 'primeng/dynamicdialog';
import { NotificationService } from '../../../@core/services/notification.service';
import { SharedService } from '../../../@core/services/shared.service';
import { RoleType } from '../../../@core/models/user';
import { UserDetailsDto } from '../../../../../api/model/userDetailsDto';
import { UserRoleResponse } from '../../../../../api/model/userRoleResponse';
import { UsersService } from '../../../../../api/api/users.service';
import { ChargeSessionDto } from '../../../../../api/model/chargeSessionDto';
import {
  CampaignCouponDto,
  CampaignsService,
  ChargeSessionsService,
  CurrencyDto,
  TransactionDto,
  TransactionsService
} from '../../../../../api';
import { TagResponse } from '../../../@core/models/common';
import { SafeHtml, DomSanitizer } from '@angular/platform-browser';
import { Icons, IconsArray } from '../../../../assets/svg/svg-variables';
import { Policy } from '../../../@core/models/policy';
import { ScrollableComponent } from '../../../@core/components/scrollable/scrollable.component';
import * as moment from 'moment';
import { HeaderPanelComponent } from '../../../@core/components/header-panel/header-panel.component';
import { SessionListComponent } from '../../session/session-list/session-list.component';
import { TransactionListComponent } from '../../transaction/transaction-list/transaction-list.component';
import { AsyncPipe, NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-users-detail',
  templateUrl: './users-detail.component.html',
  styleUrls: ['./users-detail.component.scss'],
  standalone: true,
  imports: [
    TranslateModule,
    RouterModule,
    HeaderPanelComponent,
    SessionListComponent,
    TransactionListComponent,
    AsyncPipe,
    NgIf,
    NgFor
  ]
})
export class UsersDetailComponent extends ScrollableComponent
  implements AfterViewChecked, OnInit, OnDestroy, AfterViewInit {
  @ViewChildren('sectionContainer') sectionContainers!: QueryList<ElementRef>;

  userLoading: boolean;
  userId: string;
  userResponse: UserDetailsDto;
  userRoleResponse: UserRoleResponse;
  roleTypes = RoleType;
  userTagsResponse: TagResponse[];

  campaignsLoading: boolean;
  campaignsResponse: CampaignCouponDto[] = [];

  transactionLoading: boolean;

  transactionsResponse: TransactionDto[];
  sessionsResponse: ChargeSessionDto[];

  currenciesData: any[];
  dateMenuItems: any[];

  directoryId: string;
  chargeSessionsLoading: boolean;

  campaignIcon: SafeHtml = this.sanitizer.bypassSecurityTrustHtml(
    this.getIconWithClass(
      IconsArray.CampaignIcon.name,
      'regular dark-gray filled-path',
      true
    )
  );

  noTransactionIcon: SafeHtml = this.sanitizer.bypassSecurityTrustHtml(
    this.getIconWithClass(IconsArray.NoTransactionIcon.name, '', true)
  );

  infoPanelImageUrl: SafeHtml = this.sanitizer.bypassSecurityTrustHtml(
    this.getIconWithClass(Icons.InfoPanelIllustration.name, '')
  );
  chargeSessionIcon: SafeHtml = this.sanitizer.bypassSecurityTrustHtml(
    this.getIconWithClass(Icons.ChargeSessionIcon.name, 'regular dark-gray')
  );
  settingIcon: SafeHtml = this.sanitizer.bypassSecurityTrustHtml(
    this.getIconWithClass(Icons.SettingIcon.name, 'regular')
  );

  stationSvg: SafeHtml = this.sanitizer.bypassSecurityTrustHtml(
    this.getIconWithClass(IconsArray.StationSvg.name, '', true)
  );

  noCampaignIcon: SafeHtml = this.sanitizer.bypassSecurityTrustHtml(
    this.getIconWithClass(IconsArray.NoCampaignIcon.name, 'xxxlarge', true)
  );

  constructor(
    protected chargeSessionsService: ChargeSessionsService,
    protected transactionsService: TransactionsService,
    protected campaignService: CampaignsService,
    protected usersService: UsersService,
    protected sessionsService: ChargeSessionsService,
    protected sharedService: SharedService,
    protected notificationService: NotificationService,
    protected translateService: TranslateService,
    protected router: Router,
    public activatedRoute: ActivatedRoute,
    protected config: DynamicDialogConfig,
    protected dialogService: DialogService,
    protected dialogRef: DynamicDialogRef,
    private cd: ChangeDetectorRef,
    protected sanitizer: DomSanitizer
  ) {
    super(translateService);
    this.init();
  }

  ngAfterViewChecked() {
    this.cd.detectChanges();
  }

  ngAfterViewInit(): void {
    super.ngAfterViewInit();
  }

  init() {
    this.directoryId = this.getDecodedUserToken()?.extension_DirectoryId
      ? this.getDecodedUserToken()?.extension_DirectoryId
      : null;

    this.subscription.add(
      this.activatedRoute.params.subscribe(params => {
        this.userId = params['id'];
        this.getUser();
      })
    );

    this.generateTabs();
  }

  generateTabs() {
    this.tabs = [];

    this.tabs = [
      {
        label: this.getTranslate('COMMON.OVERVIEW'),
        content: null,
        routeTab: ''
      }
    ];

    if (this.isUserValidForPolicies([Policy.ChargeSessionRead])) {
      this.tabs.push({
        label: this.getTranslate('PAGES.SESSIONS.TITLE'),
        content: null,
        routeTab: 'sessions'
      });
    } else {
      this.tabs.push({
        label: null,
        content: null,
        routeTab: null
      });
    }

    if (this.isUserValidForPolicies([Policy.TransactionRead])) {
      this.tabs.push({
        label: this.getTranslate('PAGES.TRANSACTIONS.TITLE'),
        content: null,
        routeTab: 'transactions'
      });
    } else {
      this.tabs.push({
        label: null,
        content: null,
        routeTab: null
      });
    }

    if (this.isUserValidForPolicies([Policy.ReviewRead])) {
      this.tabs.push({
        label: this.getTranslate('PAGES.CAMPAIGNS.TITLE'),
        content: null,
        routeTab: 'campaigns'
      });
    } else {
      this.tabs.push({
        label: null,
        content: null,
        routeTab: null
      });
    }

    this.sharedService.changeSelectedTab(0);
  }

  ngOnInit(): void {
    this.subscription.add(
      this.activatedRoute.params.subscribe(params => {
        const tabName = params['tabName'];
        const tabIndex = this.tabs.findIndex(tab => tab?.routeTab === tabName);

        if (tabIndex !== -1) {
          this.sharedService.selectedTabIndex.next(tabIndex);
        }
      })
    );
  }

  getUser() {
    this.userLoading = true;
    this.subscription.add(
      this.usersService.usersIdGet(this.userId).subscribe({
        next: v => {
          this.userResponse = v;

          this.breadcrumbMenuItems = [
            { label: this.getTranslate('SURGE'), routerLink: '/dashboard' },
            {
              label: this.getDecodedUserToken()?.extension_Directory?.name,
              routerLink: '/dashboard'
            },
            {
              label: this.getTranslate('SIDE-NAV.USERS'),
              routerLink: '/users'
            },
            { label: this.userResponse?.displayName }
          ];

          this.sharedService.changedBreadcrumbData(this.breadcrumbMenuItems);

          this.userTagsResponse = [
            { icon: null, text: this.userResponse?.mobilePhone ?? null },
            { icon: null, text: this.userResponse?.email ?? null },
            {
              icon: null,
              text:
                moment(this.userResponse?.createdDate).format('DD.MM.yyy') ??
                null
            }
          ];

          this.loadData();
        },
        error: e => {
          this.notificationService.showErrorToast(this.handleError(e));
          this.userLoading = false;
        },
        complete: () => {
          this.userLoading = false;
        }
      })
    );
  }

  loadData() {
    let currencies = this.sharedService.getCurrencies();
    this.generateCurrenciesData(currencies);

    let message = {
      range: this.monthRange,
      item: this.currenciesData[0]
    };

    if (this.sharedService?.selectedTabIndex?.value === 0) {
      if (this.isUserValidForPolicies([Policy.CampaignRead])) {
        this.getCampaigns(this.page, 3);
      }

      if (this.isUserValidForPolicies([Policy.TransactionRead])) {
        this.getTransactions();
      }

      if (this.isUserValidForPolicies([Policy.ChargeSessionRead])) {
        this.getSessions(this.page, 7);
      }
    }
  }

  generateCurrenciesData(currencies: CurrencyDto[]): any {
    this.currenciesData = [];
    return currencies.forEach(currency => {
      this.currenciesData.push({
        label: currency?.code,
        value: currency
      });
    });
  }

  getCampaigns(page: number, pageSize: number) {
    // this.campaignsLoading = true;
    // this.campaignsResponse = [];
    // this.subscription.add();
  }

  getTransactions() {
    this.transactionLoading = true;
    this.subscription.add(
      this.transactionsService
        .transactionsGet(
          this.page,
          7,
          null,
          this.directoryId,
          null, // workspaceId
          null,
          moment(this.monthRangeDate?.startDate)
            ?.startOf('day')
            .format('YYYY-MM-DDTHH:mm:ss.SSSZ'),
          moment(this.monthRangeDate?.endDate)
            ?.endOf('day')
            .format('YYYY-MM-DDTHH:mm:ss.SSSZ'),
          this.userId,
          null,
          null,
          null,
          null,
          this.xApplicationClientId
        )
        .subscribe({
          next: v => {
            this.transactionsResponse = [];
            this.transactionsResponse = v.items;
          },
          error: e => {
            this.notificationService.showErrorToast(this.handleError(e));
            this.transactionLoading = false;
          },
          complete: () => {
            this.transactionLoading = false;
          }
        })
    );
  }

  getSessions(page: number, size: number) {
    this.chargeSessionsLoading = true;

    this.subscription.add(
      this.chargeSessionsService
        .chargeSessionsGet(
          page,
          size,
          null,
          this.directoryId,
          null,
          null,
          this.userId,
          moment(this.monthRangeDate?.startDate)
            ?.startOf('day')
            .format('YYYY-MM-DDTHH:mm:ss.SSSZ'),
          moment(this.monthRangeDate?.endDate)
            ?.endOf('day')
            .format('YYYY-MM-DDTHH:mm:ss.SSSZ'),
          null,
          this.xApplicationClientId
        )
        .subscribe({
          next: v => {
            this.sessionsResponse = [];
            this.sessionsResponse = v.items;
          },
          error: e => {
            this.notificationService.showErrorToast(this.handleError(e));
            this.chargeSessionsLoading = false;
          },
          complete: () => {
            this.chargeSessionsLoading = false;
          }
        })
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
