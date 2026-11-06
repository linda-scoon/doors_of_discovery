import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageRoomComponent } from './image-room.component';

describe('ImageRoomComponent', () => {
  let component: ImageRoomComponent;
  let fixture: ComponentFixture<ImageRoomComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ImageRoomComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ImageRoomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
