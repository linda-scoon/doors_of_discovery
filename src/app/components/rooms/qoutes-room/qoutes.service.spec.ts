import { TestBed } from '@angular/core/testing';

import { QoutesService } from './qoutes.service';

describe('QoutesService', () => {
  let service: QoutesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(QoutesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
