import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Router,
  RouterStateSnapshot,
  UrlTree
} from '@angular/router';
import { MsalService } from '@azure/msal-angular';
import { Observable } from 'rxjs';
import { Keys } from '../constants/keys';

@Injectable({
  providedIn: 'root'
})
export class MsalGuard {
  constructor(private msalService: MsalService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    const userData = localStorage.getItem(Keys.USER_DATA);

    const isLoggedIn = this.msalService.instance.getActiveAccount() != null;

    if (!isLoggedIn && userData == null) {
      this.router.navigate(['/oauth-token']);
      return false;
    }

    this.router.navigate(['/dashboard']);
    return false;
  }
}
