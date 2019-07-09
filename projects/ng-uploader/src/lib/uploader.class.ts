import {
  HttpErrorResponse,
  HttpClient,
  HttpRequest,
  HttpEventType
} from '@angular/common/http';

import { Subject, Observable, of } from 'rxjs';
import {
  mergeMap,
  tap,
  filter,
  map,
  catchError,
  finalize
} from 'rxjs/operators';

import { UploadItem } from './upload-item.class';

import {
  UploadListener,
  UploaderOptions,
  UploadItemOptions,
  UploadItemEvent,
  UploadQueueItem
} from './models';

export class Uploader implements UploadListener {
  readonly onItemSuccess: Observable<UploadItemEvent>;
  readonly onItemProgress: Observable<UploadItemEvent>;
  readonly onItemError: Observable<UploadItemEvent>;
  private onItemSuccessSubject: Subject<UploadItemEvent>;
  private onItemProgressSubject: Subject<UploadItemEvent>;
  private onItemErrorSubject: Subject<UploadItemEvent>;
  private _totalProgress: number;
  private url: string;
  private method: 'POST' | 'PUT' | 'PATCH';
  private autoUpload: boolean;
  private removeAfterUpload: boolean;
  private queueLimit: number;
  private concurrency: number;
  private maxFileSize: number;
  private allowedMimeTypes: string[];
  private queue: UploadQueueItem[];
  private scheduler: Subject<UploadQueueItem>;

  constructor(private httpClient: HttpClient, options: UploaderOptions = {}) {
    this.onItemSuccessSubject = new Subject();
    this.onItemProgressSubject = new Subject();
    this.onItemErrorSubject = new Subject();
    this.onItemSuccess = this.onItemSuccessSubject.asObservable();
    this.onItemProgress = this.onItemProgressSubject.asObservable();
    this.onItemError = this.onItemErrorSubject.asObservable();
    this._totalProgress = 0;
    this.url = options.url;
    this.method = options.method;
    this.autoUpload = options.autoUpload;
    this.removeAfterUpload = options.removeAfterUpload;
    this.queueLimit = options.queueLimit;
    this.concurrency = options.concurrency || 1;
    this.maxFileSize = options.maxFileSize;
    this.allowedMimeTypes = options.allowedMimeTypes;
    this.setupQueue();
  }

  get itemsCount(): number {
    return this.queue.length;
  }

  get items(): UploadItem[] {
    return this.queue.map(queueItem => queueItem.item);
  }

  get readyItemsCount(): number {
    return this.queue
      .map(queueItem => queueItem.item)
      .filter(item => item.isReady && !item.isUploading).length;
  }

  private get readyItems(): UploadItem[] {
    return this.queue
      .map(queueItem => queueItem.item)
      .filter(item => item.isReady && !item.isUploading);
  }

  get uploadingItemsCount(): number {
    return this.queue
      .map(queueItem => queueItem.item)
      .filter(item => item.isUploading).length;
  }

  private get uploadingItems(): UploadItem[] {
    return this.queue
      .map(queueItem => queueItem.item)
      .filter(item => item.isUploading);
  }

  get uploadedItemsCount(): number {
    return this.queue
      .map(queueItem => queueItem.item)
      .filter(item => item.isUploaded).length;
  }

  private get uploadedItems(): UploadItem[] {
    return this.queue
      .map(queueItem => queueItem.item)
      .filter(item => item.isUploaded);
  }

  get notUploadedItemsCount(): number {
    return this.queue
      .map(queueItem => queueItem.item)
      .filter(item => !item.isUploaded).length;
  }

  private get notUploadedItems(): UploadItem[] {
    return this.queue
      .map(queueItem => queueItem.item)
      .filter(item => !item.isUploaded);
  }

  get cancelledItemsCount(): number {
    return this.queue
      .map(queueItem => queueItem.item)
      .filter(item => item.isCancelled).length;
  }

  private get cancelledItems(): UploadItem[] {
    return this.queue
      .map(queueItem => queueItem.item)
      .filter(item => item.isCancelled);
  }

  get errorItemsCount(): number {
    return this.queue
      .map(queueItem => queueItem.item)
      .filter(item => item.isError).length;
  }

  private get errorItems(): UploadItem[] {
    return this.queue
      .map(queueItem => queueItem.item)
      .filter(item => item.isError);
  }

  get totalProgress(): number {
    return this._totalProgress;
  }

  get isUploading(): boolean {
    return this.uploadingItemsCount > 0;
  }

  private onQueueItemSuccess({ item, res }: UploadItemEvent): void {
    item.onUploadSuccess(res);
    this.onItemSuccessSubject.next({ item, res });
    if (this.removeAfterUpload) {
      item.remove();
    }
  }

  private onQueueItemError({ item, err }: UploadItemEvent): void {
    item.onUploadError(err);
    this.onItemErrorSubject.next({ item, err });
  }

  private request(req: HttpRequest<FormData>): Observable<any> {
    return this.httpClient.request(req).pipe(
      filter(
        event =>
          event.type === HttpEventType.Sent ||
          event.type === HttpEventType.UploadProgress ||
          event.type === HttpEventType.Response
      ),
      map(event => {
        switch (event.type) {
          case HttpEventType.Sent:
            return { type: 'start', value: null };
          case HttpEventType.UploadProgress:
            const progress = Math.round((100 * event.loaded) / event.total);
            return { type: 'progress', value: progress };
          case HttpEventType.Response:
            return { type: 'response', value: event.body };
        }
      })
    );
  }

  private calculateTotalProgress(): void {
    const value =
      this.uploadingItems.reduce((acc, item) => item.progress + acc, 0) /
      (this.uploadingItemsCount || 1);
    if (this.removeAfterUpload) {
      this._totalProgress = value;
    } else {
      const ratio = 100 / this.itemsCount;
      const current = (value * ratio) / 100;
      this._totalProgress = Math.round(
        this.uploadedItemsCount * ratio + current
      );
    }
  }

  private prepareQueueItem(queueItem: UploadQueueItem): Observable<any> {
    return new Observable(observer => {
      queueItem.subscription = this.request(queueItem.item.req)
        .pipe(
          finalize(() => {
            if (!observer.closed) {
              observer.complete();
            }
          }),
          tap(event => {
            switch (event.type) {
              case 'start':
                queueItem.item.onUploadStart();
                break;
              case 'progress':
                const progress = event.value;
                const item = queueItem.item;
                item.onUploadProgress(progress);
                this.onItemProgressSubject.next({ item, progress });
                this.calculateTotalProgress();
                break;
              default:
                break;
            }
          }),
          filter(event => event.type === 'response'),
          map(event => event.value)
        )
        .subscribe({
          next: res => {
            queueItem.subscription = null;
            observer.next({ item: queueItem.item, res });
            observer.complete();
          },
          error: (err: HttpErrorResponse) => {
            queueItem.subscription = null;
            observer.error({ item: queueItem.item, err });
          },
          complete: () => observer.complete()
        });
    });
  }

  private setupQueue(): void {
    this.queue = [];
    this.scheduler = new Subject();
    this.scheduler
      .pipe(
        mergeMap(
          queueItem =>
            this.prepareQueueItem(queueItem).pipe(
              catchError((uploadEvent: UploadItemEvent) => {
                this.onQueueItemError(uploadEvent);
                return of(null);
              })
            ),
          this.concurrency
        ),
        filter((uploadEvent: UploadItemEvent) => Boolean(uploadEvent))
      )
      .subscribe(uploadEvent => this.onQueueItemSuccess(uploadEvent));
  }

  private isValidRequestParams({ url, method }: UploadItemOptions): boolean {
    return Boolean(url || this.url) && Boolean(method || this.method);
  }

  private isValidFileType(file: File): boolean {
    return this.allowedMimeTypes && this.allowedMimeTypes.length
      ? this.allowedMimeTypes.includes(file.type)
      : true;
  }

  private isValidFileSize(file: File): boolean {
    return this.maxFileSize ? file.size <= this.maxFileSize : true;
  }

  private isValidFile(file: File): boolean {
    return this.isValidFileType(file) && this.isValidFileSize(file);
  }

  private canAddToQueue(): boolean {
    return this.queueLimit ? this.itemsCount < this.queueLimit : true;
  }

  private checkItem(options: UploadItemOptions): void {
    if (!this.isValidRequestParams(options)) {
      throw {
        name: 'RequestParamsMissing',
        message:
          'You have not supplied a general url or method to the uploader and also didn\'t provide them in your item.'
      };
    }
    if (!this.isValidFileType(options.file)) {
      throw {
        name: 'NotAllowedFileType',
        message: 'The file type is not included in the allowedMimeTypes.'
      };
    }
    if (!this.isValidFileSize(options.file)) {
      throw {
        name: 'FileSizeExceeded',
        message: 'The file size exceeded the maximumFileSize.'
      };
    }
    if (!this.canAddToQueue()) {
      throw {
        name: 'QueueLimitReached',
        message:
          'The specified queueLimit was reached, cannot add more items at the moment.'
      };
    }
  }

  addItem(options: UploadItemOptions): UploadItem {
    this.checkItem(options);
    Object.assign(options, {
      url: options.url || this.url,
      method: options.method || this.method
    });
    const item = new UploadItem(this, options);
    this.queue.push({ item, subscription: null });
    this.calculateTotalProgress();
    if (this.autoUpload) {
      item.upload();
    }
    return item;
  }

  uploadItem(item: UploadItem): void {
    const queueItem = this.queue.find(
      current =>
        current.item === item &&
        !(
          current.item.isReady ||
          current.item.isUploading ||
          current.item.isUploaded
        )
    );
    if (queueItem) {
      item.onBeforeUpload();
      this.scheduler.next(queueItem);
    }
  }

  uploadAll(): void {
    this.items
      .filter(item => !(item.isReady || item.isUploading || item.isUploaded))
      .forEach(item => item.upload());
  }

  cancelItem(item: UploadItem): void {
    const queueItem = this.queue.find(
      current => current.item === item && item.isReady
    );
    if (queueItem) {
      if (queueItem.subscription) {
        queueItem.subscription.unsubscribe();
        queueItem.subscription = null;
      }
      queueItem.item.onUploadCancelled();
      this.calculateTotalProgress();
    }
  }

  cancelAll(): void {
    this.notUploadedItems.forEach(item => item.cancel());
  }

  removeItem(item: UploadItem): void {
    if (item.isUploading) {
      item.cancel();
    }
    item.cleanup();
    this.queue = this.queue.filter(current => current.item !== item);
    this.calculateTotalProgress();
  }

  clearQueue(): void {
    while (this.itemsCount) {
      this.queue[0].item.remove();
    }
    this._totalProgress = 0;
  }
}
