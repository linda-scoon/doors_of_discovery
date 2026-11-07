import { TestBed } from '@angular/core/testing';
import { DomSanitizer } from '@angular/platform-browser';
import { SafePipe } from './safe.pipe';

describe('SafePipe', () => {
  let pipe: SafePipe;

  beforeEach(() => {
    pipe = new SafePipe(TestBed.inject(DomSanitizer));
  });

  it('trusts an https URL on an allowed embed host', () => {
    expect(pipe.transform('https://www.youtube.com/embed/abc123')).not.toBeNull();
  });

  it('rejects a javascript: URL', () => {
    expect(pipe.transform('javascript:alert(1)')).toBeNull();
  });

  it('rejects a data: URL', () => {
    expect(pipe.transform('data:text/html,<script>alert(1)</script>')).toBeNull();
  });

  it('rejects http, even on an allowed host', () => {
    expect(pipe.transform('http://www.youtube.com/embed/abc123')).toBeNull();
  });

  it('rejects an https URL on a host we do not embed from', () => {
    expect(pipe.transform('https://attacker.example/embed/abc123')).toBeNull();
  });

  it('rejects a host that merely ends with an allowed one', () => {
    // Guards against the allowlist being matched with endsWith rather than
    // equality, which "notyoutube.com" would slip through.
    expect(pipe.transform('https://notyoutube.com/embed/abc')).toBeNull();
  });

  it('rejects the empty string we start with before the API responds', () => {
    expect(pipe.transform('')).toBeNull();
  });
});
