import { Subscription } from 'rxjs';

import { UploadItem } from '../upload-item.class';

export interface UploadQueueItem {
  item: UploadItem;
  subscription?: Subscription;
}
