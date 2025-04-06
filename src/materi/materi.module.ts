import { Module } from '@nestjs/common';
import { MateriService } from './materi.service';
import { MateriController } from './materi.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  controllers: [MateriController],
  providers: [MateriService],
  imports: [PrismaModule],
})
export class MateriModule {}
