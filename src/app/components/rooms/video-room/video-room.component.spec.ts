import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { VideoRoomComponent } from './video-room.component';
import { SafePipe } from '../../../pipes/safe.pipe';

describe('VideoRoomComponent', () => {
  let component: VideoRoomComponent;
  let fixture: ComponentFixture<VideoRoomComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      // SafePipe is used by this component's template, so it has to be
      // declared here even though it lives elsewhere.
      declarations: [VideoRoomComponent, SafePipe],
      // VideosService calls the network; the testing backend keeps the real
      // request from being made.
      providers: [provideHttpClient(), provideHttpClientTesting()],

      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VideoRoomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('does not render the iframe until a trusted video URL arrives', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('iframe')).toBeNull();
  });
});
