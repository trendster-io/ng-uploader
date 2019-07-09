import { HttpEventType } from '@angular/common/http';

import { of } from 'rxjs';

import { Uploader } from './uploader.class';
import { UploaderOptions } from './models';

describe('Uploader', () => {
  let httpClientStub;
  let uploader: Uploader;
  let uploaderOptions: UploaderOptions;
  let file: File;

  beforeEach(() => {
    httpClientStub = jasmine.createSpyObj('HttpClient', {
      request: of({ type: HttpEventType.Sent })
    });
    uploaderOptions = {
      url: 'http://localhost:3000',
      method: 'POST'
    };
    file = new File(['testdata'], 'testfile.png', { type: 'application/pdf' });
  });

  it('should be created', () => {
    uploader = new Uploader(httpClientStub, uploaderOptions);
    expect(uploader).toBeTruthy();
  });

  it(`should throw an error when adding an item to queue when the uploader has no url or method
  specified and the item does not as well`, () => {
    uploaderOptions = {};
    uploader = new Uploader(httpClientStub, uploaderOptions);
    expect(() => uploader.addItem({ file })).toThrow({
      name: 'RequestParamsMissing',
      message:
        'You have not supplied a general url or method to the uploader and also didn\'t provide them in your item.'
    });
  });

  it('should throw an error when adding an item with a non allowed file type to queue', () => {
    uploaderOptions.allowedMimeTypes = ['image/png'];
    uploader = new Uploader(httpClientStub, uploaderOptions);
    expect(() => uploader.addItem({ file })).toThrow({
      name: 'NotAllowedFileType',
      message: 'The file type is not included in the allowedMimeTypes.'
    });
  });

  it('should throw an error when adding an item with a file bigger than the maxFileSize to queue', () => {
    uploaderOptions.maxFileSize = 1;
    uploader = new Uploader(httpClientStub, uploaderOptions);
    expect(() => uploader.addItem({ file })).toThrow({
      name: 'FileSizeExceeded',
      message: 'The file size exceeded the maximumFileSize.'
    });
  });

  it('should throw an error when adding an item to queue when the queueLimit has been reached', () => {
    uploaderOptions.queueLimit = 1;
    uploader = new Uploader(httpClientStub, uploaderOptions);
    uploader.addItem({ file });
    expect(() => uploader.addItem({ file })).toThrow({
      name: 'QueueLimitReached',
      message:
        'The specified queueLimit was reached, cannot add more items at the moment.'
    });
  });

  it('should add a new UploadItem to the queue, return it but not upload it', () => {
    uploader = new Uploader(httpClientStub, uploaderOptions);
    const item = uploader.addItem({ file });
    expect(item).toBeTruthy();
    expect(item.isReady).toBeFalsy();
    expect(uploader.itemsCount).toBe(1);
  });

  it('should add a new UploadItem to the queue, return it and also upload it when autoUpload is enabled', () => {
    uploaderOptions.autoUpload = true;
    uploader = new Uploader(httpClientStub, uploaderOptions);
    const item = uploader.addItem({ file });
    expect(item.isReady).toBeTruthy();
    expect(uploader.itemsCount).toBe(1);
  });

  it('should assign the uploader\'s url to the UploadItem that has no url passed', () => {
    uploader = new Uploader(httpClientStub, uploaderOptions);
    const item = uploader.addItem({ file });
    expect(item.req.url).toBe(uploaderOptions.url);
  });

  it('should assign the uploader\'s method to the UploadItem that has no method passed', () => {
    uploader = new Uploader(httpClientStub, uploaderOptions);
    const item = uploader.addItem({ file });
    expect(item.req.method).toBe(uploaderOptions.method);
  });

  it('should upload an UploadItem', () => {
    uploader = new Uploader(httpClientStub, uploaderOptions);
    const item = uploader.addItem({ file });
    uploader.uploadItem(item);
    expect(item.isReady).toBeTruthy();
  });

  it('should upload all UploadItems', () => {
    uploader = new Uploader(httpClientStub, uploaderOptions);
    const item1 = uploader.addItem({ file });
    const item2 = uploader.addItem({ file });
    uploader.uploadAll();
    expect(item1.isReady).toBeTruthy();
    expect(item2.isReady).toBeTruthy();
  });

  it('should cancel uploading an UploadItem', () => {
    uploader = new Uploader(httpClientStub, uploaderOptions);
    const item = uploader.addItem({ file });
    uploader.uploadItem(item);
    uploader.cancelItem(item);
    expect(item.isReady).toBeFalsy();
    expect(item.isCancelled).toBeTruthy();
  });

  it('should cancel all uploading UploadItems', () => {
    uploader = new Uploader(httpClientStub, uploaderOptions);
    const item1 = uploader.addItem({ file });
    const item2 = uploader.addItem({ file });
    const item3 = uploader.addItem({ file });
    uploader.uploadItem(item1);
    uploader.uploadItem(item2);
    uploader.cancelAll();
    expect(item1.isReady).toBeFalsy();
    expect(item1.isCancelled).toBeTruthy();
    expect(item2.isReady).toBeFalsy();
    expect(item2.isCancelled).toBeTruthy();
    expect(item3.isCancelled).toBeFalsy();
  });

  it('should remove an UploadItem from the queue and cancel it if its uploading', () => {
    uploader = new Uploader(httpClientStub, uploaderOptions);
    spyOn(uploader, 'cancelItem');
    const item = uploader.addItem({ file });
    expect(item).toBeTruthy();
    uploader.uploadItem(item);
    uploader.removeItem(item);
    expect(uploader.cancelItem).toHaveBeenCalled();
    expect(uploader.itemsCount).toBe(0);
  });

  it('should remove all UploadItems from queue and reset totalProgress', () => {
    uploader = new Uploader(httpClientStub, uploaderOptions);
    const item1 = uploader.addItem({ file });
    const item2 = uploader.addItem({ file });
    const item3 = uploader.addItem({ file });
    uploader.uploadAll();
    uploader.clearQueue();
    expect(uploader.itemsCount).toBe(0);
    expect(uploader.totalProgress).toBe(0);
  });
});
