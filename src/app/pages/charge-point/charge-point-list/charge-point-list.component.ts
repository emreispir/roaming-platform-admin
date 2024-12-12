import {
  AfterViewInit,
  AfterViewChecked,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  OnChanges,
  SimpleChanges,
  OnDestroy
} from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
  DynamicDialogConfig,
  DialogService,
  DynamicDialogRef
} from 'primeng/dynamicdialog';
import { HelperService } from '../../../@core/services/helper.service';
import { NotificationService } from '../../../@core/services/notification.service';
import { SharedService } from '../../../@core/services/shared.service';
import { LazyLoadEvent, MenuItem } from 'primeng/api';
import {
  ChargePointStatus,
  RoamingPointDto
} from '../../../../../api/model/models';
import { RoamingPointsService } from '../../../../../api';
import { SafeHtml, DomSanitizer } from '@angular/platform-browser';
import { Icons, IconsArray } from '../../../../assets/svg/svg-variables';
import { debounceTime } from 'rxjs/internal/operators/debounceTime';
import { ScrollableComponent } from '../../../@core/components/scrollable/scrollable.component';
import { NgClass, NgIf } from '@angular/common';
import {
  CardWithAvatarComponent,
  DynamicElementComponent,
  ElementType,
  DynamicMenuComponent,
  DataTableComponent
} from 'surge-components';
import { LoaderComponent } from '../../../@core/components/loader/loader.component';
import { HeaderPanelComponent } from '../../../@core/components/header-panel/header-panel.component';
import { InfoCardComponent } from '../../../@core/components/info-card/info-card.component';
import { InfoPanelComponent } from '../../../@core/components/info-panel/info-panel.component';
import { MenuModule } from 'primeng/menu';
import { DialogModule } from 'primeng/dialog';

@Component({
  selector: 'app-charge-point-list',
  templateUrl: './charge-point-list.component.html',
  styleUrls: ['./charge-point-list.component.scss'],
  standalone: true,
  imports: [
    TranslateModule,
    RouterModule,
    LoaderComponent,
    HeaderPanelComponent,
    InfoCardComponent,
    InfoPanelComponent,
    NgIf,
    NgClass,
    MenuModule,
    DialogModule,
    DataTableComponent
  ]
})
export class ChargePointListComponent extends ScrollableComponent
  implements AfterViewInit, AfterViewChecked, OnInit, OnChanges, OnDestroy {
  @Input() isChild: boolean;
  @Input() isBox: boolean;
  @Input() showActionbar: boolean;
  @Input() showActionbarTitle: boolean;
  @Input() showActionbarSearch: boolean = true;
  @Input() showActionbarFilter: boolean = true;
  @Input() showActionbarButton: boolean;
  @Input() isPaginated: boolean = true;
  @Input() configNumber: number;

  infoPanelTitle = this.getTranslate(
    'PAGES.CHARGE-POINTS.CREATE-FIRST-CHARGE-POINT-LIST'
  );
  infoPanelDescription = this.getTranslate(
    'PAGES.CHARGE-POINTS.CREATE-FIRST-CHARGE-POINT-LIST-DESCRIPTION'
  );

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
  chargePointIcon: SafeHtml = this.sanitizer.bypassSecurityTrustHtml(
    this.getIconWithClass(Icons.ChargePointIcon.name, 'medium dark-gray')
  );
  infoIconSmall: SafeHtml = this.sanitizer.bypassSecurityTrustHtml(
    this.getIconWithClass(
      IconsArray.InformationIcon.name,
      'small dark-blue filled-path',
      true
    )
  );
  refreshIcon: SafeHtml = this.sanitizer.bypassSecurityTrustHtml(
    this.getIconWithClass(Icons.RefreshIcon.name, 'small')
  );
  noChargePointIcon: SafeHtml = this.sanitizer.bypassSecurityTrustHtml(
    this.getIconWithClass(
      IconsArray.NoChargePointIcon.name,
      'xxlarge none',
      true
    )
  );
  noChargePointIconGiga: SafeHtml = this.sanitizer.bypassSecurityTrustHtml(
    this.getIconWithClass(
      IconsArray.NoChargePointIcon.name,
      'gigantic none',
      true
    )
  );

  chargePointsResponse: RoamingPointDto[];
  statusTypes = ChargePointStatus;

  selectedChargePoint: RoamingPointDto;

  constructor(
    protected chargePointService: RoamingPointsService,
    protected sharedService: SharedService,
    protected helperService: HelperService,
    protected notificationService: NotificationService,
    protected translateService: TranslateService,
    protected router: Router,
    protected config: DynamicDialogConfig,
    protected dialogService: DialogService,
    protected dialogRef: DynamicDialogRef,
    private cd: ChangeDetectorRef,
    public activatedRoute: ActivatedRoute,
    protected sanitizer: DomSanitizer
  ) {
    super(translateService);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.workspaceId && changes.workspaceId.currentValue) {
      this.getChargePoints(this.page, this.pageSize);
    }
  }

  ngAfterViewChecked() {
    this.cd.detectChanges();
  }

  ngAfterViewInit(): void {
    if (!this.isChild) {
      this.breadcrumbMenuItems = [
        { label: this.getTranslate('SURGE'), routerLink: '/dashboard' },
        {
          label: this.getTranslate('PAGES.CHARGE-POINTS.TITLE'),
          routerLink: '/charge-points'
        }
      ];

      this.sharedService.changedBreadcrumbData(this.breadcrumbMenuItems);
    }
    super.ngAfterViewInit();
  }

  ngOnInit(): void {
    this.tableConfig.loadLazy = this.loadLazy?.bind(this);

    if (this.isChild === undefined) {
      this.getChargePoints(this.page, this.pageSize);
    }

    this.subscription.add(
      this.searchItem.valueChanges.pipe(debounceTime(500)).subscribe(() => {
        if (
          this.searchItem?.value?.length >= 3 ||
          this.searchItem?.value?.length === 0 ||
          this.searchItem?.value === null
        ) {
          this.getChargePoints(this.page, this.pageSize);
        }
      })
    );
  }

  getChargePoints(page: number, size: number) {
    this.loading = true;
    this.subscription.add(
      this.chargePointService.roamingPointsGet(page, size).subscribe({
        next: v => {
          this.chargePointsResponse = [];
          this.chargePointsResponse = v.items;
          this.totalItemCount = v.totalCount;
          this.tableConfig.totalItemCount = v.totalCount;

          this.checkSearchActive(this.searchItem.value, this.selectedFilter);

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
    this.tableColumns = [
      {
        field: 'name',
        header: this.getTranslate('PAGES.CHARGE-POINTS.CHARGE-POINT'),
        visible: true,
        templateComponent: CardWithAvatarComponent,
        templateInputs: {
          title: 'name',
          subtitleFirst: 'externalId'
        },
        templateConfig: {
          routePath: '/charge-points/{{id}}',
          showAvatar: true,
          svgElement: this.chargePointIcon
        }
      },
      {
        field: 'operatorName',
        header: this.getTranslate('PAGES.CHARGE-POINTS.OPERATOR-NAME'),
        visible: true,
        templateComponent: CardWithAvatarComponent,
        templateInputs: {
          title: 'operatorName',
          imageUrl: 'imageUrl',
          subtitleFirst: 'externalId'
        }
      },
      {
        field: 'status',
        header: this.getTranslate('COMMON.STATUS'),
        visible: true,
        templateComponent: CardWithAvatarComponent,
        templateInputs: {
          tagValue: item =>
            this.getEnumTypeTranslation(ChargePointStatus, item.status),
          tagClass: item => item.status?.toLowerCase()
        },
        templateConfig: {
          showTag: true,
          backgroundedTag: true
        }
      },
      {
        field: 'chargingLevel',
        header: this.getTranslate('PAGES.CONNECTORS.POWER'),
        visible: true,
        templateComponent: CardWithAvatarComponent,
        templateInputs: {
          title: `{{ chargingLevel }}`,
          subtitleFirst: `{{ currentType }}`
        }
      },
      {
        field: 'isActive',
        header: this.getTranslate('PAGES.CHARGE-POINTS.IS-ACTIVE'),
        visible: true,
        templateComponent: DynamicElementComponent,
        templateInputs: {
          itemValue: 'isActive'
        },
        templateConfig: {
          elementType: ElementType.Checkbox,
          binaryValue: true,
          disabledValue: true
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

  loadLazy(e: LazyLoadEvent) {
    this.sort_by = e.sortField ? e.sortField : 'name';
    var currentPage = e.first / this.pageSize + 1;

    if (currentPage !== this.page) {
      this.page = currentPage;
      this.getChargePoints(this.page, e.rows);
    }
  }

  changeFilter() {
    this.first = 0;
  }

  generateMenuItems(item: RoamingPointDto): MenuItem[] {
    const menuItems: MenuItem[] = [];

    menuItems.push({
      label: this.getTranslate('COMMON.VIEW-DETAILS'),
      routerLink: ['/charge-points', item?.id]
    });

    return menuItems;
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
