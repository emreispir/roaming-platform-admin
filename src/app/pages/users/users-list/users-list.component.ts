import {
  AfterViewInit,
  AfterViewChecked,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  OnDestroy
} from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
  DynamicDialogConfig,
  DialogService,
  DynamicDialogRef
} from 'primeng/dynamicdialog';
import { NotificationService } from '../../../@core/services/notification.service';
import { SharedService } from '../../../@core/services/shared.service';
import { LazyLoadEvent, MenuItem } from 'primeng/api';
import {
  OrderBy,
  UserDetailsDto,
  UsersService,
  WorkspaceDto,
  RoleDto
} from '../../../../../api';
import { Router, RouterModule } from '@angular/router';
import { RoleType } from '../../../@core/models/user';
import { SafeHtml, DomSanitizer } from '@angular/platform-browser';
import { Icons, IconsArray } from '../../../../assets/svg/svg-variables';
import { debounceTime } from 'rxjs/internal/operators/debounceTime';
import { ScrollableComponent } from '../../../@core/components/scrollable/scrollable.component';
import { DatePipe, NgClass, NgIf } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MenuModule } from 'primeng/menu';
import {
  DataTableComponent,
  DynamicElementComponent,
  DynamicMenuComponent,
  CardWithAvatarComponent
} from 'surge-components';
import { LoaderComponent } from '../../../@core/components/loader/loader.component';
import { InfoPanelComponent } from '../../../@core/components/info-panel/info-panel.component';
import { InfoCardComponent } from '../../../@core/components/info-card/info-card.component';
import { HeaderPanelComponent } from '../../../@core/components/header-panel/header-panel.component';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [
    TranslateModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    MenuModule,
    HeaderPanelComponent,
    LoaderComponent,
    InfoPanelComponent,
    InfoCardComponent,
    ButtonModule,
    NgIf,
    NgClass,
    InputTextModule,
    DataTableComponent,
    DynamicElementComponent,
    DynamicMenuComponent
  ],
  templateUrl: './users-list.component.html',
  styleUrls: ['./users-list.component.scss']
})
export class UsersListComponent extends ScrollableComponent
  implements AfterViewInit, AfterViewChecked, OnInit, OnDestroy {
  @Input() infoTitle: string = this.getTranslate('PAGES.USERS.DONT-HAVE');
  @Input() infoSubtitle: string = this.getTranslate('PAGES.USERS.ADD-A-USER');
  @Input() toolTipContent: string;
  @Input() customPageSize: number;
  @Input() isChild: boolean;
  @Input() isBox: boolean;
  @Input() showActionbar: boolean;
  @Input() actionbarTitle: string;
  @Input() showActionbarSearch: boolean = true;
  @Input() showActionbarFilter: boolean = true;
  @Input() showBaseInfo: boolean;
  @Input() actionbarButton: string;
  @Input() isPaginated: boolean = true;
  @Input() directoryId: string;
  @Input() workspace: WorkspaceDto;
  @Input() rolesResponse: RoleDto[];

  @Output() customButtonClick: EventEmitter<void> = new EventEmitter<void>();

  infoPanelTitle: string = this.getTranslate('PAGES.USERS.DONT-HAVE');
  infoPanelDescription: string = '';

  settingIcon: SafeHtml = this.sanitizer.bypassSecurityTrustHtml(
    this.getIconWithClass(Icons.SettingIcon.name, 'regular')
  );
  settingIconBlack: SafeHtml = this.sanitizer.bypassSecurityTrustHtml(
    this.getIconWithClass(Icons.SettingIcon.name, 'regular black')
  );
  searchIcon: SafeHtml = this.sanitizer.bypassSecurityTrustHtml(
    this.getIconWithClass(Icons.SearchIcon.name, 'regular')
  );
  filterIcon: SafeHtml = this.sanitizer.bypassSecurityTrustHtml(
    this.getIconWithClass(Icons.FilterIcon.name, 'regular')
  );
  dotMenuIcon: SafeHtml = this.sanitizer.bypassSecurityTrustHtml(
    this.getIconWithClass(Icons.DotMenuIcon.name, 'regular')
  );

  infoIcon: SafeHtml = this.sanitizer.bypassSecurityTrustHtml(
    this.getIconWithClass(Icons.InfoIcon.name, 'medium black')
  );
  infoIconSmall: SafeHtml = this.sanitizer.bypassSecurityTrustHtml(
    this.getIconWithClass(
      IconsArray.InformationIcon.name,
      'small dark-blue  filled-path',
      true
    )
  );
  refreshIcon: SafeHtml = this.sanitizer.bypassSecurityTrustHtml(
    this.getIconWithClass(Icons.RefreshIcon.name, 'small')
  );
  noUserIconGiga: SafeHtml = this.sanitizer.bypassSecurityTrustHtml(
    this.getIconWithClass(IconsArray.NoUserIcon.name, 'gigantic none', true)
  );
  noUserIcon: SafeHtml = this.sanitizer.bypassSecurityTrustHtml(
    this.getIconWithClass(IconsArray.NoUserIcon.name, 'xxlarge none', true)
  );

  usersResponse: UserDetailsDto[];
  roleType = RoleType;

  datePipe = new DatePipe(this.sharedService.language);

  constructor(
    protected usersService: UsersService,
    protected sharedService: SharedService,
    protected notificationService: NotificationService,
    protected translateService: TranslateService,
    protected router: Router,
    protected config: DynamicDialogConfig,
    protected dialogService: DialogService,
    protected dialogRef: DynamicDialogRef,
    private cd: ChangeDetectorRef,
    protected sanitizer: DomSanitizer
  ) {
    super(translateService);
  }

  ngAfterViewInit(): void {
    if (!this.isChild) {
      this.breadcrumbMenuItems = [
        { label: this.getTranslate('SURGE'), routerLink: '/dashboard' },
        {
          label: this.getDecodedUserToken()?.extension_Directory?.name,
          routerLink: '/dashboard'
        },
        { label: this.getTranslate('PAGES.USERS.TITLE'), routerLink: '/users' }
      ];

      this.sharedService.changedBreadcrumbData(this.breadcrumbMenuItems);
    }
    super.ngAfterViewInit();
  }

  ngAfterViewChecked() {
    this.cd.detectChanges();
  }

  ngOnInit(): void {
    this.tableConfig.loadLazy = this.loadLazy?.bind(this);
    this.rolesResponse = this.sharedService.getRoles();
    console.log(this.rolesResponse);
    if (this.isChild === undefined) {
      this.getUsers(this.page, this.pageSize);
    }

    this.subscription.add(
      this.searchItem.valueChanges.pipe(debounceTime(500)).subscribe(() => {
        if (
          this.searchItem?.value?.length >= 3 ||
          this.searchItem?.value?.length === 0 ||
          this.searchItem?.value === null
        ) {
          this.getUsers(this.page, this.pageSize);
        }
      })
    );
  }

  getUsers(page: number, size: number) {
    this.loading = true;
    let roleId = null;

    roleId = this.sharedService
      .getRoles()
      .find(t => t.name.toUpperCase() === RoleType.Member.toUpperCase())?.id;

    this.subscription.add(
      this.usersService
        .usersGet(
          page,
          size,
          this.directoryId,
          this.workspace?.id,
          roleId,
          this.searchItem.value,
          this.filter
        )
        .subscribe({
          next: v => {
            this.usersResponse = [];
            this.usersResponse = v.items;
            this.totalItemCount = v.totalCount;
            this.tableConfig.totalItemCount = v.totalCount;

            this.checkSearchActive(this.searchItem.value);
            this.generateDataTable();
          },
          error: e => {
            this.notificationService.showErrorToast(this.handleError(e));
            this.loading = false;
          },
          complete: () => {}
        })
    );
  }

  generateDataTable() {
    this.tableConfig.showBaseInfo = this.showBaseInfo ? true : false;

    this.tableColumns = [
      {
        field: '',
        header: this.getTranslate('PAGES.USERS.USER'),
        visible: true,
        templateComponent: CardWithAvatarComponent,
        templateConfig: {
          routePath: '/users/{{id}}',
          showAvatar: true
        },
        templateInputs: {
          title: '{{firstName}} {{lastName}}',
          subtitleFirst: item => {
            return this.showBaseInfo
              ? null
              : this.datePipe.transform(
                  item?.createdDate,
                  'dd MMM y',
                  this.sharedService.language
                );
          }
        }
      },
      {
        field: 'emailAddress',
        header: this.getTranslate('COMMON.EMAIL'),
        visible: true,
        templateComponent: CardWithAvatarComponent,
        templateInputs: {
          title: item => item?.email || '-'
        }
      },
      {
        field: 'mobilePhone',
        header: this.getTranslate('COMMON.PHONE-NUMBER'),
        visible: true,
        templateComponent: CardWithAvatarComponent,
        templateInputs: {
          title: item => item?.mobilePhone || '-'
        }
      },
      {
        field: null,
        header: null,
        visible: true,
        templateComponent: DynamicMenuComponent,
        templateConfig: {
          dynamicMenuItems: item => {
            return this.generateMenuItems(item);
          }
        }
      }
    ];

    this.loading = false;
  }

  resetFilter() {
    this.loading = true;
    this.filter = {};
    this.selectedFilter = null;
    this.searchItem.setValue(null);
  }

  loadLazy(e: LazyLoadEvent) {
    this.sort_by = e.sortField ? e.sortField : 'firstName';
    this.order_by = e.sortOrder === 1 ? OrderBy.Asc : OrderBy.Desc;
    var currentPage = e.first / this.pageSize + 1;

    if ((this.workspace || !this.workspace) && currentPage !== this.page) {
      this.page = currentPage;
      this.getUsers(this.page, e.rows);
    }
  }

  changeFilter() {
    this.first = 0;
  }

  generateMenuItems(item: any): MenuItem[] {
    const menuItems: MenuItem[] = [];

    menuItems.push({
      label: this.getTranslate('PAGES.USERS.VIEW-USER'),
      styleClass: 'blue',
      command: () => {
        this.router.navigate(['/users', item?.id]);
      }
    });

    return menuItems;
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
