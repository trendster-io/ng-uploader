import { HttpErrorResponse } from '@angular/common/http';

import { UploadItem } from '../upload-item.class';

export interface UploadItemEvent {
  item: UploadItem;
  res?: any;
  progress?: number;
  err?: HttpErrorResponse;
}
