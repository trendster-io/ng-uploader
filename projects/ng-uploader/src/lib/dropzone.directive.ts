import {
  Directive,
  EventEmitter,
  HostBinding,
  HostListener,
  Input,
  Output
} from '@angular/core';

@Directive({
  selector: '[dropzone]'
})
export class DropzoneDirective {
  // Disable dropping on the body of the document.
  // This prevents the browser from loading the dropped files
  // using it's default behaviour if the user misses the drop zone.
  // Set this input to false if you want the browser default behaviour.
  @Input() preventBodyDrop = true;

  @Input() disabled = false;

  @Output() fileDrop = new EventEmitter<File[]>();

  // The `dropzone-active` class is applied to the host
  // element when a drag is currently over the target, to allow styling it
  @HostBinding('class.dropzone-active')
  active = false;

  @HostListener('drop', ['$event'])
  onDrop(event: DragEvent) {
    event.preventDefault();
    if (!this.disabled) {
      this.active = false;

      const { dataTransfer } = event;

      if (dataTransfer.items) {
        const files: File[] = [];
        for (let i = 0; i < dataTransfer.items.length; i++) {
          // If dropped items aren't files, reject them
          if (dataTransfer.items[i].kind === 'file') {
            files.push(dataTransfer.items[i].getAsFile());
          }
        }
        dataTransfer.items.clear();
        this.fileDrop.emit(files);
      } else {
        const files = dataTransfer.files;
        dataTransfer.clearData();
        this.fileDrop.emit(Array.from(files));
      }
    }
  }

  @HostListener('dragover', ['$event'])
  onDragOver(event: DragEvent) {
    event.stopPropagation();
    event.preventDefault();
    if (!this.disabled) {
      this.active = true;
    }
  }

  @HostListener('dragleave', ['$event'])
  onDragLeave(event: DragEvent) {
    if (!this.disabled) {
      this.active = false;
    }
  }

  @HostListener('body:dragover', ['$event'])
  onBodyDragOver(event: DragEvent) {
    if (this.preventBodyDrop) {
      event.preventDefault();
      event.stopPropagation();
    }
  }

  @HostListener('body:drop', ['$event'])
  onBodyDrop(event: DragEvent) {
    if (this.preventBodyDrop) {
      event.preventDefault();
    }
  }
}
