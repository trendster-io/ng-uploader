import { UploadItem } from '../upload-item.class';
import { UploadItemOptions } from '.';

export interface UploadListener {
  addItem(options: UploadItemOptions): UploadItem;
  uploadItem(item): void;
  cancelItem(item: UploadItem): void;
  removeItem(item: UploadItem): void;
}
