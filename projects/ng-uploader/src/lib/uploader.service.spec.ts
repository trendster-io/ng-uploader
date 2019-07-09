import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';

import { of } from 'rxjs';

import { Uploader } from './uploader.class';
import { UploaderService } from './uploader.service';

describe('UploaderService', () => {
  let httpClientStub;
  let service: UploaderService;

  beforeEach(() => {
    httpClientStub = jasmine.createSpyObj('HttpClient', {
      request: of(null)
    });
    TestBed.configureTestingModule({
      providers: [{ provide: HttpClient, useValue: httpClientStub }]
    });
    service = TestBed.get(UploaderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return a new Uploader', () => {
    expect(service.getUploader({}) instanceof Uploader).toBeTruthy();
  });

  it('should return a new Uploader instance everytime', () => {
    const uploader1 = service.getUploader({});
    const uploader2 = service.getUploader({});
    expect(uploader1 === uploader2).toBeFalsy();
  });
});
