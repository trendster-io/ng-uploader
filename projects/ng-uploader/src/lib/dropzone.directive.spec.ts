import { Component } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';

import { DropzoneDirective } from './dropzone.directive';

@Component({
  selector: 'app-dropzone-test-container',
  template: `
    <div class="dropzone" dropzone>
      <p>Click or drag and drop files</p>
    </div>
  `,
  styles: [
    `
      .dropzone {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 400px;
        height: 400px;
      }
    `
  ]
})
class ContainerComponent {}

describe('DropzoneDirective', () => {
  let fixture: ComponentFixture<ContainerComponent>;
  let container: ContainerComponent;
  let directive: DropzoneDirective;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ContainerComponent, DropzoneDirective]
    });
    fixture = TestBed.createComponent(ContainerComponent);
    container = fixture.componentInstance;
    directive = new DropzoneDirective();
    fixture.detectChanges();
  });

  it('should create an instance', () => {
    expect(directive).toBeTruthy();
  });
});
