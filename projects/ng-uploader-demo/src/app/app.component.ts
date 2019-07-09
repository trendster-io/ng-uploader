import { Component, OnInit } from '@angular/core';

import { Uploader, UploaderService } from 'ng-uploader';

import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  method: 'POST' | 'PUT' | 'PATCH';
  autoUpload: boolean;
  removeAfterUpload: boolean;
  queueLimit: number;
  concurrency: number;
  maxFileSize: number;
  allowedMimeTypes: string[];
  uploader: Uploader;

  constructor(private uploaderService: UploaderService) {}

  ngOnInit(): void {
    this.method = 'POST';
    this.autoUpload = false; // Don't upload the item automatically when I add it to the queue
    this.removeAfterUpload = false; // Remove items from the queue after upload success
    this.queueLimit = 5; // Queue cannot contain more than 5 items
    this.concurrency = 1; // 1 upload at a time
    this.maxFileSize = 20 * 1024 * 1024; // 20mb
    this.allowedMimeTypes = ['image/png']; // Only allow image of format png
    this.initUploader();
  }

  private initUploader(): void {
    this.uploader = this.uploaderService.getUploader({
      url: `${environment.apiUrl}/upload`,
      method: this.method,
      autoUpload: this.autoUpload,
      removeAfterUpload: this.removeAfterUpload,
      queueLimit: this.queueLimit,
      concurrency: this.concurrency,
      maxFileSize: this.maxFileSize,
      allowedMimeTypes: this.allowedMimeTypes
    });
  }

  onOptionsChange() {
    this.initUploader();
  }

  onFilesDrop(files: File[]) {
    files.forEach(file => {
      try {
        const item = this.uploader.addItem({
          file,
          additionalParams: {
            foo: 'bar'
          }
        });
      } catch (err) {
        console.log(err);
      }
    });
  }

  onFilesChange(fileList: FileList): void {
    this.onFilesDrop(Array.from(fileList));
  }
}
