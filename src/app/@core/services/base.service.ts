import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Keys } from '../constants/keys';

@Injectable()
export class BaseService {
  constructor(public http: HttpClient) {}

  createAuthorizationHeader(
    headers: HttpHeaders,
    customHeaderOption: { key; value }
  ): HttpHeaders {
    const userData = localStorage.getItem(Keys.USER_DATA)
      ? JSON.parse(localStorage.getItem(Keys.USER_DATA))
      : null;

    const language = localStorage.getItem(Keys.LANGUAGE)
      ? localStorage.getItem(Keys.LANGUAGE)
      : null;

    const token = localStorage.getItem(Keys.USER_TOKEN);

    if (token != null) {
      headers = headers.append('Authorization', 'Bearer ' + token);
    }

    if (userData != null) {
      headers.append('Userid', userData?.id);
    }

    headers = headers.append('Content-Type', 'application/json');
    headers = headers.append('Accept-Language', language);

    if (customHeaderOption) {
      headers = headers.append(
        customHeaderOption?.key,
        customHeaderOption?.value
      );
    }

    return headers;
  }

  post<T>(
    url: string,
    data: string = null,
    customHeaderOption: { key; value }
  ): Observable<any> {
    let headers = new HttpHeaders();
    headers = this.createAuthorizationHeader(headers, customHeaderOption);

    return this.http
      .post<T>(url, data, { headers: headers })
      .pipe(catchError(this.handleError));
  }

  get<T>(url: string, isDocument?: boolean): Observable<any> {
    let headers = new HttpHeaders();
    if (isDocument) {
      return this.http
        .get(url, { headers: headers, responseType: 'blob' })
        .pipe(catchError(this.handleError));
    }

    return this.http
      .get<T>(url, { headers: headers })
      .pipe(catchError(this.handleError));
  }

  handleError(response: any) {
    const errorBody = response?.error;
    let objectError = '';

    if (response.status === 403) {
      objectError = 'UNAUTHORIZED';
    } else if (response.status === 400) {
      if (errorBody.errors) {
        Object.getOwnPropertyNames(errorBody.errors).forEach((x) => {
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

  public createUrlWithParams(
    apiUrl: string,
    urlPath: string,
    json: Object = null
  ): string {
    for (const key in json) {
      if (json.hasOwnProperty(key)) {
        if (json[key] instanceof Array) {
          let str = '';
          for (const item of json[key]) {
            str += key + '=' + item + '&';
          }
          str = str.substring(0, str.length - 1);
          urlPath = urlPath.replace(`${key}=`, '');
          urlPath = urlPath.replace(`{${key}}`, json[key] == null ? '' : str);
        } else {
          urlPath = urlPath.replace(
            `{${key}}`,
            json[key] == null ? '' : json[key]
          );
        }
      }
    }
    return apiUrl + urlPath;
  }
}
