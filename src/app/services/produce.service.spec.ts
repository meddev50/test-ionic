import { TestBed } from '@angular/core/testing';

import { ProduceService } from './produce.service';

describe('ProduceService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ProduceService = TestBed.get(ProduceService);
    expect(service).toBeTruthy();
  });
});
