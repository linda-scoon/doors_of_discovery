import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Subject, throwError } from 'rxjs';

import { pickOne, roomLoad } from './room-load';

@Component({ template: '' })
class Host {
  /** A fresh one for every fetch, as a real request would be. */
  source = new Subject<string>();
  calls = 0;
  readonly load = roomLoad(() => {
    this.calls += 1;
    this.source = new Subject<string>();
    return this.source;
  });
}

describe('roomLoad', () => {
  it('is loading until something arrives, then ready with it', () => {
    const host = TestBed.createComponent(Host).componentInstance;
    expect(host.load.status()).toBe('loading');

    host.source.next('a fact');

    expect(host.load.status()).toBe('ready');
    expect(host.load.value()).toBe('a fact');
  });

  it('fails when the fetch fails, and tries again on reload', () => {
    const host = TestBed.createComponent(Host).componentInstance;
    host.source.error(new Error('down'));
    expect(host.load.status()).toBe('failed');

    host.load.reload();

    expect(host.calls).toBe(2);
    expect(host.load.status()).toBe('loading');
  });

  it('stops listening once the room is taken down', () => {
    const fixture = TestBed.createComponent(Host);
    const host = fixture.componentInstance;
    fixture.destroy();

    host.source.next('too late');

    expect(host.load.status()).toBe('loading');
  });
});

describe('pickOne', () => {
  it('picks from the list', () => {
    expect(['a', 'b']).toContain(pickOne(['a', 'b']));
  });

  it('refuses an empty list, so the room fails rather than showing nothing', () => {
    expect(() => pickOne([])).toThrow();
    expect(() => pickOne(undefined)).toThrow();
  });
});

// Keeps the import honest: throwError is what a failing HttpClient call
// looks like, and roomLoad has to treat it as a failure.
describe('roomLoad with an erroring observable', () => {
  it('fails', () => {
    @Component({ template: '' })
    class Failing {
      readonly load = roomLoad(() => throwError(() => new Error('no')));
    }
    expect(TestBed.createComponent(Failing).componentInstance.load.status()).toBe('failed');
  });
});
