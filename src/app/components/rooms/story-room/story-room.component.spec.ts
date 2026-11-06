import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StoryRoomComponent } from './story-room.component';

describe('StoryRoomComponent', () => {
  let component: StoryRoomComponent;
  let fixture: ComponentFixture<StoryRoomComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StoryRoomComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StoryRoomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
