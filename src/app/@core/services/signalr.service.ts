import { Injectable, OnDestroy } from '@angular/core';
import {
  Subject,
  Observable,
  switchMap,
  from,
  catchError,
  of,
  mapTo,
} from 'rxjs';
import { environment } from '../../../environments/environment';
import { Keys } from '../constants/keys';
import { BaseService } from './base.service';
import { UserDetailsDto } from '../../../../api';
import * as signalR from '@microsoft/signalr';

@Injectable({
  providedIn: 'root',
})
export class SignalRService implements OnDestroy {
  public connectionExists: boolean = false;
  private hubConnection: signalR.HubConnection;
  private connectorHubSubject$: Subject<any> = new Subject<any>();
  public connectorHub: Observable<any>;
  private chargeSessionHubSubject$: Subject<any> = new Subject<any>();
  public chargeSessionHub: Observable<any>;
  private transactionCreatedHubSubject$: Subject<any> = new Subject<any>();
  public transactionCreatedHub: Observable<any>;

  constructor(protected client: BaseService) {
    this.connectorHub = this.connectorHubSubject$.asObservable();
    this.chargeSessionHub = this.chargeSessionHubSubject$.asObservable();
    this.transactionCreatedHub = this.transactionCreatedHubSubject$.asObservable();
  }

  public isConnected(): boolean {
    return (
      this.connectionExists &&
      this.hubConnection?.state === signalR.HubConnectionState.Connected
    );
  }

  connectHub(): Observable<boolean> {
    let userData: UserDetailsDto | null = localStorage.getItem(Keys.USER_DATA)
      ? JSON.parse(localStorage.getItem(Keys.USER_DATA))
      : null;

    if (!userData) {
      this.stopConnection();
      throw new Error('No user data');
    }

    const fullPath = `${environment.signalr_url}?userId=${userData?.id}`;
    return this.client
      .post<SignaleInfoResponse>(fullPath, null, {
        key: 'userid',
        value: userData?.id,
      })
      .pipe(
        switchMap((v) => {
          return from(this.startConnection(v.url, v.accessToken)).pipe(
            mapTo(true), // Connection Success
            catchError((err) => {
              console.error('Error while starting connection:', err);
              return of(false); // Connection Failed
            })
          );
        }),
        catchError((e) => {
          console.error('Failed to receive data:', e);
          return of(false); // Receive Data Failed
        })
      );
  }

  private async startConnection(hubUrl: string, token: string): Promise<void> {
    if (this.isConnected()) {
      await this.stopConnection();
    }

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: () => token,
        withCredentials: true,
      })
      .withAutomaticReconnect()
      .build();

    try {
      await this.hubConnection.start();
      console.log('Connection started');
      this.connectionExists = true;
      this.registerOnServerEvents();
    } catch (err) {
      console.error('Error while starting connection: ' + err);
      this.connectionExists = false;
    }
  }

  public async stopConnection() {
    if (this.hubConnection) {
      this.hubConnection.off(MethodNames.ConnectorStatus);
      this.hubConnection.off(MethodNames.ChargeSession);
      this.hubConnection.off(MethodNames.TransactionCreated);

      await this.hubConnection.stop();
      console.log('Connection stopped');
      this.connectionExists = false;
    }
  }

  private registerOnServerEvents() {
    this.hubConnection.on(MethodNames.ConnectorStatus, (data: any) => {
      this.connectorHubSubject$.next(data);
    });

    this.hubConnection.on(MethodNames.ChargeSession, (data: any) => {
      this.chargeSessionHubSubject$.next(data);
    });

    this.hubConnection.on(MethodNames.TransactionCreated, (data: any) => {
      this.transactionCreatedHubSubject$.next(data);
    });
  }

  invokeData(methodName: string, ...params: any[]): Observable<any> {
    if (!this.isConnected()) {
      return this.connectHub().pipe(
        switchMap((connected) => {
          if (connected) {
            return this.invokeHubMethod(methodName, ...params);
          } else {
            return of(null);
          }
        }),
        catchError((err) => {
          // console.error('Error in connection or method invocation:', err);
          return of(null);
        })
      );
    } else {
      return this.invokeHubMethod(methodName, ...params);
    }
  }

  private invokeHubMethod(
    methodName: string,
    ...params: any[]
  ): Observable<any> {
    return from(this.hubConnection.invoke(methodName, ...params)).pipe(
      catchError((err) => {
        console.error('Error while invoking:', err);
        return of(null); // Return an Observable of null in case of error
      })
    );
  }

  ngOnDestroy() {
    this.connectorHubSubject$.complete();
    this.chargeSessionHubSubject$.complete();
    this.transactionCreatedHubSubject$.complete();
  }
}

export const MethodNames = {
  ConnectorStatus: 'connectorStatusChanged',
  ChargeSession: 'chargeSessionStarted',
  TransactionCreated: 'transactionCreated',
};

export interface SignaleInfoResponse {
  url: string;
  accessToken: string;
}
