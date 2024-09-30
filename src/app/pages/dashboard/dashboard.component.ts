import {
  AfterViewChecked,
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy
} from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SharedService } from '../../@core/services/shared.service';
import { NotificationService } from '../../@core/services/notification.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Icons, IconsArray } from '../../../assets/svg/svg-variables';
import {
  ChargePointsService,
  ChargeSessionStatus,
  ReportsService
} from '../../../../api';
import { DecimalPipe, NgIf } from '@angular/common';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { TableModule } from 'primeng/table';
import { RoundPipe } from '../../@theme/pipes';
import { TooltipModule } from 'primeng/tooltip';
import { SignalRService } from '../../@core/services/signalr.service';
import { ScrollableComponent } from '../../@core/components/scrollable/scrollable.component';
import {
  DynamicDialogConfig,
  DialogService,
  DynamicDialogRef
} from 'primeng/dynamicdialog';
import { OverviewStatisticComponent } from '../../@core/components/statistics/overview-statistic/overview-statistic.component';
import { HeaderPanelComponent } from '../../@core/components/header-panel/header-panel.component';
import { InfoPanelComponent } from '../../@core/components/info-panel/info-panel.component';
import { ChargePointConnectorStartComponent } from '../charge-point/charge-point-connector-start/charge-point-connector-start.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  standalone: true,
  imports: [
    NgIf,
    TranslateModule,
    RouterModule,
    DecimalPipe,
    NgxChartsModule,
    TableModule,
    RoundPipe,
    TooltipModule,
    OverviewStatisticComponent,
    HeaderPanelComponent,
    InfoPanelComponent
  ]
})
export class DashboardComponent extends ScrollableComponent
  implements AfterViewChecked, OnDestroy {
  @Input() directoryId: string;

  homeSvg: SafeHtml = this.sanitizer.bypassSecurityTrustHtml(
    this.getIconWithClass(Icons.HomeSvg.name, '')
  );

  sessionIcon: SafeHtml = this.sanitizer.bypassSecurityTrustHtml(
    this.getIconWithClass(Icons.SessionIcon.name, 'regular')
  );
  totalSessionIcon: SafeHtml = this.sanitizer.bypassSecurityTrustHtml(
    this.getIconWithClass(IconsArray.TotalSessionIcon.name, '', true)
  );

  statusTypes = ChargeSessionStatus;

  newsResponse: any[] = [
    {
      title: '🔥 New dashboard design has arrived!',
      description:
        'Discover the sleek new design of our Surge Plug dashboard, enhancing usability and efficiency for all users.',
      link: null
    },
    {
      title: '🔎 Live Diagnostics with OCPP Logs',
      description:
        'Check out our live diagnostics feature with OCPP logs, offering real-time insights into charging station operations.',
      link: null
    },
    {
      title: '🌍 Surge Trip allows users with Roaming with ease!',
      description:
        "Experience Surge Trip's revamped mobile app interface, streamlining your EV charging journey with a modern touch.",
      link: null
    },
    {
      title: '🗞 Explore our latest blog post',
      description:
        "Plugging In Progress: Ensuring Equitable EV Charging Access Across the US,' and join the conversation on making EV infrastructure accessible for all.",
      link:
        'https://medium.com/@leon_72096/plugging-in-progress-ensuring-equitable-ev-charging-access-across-the-us-16483837f08d'
    },
    {
      title: '🗞 Explore our latest blog post',
      description:
        'Pioneering On-Demand EV Charging at SFO with Surge Mobility and Electrun',
      link:
        'https://medium.com/@surge_mobility/pioneering-on-demand-ev-charging-at-sfo-with-surge-mobility-and-electrun-170f5eb3c174'
    }
  ];

  constructor(
    protected signalRService: SignalRService,
    protected chargePointService: ChargePointsService,
    protected reportService: ReportsService,
    public sharedService: SharedService,
    protected notificationService: NotificationService,
    protected translateService: TranslateService,
    protected router: Router,
    public activatedRoute: ActivatedRoute,
    protected sanitizer: DomSanitizer,
    private cd: ChangeDetectorRef,
    protected config: DynamicDialogConfig,
    protected dialogService: DialogService,
    protected dialogRef: DynamicDialogRef
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

    this.breadcrumbMenuItems = [
      { label: this.getTranslate('SURGE'), routerLink: '/dashboard' },
      {
        label: this.getDecodedUserToken()?.extension_Directory?.name,
        routerLink: '/dashboard'
      },
      {
        label: this.getTranslate('PAGES.DASHBOARD.TITLE'),
        routerLink: '/dashboard'
      }
    ];

    this.sharedService.changedBreadcrumbData(this.breadcrumbMenuItems);

    this.components = {
      connectorStart: ChargePointConnectorStartComponent
    };
  }

  startChargeConfirmation(connector: any) {
    this.dialogConfig.data = {
      isChild: true,
      confirmEventCallback: (eventData: any) => {
        this.close();
      },
      cancelEventCallback: (eventData: any) => {
        this.close();
      }
    };

    this.open(this.components.connectorStart);
  }

  onActivate(data): void {
    // console.log('Activate', JSON.parse(JSON.stringify(data)));
  }

  onDeactivate(data): void {
    // console.log('Deactivate', JSON.parse(JSON.stringify(data)));
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
