import { Test, TestingModule } from '@nestjs/testing';
import { ArtficialIntelegenceController } from './artficial-intelegence.controller';

describe('ArtficialIntelegenceController', () => {
  let controller: ArtficialIntelegenceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ArtficialIntelegenceController],
    }).compile();

    controller = module.get<ArtficialIntelegenceController>(ArtficialIntelegenceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
