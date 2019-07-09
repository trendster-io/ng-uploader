export interface UploadItemOptions {
  url?: string;
  method?: 'POST' | 'PUT' | 'PATCH';
  file: File;
  fileAlias?: string;
  additionalParams?: { [key: string]: any };
}
