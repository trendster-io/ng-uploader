import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Uploader } from './uploader.class';

import { UploaderOptions } from './models';

@Injectable({
  providedIn: 'root'
})
export class UploaderService {
  constructor(private httpClient: HttpClient) {}

  getUploader(options: UploaderOptions): Uploader {
    return new Uploader(this.httpClient, options);
  }
}
