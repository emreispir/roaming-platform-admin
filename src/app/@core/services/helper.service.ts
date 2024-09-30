import { Injectable } from '@angular/core';
import { BaseService } from './base.service';

@Injectable()
export class HelperService extends BaseService {
  map<T>(resource, target: T): T {
    Object.keys(target).forEach(key => (target[key] = resource[key]));
    return target;
  }

  downloadFile(url: string, filename: string) {
    this.get(url, true).subscribe(data => {
      const blobUrl = window.URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(blobUrl);
    });
  }
}
