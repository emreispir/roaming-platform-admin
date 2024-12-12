import {
  AfterViewChecked,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit
} from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { BaseComponent } from '../../../shared/base.component';
import { NgIf } from '@angular/common';
import { SharedService } from '../../../@core/services/shared.service';
import { MsalService } from '@azure/msal-angular';
import { Subject } from 'rxjs';
import { NotificationService } from '../../../@core/services/notification.service';
import { LoaderComponent } from '../../../@core/components/loader/loader.component';
import { RoamingUsersService } from '../../../../../api';

@Component({
  selector: 'app-oauth-token',
  standalone: true,
  imports: [TranslateModule, RouterModule, LoaderComponent, NgIf],
  templateUrl: './oauth-token.component.html',
  styleUrls: ['./oauth-token.component.scss']
})
export class OauthTokenComponent extends BaseComponent
  implements OnInit, OnDestroy, AfterViewChecked {
  private readonly _destroying$ = new Subject<void>();

  constructor(
    private msalService: MsalService,
    private userService: RoamingUsersService,
    protected notificationService: NotificationService,
    protected router: Router,
    protected translateService: TranslateService,
    protected sharedService: SharedService,
    protected cd: ChangeDetectorRef
  ) {
    super(translateService);

    this.loading = true;

    let activeAccount = this.msalService.instance.getActiveAccount();

    if (activeAccount) {
      this.router.navigate(['/dashboard']);
    }
  }

  ngAfterViewChecked() {
    this.cd.detectChanges();
  }

  async ngOnInit() {
    await this.subscription.add(
      this.msalService.handleRedirectObservable().subscribe({
        next: response => {
          if (response !== null && response?.account !== null) {
            this.sharedService.setUserToken(response?.accessToken);
            this.msalService.instance.setActiveAccount(response?.account);
            this.getDecodedUserToken(response?.accessToken);
            this.getMe();
          } else {
            let activeAccount = this.msalService.instance.getActiveAccount();
            let accounts = this.msalService?.instance?.getAllAccounts();

            if (!activeAccount || accounts.length === 0) {
              this.router.navigate(['home']);
            }
          }
        },
        error: error => {
          this.notificationService.showErrorToast(error.message);
          this.sharedService.logOut();
        }
      })
    );
  }

  getMe() {
    this.loading = true;
    this.subscription.add(
      this.userService.usersIdGet(this.getDecodedUserToken()?.oid).subscribe({
        next: v => {
          this.sharedService.setUserData(v);

          this.subscription.add(
            this.sharedService.setCurrencies().subscribe({
              next: t => {
                this.router.navigate(['/dashboard']);
              },
              error: e => {
                this.notificationService.showErrorToast(this.handleError(e));
              }
            })
          );
        },
        error: e => {
          this.notificationService.showErrorToast(this.handleError(e));
          this.loading = false;
        },
        complete: () => {}
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this._destroying$.next(undefined);
    this._destroying$.complete();
  }
}
