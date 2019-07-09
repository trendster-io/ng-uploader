import { NgModule } from '@angular/core';

import { DropzoneDirective } from './dropzone.directive';

@NgModule({
  declarations: [DropzoneDirective],
  exports: [DropzoneDirective]
})
export class UploaderModule {}
