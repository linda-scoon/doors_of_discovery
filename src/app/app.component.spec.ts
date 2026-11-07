import { TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [AppComponent],
      // The template is nothing but room components. This is a unit test of
      // AppComponent's own markup, so the rooms are left unresolved rather
      // than dragged in with their services and HTTP calls.
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

  it('renders one room per door', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    // Every room carries .app-room, which is what the wrapper's flex layout
    // lays out. If a room is added to the template without that class it will
    // not be laid out, so the count is worth asserting.
    expect(compiled.querySelectorAll('.app-wrapper .app-room').length).toBe(9);
  });
});
