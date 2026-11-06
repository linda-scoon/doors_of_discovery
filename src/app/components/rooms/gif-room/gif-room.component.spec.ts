import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GifRoomComponent } from './gif-room.component';

describe('GifRoomComponent', () => {
  let component: GifRoomComponent;
  let fixture: ComponentFixture<GifRoomComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GifRoomComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GifRoomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
