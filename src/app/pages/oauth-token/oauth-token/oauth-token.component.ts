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
import { Policy } from '../../../@core/models/policy';
import { NgIf } from '@angular/common';
import { SharedService } from '../../../@core/services/shared.service';
import { MsalService } from '@azure/msal-angular';
import { Subject, catchError, switchMap } from 'rxjs';
import { UsersService } from '../../../../../api';
import { NotificationService } from '../../../@core/services/notification.service';
import { LoaderComponent } from '../../../@core/components/loader/loader.component';

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
    private userService: UsersService,
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
      this.sharedService.toggleSidebarVisible();
    }
  }

  ngAfterViewChecked() {
    this.cd.detectChanges();
  }

  async ngOnInit() {
    await this.subscription.add(
      this.msalService.handleRedirectObservable().subscribe({
        next: response => {
          if (response !== null && response.account !== null) {
            this.sharedService.setUserToken(response?.accessToken);
            this.msalService.instance.setActiveAccount(response.account);
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

          this.getUserRoles();
        },
        error: e => {
          this.notificationService.showErrorToast(this.handleError(e));
          this.loading = false;
        },
        complete: () => {}
      })
    );
  }

  getUserRoles() {
    this.loading = true;
    this.subscription.add(
      this.userService
        .usersIdRolesGet(this.getDecodedUserToken()?.oid)
        .subscribe({
          next: v => {
            this.sharedService.setUserRolesData(v);

            this.sharedService.setRoles();

            this.subscription.add(
              this.sharedService
                .setCountries()
                .pipe(
                  switchMap(x => {
                    return this.sharedService.setCurrencies();
                  }),
                  switchMap(() => {
                    return this.sharedService.setRoles();
                  }),
                  catchError(err => {
                    this.notificationService.showErrorToast(
                      this.handleError(err)
                    );
                    throw err;
                  })
                )
                .subscribe({
                  next: t => {
                    this.getUserPolicies();
                  },
                  error: e => {
                    this.notificationService.showErrorToast(
                      this.handleError(e)
                    );
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

  getUserPolicies() {
    this.loading = true;
    this.subscription.add(
      this.userService
        .usersPoliciesGet(
          this.getDecodedUserToken()?.oid,
          this.getDecodedUserToken()?.extension_DirectoryId
        )
        .subscribe({
          next: v => {
            // TODO:
            let userPoliciesData = v;
            let index = userPoliciesData.indexOf(Policy.UserRead);
            if (index > -1) {
              userPoliciesData.splice(index, 1);
            }
            this.sharedService.setUserPoliciesData(userPoliciesData);
          },
          error: e => {
            this.notificationService.showErrorToast(this.handleError(e));
            this.loading = false;
          },
          complete: () => {
            this.router.navigate(['/dashboard']);
            this.loading = false;
          }
        })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this._destroying$.next(undefined);
    this._destroying$.complete();
  }
}
