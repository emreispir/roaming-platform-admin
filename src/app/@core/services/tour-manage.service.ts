import { Injectable } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { TourService } from 'ngx-ui-tour-ngx-bootstrap';
import { INgxbStepOption } from 'ngx-ui-tour-ngx-bootstrap/lib/step-option.interface';
import { BehaviorSubject, Observable, Subject, of } from 'rxjs';
import { filter, takeUntil, switchMap, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class TourManagementService {
  private tourStepsSubject = new BehaviorSubject<INgxbStepOption[]>([]);
  public tourSteps$ = this.tourStepsSubject.asObservable();

  public readonly TourStatus = {
    INACTIVE: 'INACTIVE',
    ACTIVE: 'ACTIVE',
    ENDED_SAME_COMPONENT: 'ENDED_SAME_COMPONENT',
    ENDED_DIFFERENT_COMPONENT: 'ENDED_DIFFERENT_COMPONENT',
  };

  private tourStatus = this.TourStatus.INACTIVE;
  private destroy$ = new Subject<void>();
  private startingComponent: any = null;

  constructor(
    private tour: TourService,
    private router: Router,
    public activatedRoute: ActivatedRoute
  ) {
    this.listenToRouteChanges();
  }

  private getCurrentComponentInstance(): any {
    let route = this.activatedRoute.root;
    while (route.firstChild) {
      route = route.firstChild;
    }
    return route.component;
  }

  startTour(): Observable<string> {
    this.tourStatus = this.TourStatus.ACTIVE;
    this.startingComponent = this.getCurrentComponentInstance();

    return this.tourSteps$.pipe(
      takeUntil(this.destroy$),
      switchMap((tourSteps) => {
        if (
          tourSteps &&
          tourSteps.length > 0 &&
          this.tourStatus === this.TourStatus.ACTIVE
        ) {
          this.tour.initialize(tourSteps, {
            enableBackdrop: true,
            disableScrollToAnchor: false,
            delayBeforeStepShow: 40,
          });
          this.tour.start();
          return this.tour.events$;
        } else {
          return of({ name: 'end' });
        }
      }),
      filter((event) => event.name === 'end'),
      switchMap(() => {
        const endingComponent = this.getCurrentComponentInstance();
        this.tourStatus =
          this.startingComponent === endingComponent
            ? this.TourStatus.ENDED_SAME_COMPONENT
            : this.TourStatus.ENDED_DIFFERENT_COMPONENT;
        return of(this.tourStatus);
      }),
      catchError((error) => {
        console.error('Error during tour:', error);
        return of(this.TourStatus.INACTIVE);
      })
    );
  }

  setTourSteps(steps: INgxbStepOption[], clearCurrentSteps: boolean = false) {
    if (this.tourStatus !== this.TourStatus.ACTIVE) {
      if (clearCurrentSteps) {
        this.tourStepsSubject.next([]);
      } else if (steps && steps.length > 0) {
        this.tourStepsSubject.next(steps);
      }
    }
  }

  private listenToRouteChanges(): void {
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.tourStatus = this.TourStatus.INACTIVE;
      });
  }
}
