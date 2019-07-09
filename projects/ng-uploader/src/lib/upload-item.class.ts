import { HttpErrorResponse, HttpRequest } from '@angular/common/http';

import { Observable, Subject } from 'rxjs';

import { UploadListener, UploadItemOptions } from './models';

export class UploadItem {
  readonly preview: Observable<string>;
  readonly onResponse: Observable<any>;
  readonly onProgress: Observable<number>;
  readonly onError: Observable<HttpErrorResponse>;
  private onResponseSubject: Subject<any>;
  private onProgressSubject: Subject<number>;
  private onErrorSubject: Subject<HttpErrorResponse>;
  private _req: HttpRequest<FormData>;
  private _progress: number;
  private url: string;
  private method: 'POST' | 'PUT' | 'PATCH';
  private file: File;
  private fileAlias: string;
  private additionalParams: { [key: string]: any };
  private ready: boolean;
  private uploading: boolean;
  private uploaded: boolean;
  private cancelled: boolean;
  private error: boolean;

  constructor(private listener: UploadListener, options: UploadItemOptions) {
    this.onResponseSubject = new Subject();
    this.onProgressSubject = new Subject();
    this.onErrorSubject = new Subject();
    this.onResponse = this.onResponseSubject.asObservable();
    this.onProgress = this.onProgressSubject.asObservable();
    this.onError = this.onErrorSubject.asObservable();
    this._progress = 0;
    this.url = options.url;
    this.method = options.method;
    this.file = options.file;
    this.fileAlias = options.fileAlias || 'file';
    this.additionalParams = options.additionalParams;
    this._req = this.buildRequest();
    const fileCategory = this.file.type.split('/')[0];
    if (fileCategory === 'image' || fileCategory === 'video') {
      this.preview = this.readMediaFile();
    }
  }

  get req(): HttpRequest<FormData> {
    return this._req;
  }

  get progress(): number {
    return this._progress;
  }

  get fileName(): string {
    return this.file.name;
  }

  get isReady(): boolean {
    return this.ready;
  }

  get isUploading(): boolean {
    return this.uploading;
  }

  get isUploaded(): boolean {
    return this.uploaded;
  }

  get isCancelled(): boolean {
    return this.cancelled;
  }

  get isError(): boolean {
    return this.error;
  }

  private buildFormData(): FormData {
    const formData = new FormData();
    if (this.additionalParams) {
      Object.entries(this.additionalParams).forEach(([key, value]) =>
        formData.set(key, value)
      );
    }
    formData.set(this.fileAlias, this.file, this.file.name);
    return formData;
  }

  private buildRequest(): HttpRequest<FormData> {
    const body = this.buildFormData();
    return new HttpRequest(this.method, this.url, body, {
      reportProgress: true
    });
  }

  private readMediaFile(): Observable<string> {
    return new Observable(observer => {
      const reader = new FileReader();
      reader.onload = () => {
        observer.next(reader.result as string);
        observer.complete();
      };
      reader.onerror = () => {
        reader.abort();
        observer.error(reader.error);
      };
      reader.readAsDataURL(this.file);
    });
  }

  cleanup(): void {
    this.onResponseSubject.complete();
    this.onProgressSubject.complete();
    this.onErrorSubject.complete();
  }

  onBeforeUpload(): void {
    this.ready = true;
    this.uploading = false;
    this.uploaded = false;
    this.cancelled = false;
    this.error = false;
    this._progress = 0;
  }

  onUploadStart(): void {
    this.ready = true;
    this.uploading = true;
    this.uploaded = false;
    this.cancelled = false;
    this.error = false;
  }

  onUploadSuccess(res): void {
    this.ready = false;
    this.uploading = false;
    this.uploaded = true;
    this.cancelled = false;
    this.error = false;
    this._progress = 100;
    this.onResponseSubject.next(res);
    this.cleanup();
  }

  onUploadProgress(progress: number): void {
    this._progress = progress;
    this.onProgressSubject.next(this._progress);
  }

  onUploadCancelled(): void {
    this.ready = false;
    this.uploading = false;
    this.uploaded = false;
    this.cancelled = true;
    this.error = false;
    this._progress = 0;
  }

  onUploadError(err: HttpErrorResponse): void {
    this.ready = false;
    this.uploading = false;
    this.uploaded = false;
    this.cancelled = false;
    this.error = true;
    this._progress = 0;
    this.onErrorSubject.next(err);
  }

  upload(additionalParams?: { [key: string]: any }): void {
    if (additionalParams) {
      this.additionalParams = additionalParams;
      this._req = this.buildRequest();
    }
    this.listener.uploadItem(this);
  }

  cancel(): void {
    this.listener.cancelItem(this);
  }

  remove(): void {
    this.listener.removeItem(this);
  }
}
