import { Test, TestingModule } from '@nestjs/testing';
import { ArtficialIntelegenceService } from './artficial-intelegence.service';

describe('ArtficialIntelegenceService', () => {
  let service: ArtficialIntelegenceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ArtficialIntelegenceService],
    }).compile();

    service = module.get<ArtficialIntelegenceService>(ArtficialIntelegenceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
