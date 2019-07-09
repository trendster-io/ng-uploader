export interface UploaderOptions {
  url?: string;
  method?: 'POST' | 'PUT' | 'PATCH';
  autoUpload?: boolean;
  removeAfterUpload?: boolean;
  queueLimit?: number;
  concurrency?: number;
  maxFileSize?: number;
  allowedMimeTypes?: string[];
}
