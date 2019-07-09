import { async } from '@angular/core/testing';
import { HttpEventType, HttpRequest } from '@angular/common/http';

import { of } from 'rxjs';

import { Uploader } from './uploader.class';
import { UploadItem } from './upload-item.class';
import { UploadListener, UploadItemOptions } from './models';

describe('UploadItem', () => {
  let httpClientStub;
  let uploadListener: UploadListener;
  let file: File;
  let uploadItemOptions: UploadItemOptions;
  let uploadItem: UploadItem;

  beforeEach(() => {
    httpClientStub = jasmine.createSpyObj('HttpClient', {
      request: of({ type: HttpEventType.Sent })
    });
    uploadListener = new Uploader(httpClientStub, {
      url: 'http://localhost:3000',
      method: 'POST'
    });
    file = new File(['testdata'], 'testfile.png', { type: 'image/png' });
    uploadItemOptions = {
      file,
      fileAlias: 'file',
      additionalParams: { name: 'JavaScript' }
    };
    uploadItem = uploadListener.addItem(uploadItemOptions);
  });

  it('should be created', () => {
    expect(uploadItem).toBeTruthy();
  });

  it('should build the FormData request body', () => {
    const { body } = uploadItem.req;
    expect(body instanceof FormData).toBeTruthy();
    expect(body.get(uploadItemOptions.fileAlias) instanceof File).toBeTruthy();
    expect(body.get('name')).toBe(uploadItemOptions.additionalParams.name);
  });

  it('should build the http request', () => {
    const { req } = uploadItem;
    expect(req instanceof HttpRequest).toBeTruthy();
    expect(req.body instanceof FormData).toBeTruthy();
  });

  it('should rebuild the http request with the additionalParams passed in upload method', () => {
    expect(uploadItem.req instanceof HttpRequest).toBeTruthy();
    expect(uploadItem.req.body instanceof FormData).toBeTruthy();
    uploadItem.upload({ foo: 'bar' });
    expect(uploadItem.req.body.get('foo')).toBe('bar');
  });

  it('should set the media preview for image/video files', () => {
    const { preview } = uploadItem;
    expect(preview).toBeTruthy();
  });

  it('should not set the media preview for non image/video files', () => {
    file = new File(['testdata'], 'testfile.pdf', { type: 'application/pdf' });
    uploadItem = uploadListener.addItem({
      file
    });
    const { preview } = uploadItem;
    expect(preview).toBeFalsy();
  });

  it('should set the DataURL in preview correctly', async(() => {
    const dataUrl = 'data:image/png;base64,dGVzdGRhdGE=';
    uploadItem.preview.subscribe(url => expect(url).toBe(dataUrl));
  }));
});
