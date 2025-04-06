import { Test, TestingModule } from '@nestjs/testing';
import { MateriController } from './materi.controller';
import { MateriService } from './materi.service';

describe('MateriController', () => {
  let controller: MateriController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MateriController],
      providers: [MateriService],
    }).compile();

    controller = module.get<MateriController>(MateriController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
