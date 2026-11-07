import { TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';

import { AppComponent } from './app.component';
import { ROOMS } from './rooms';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [AppComponent],
      // The page is nothing but room slots. This is a unit test of the
      // wall itself, so they are left unresolved rather than dragged in
      // with their services and HTTP calls.
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it(`should have as title 'web_of_doors'`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    expect(fixture.componentInstance.title).toEqual('web_of_doors');
  });

  it('hangs every room on the first screens', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const ids = fixture.componentInstance.doors.map((door) => door.room.id);

    ROOMS.forEach((room) => expect(ids).toContain(room.id));
  });

  it('fills the rest of the wall with generated doors', () => {
    const fixture = TestBed.createComponent(AppComponent);
    expect(fixture.componentInstance.doors.length).toBeGreaterThan(ROOMS.length);
  });

  it('renders one slot per door, each laid out by the grid', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const slots = compiled.querySelectorAll('.app-wrapper .app-room');

    // Every slot carries .app-room, which is what the grid lays out. A door
    // added without it would not be positioned.
    expect(slots.length).toBe(fixture.componentInstance.doors.length);
  });

  it('gives every door a distinct id, so none share an appearance by accident', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();

    const ids = fixture.componentInstance.doors.map((door) => door.room.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
