import { Type } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

/** A room under test, with the server replaced by one the test answers. */
export interface RoomUnderTest<T> {
  fixture: ComponentFixture<T>;
  server: HttpTestingController;
  /** Everything the room shows, as one line of text. */
  text(): string;
}

export async function openRoom<T>(room: Type<T>): Promise<RoomUnderTest<T>> {
  await TestBed.configureTestingModule({
    imports: [room],
    providers: [provideHttpClient(), provideHttpClientTesting()],
  }).compileComponents();

  const fixture = TestBed.createComponent(room);
  fixture.detectChanges();

  return {
    fixture,
    server: TestBed.inject(HttpTestingController),
    text: () => {
      fixture.detectChanges();
      return (fixture.nativeElement as HTMLElement).textContent!.replace(/\s+/g, ' ').trim();
    },
  };
}

/** Answers the room's request as a server that is down would. */
export function failRequest(server: HttpTestingController, url: string | RegExp): void {
  server
    .expectOne((req) => (typeof url === 'string' ? req.url === url : url.test(req.urlWithParams)))
    .flush({ error: 'down' }, { status: 502, statusText: 'Bad Gateway' });
}
