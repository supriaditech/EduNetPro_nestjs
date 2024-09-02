import { Module } from '@nestjs/common';
import { ArtficialIntelegenceService } from './artficial-intelegence.service';
import { ArtficialIntelegenceController } from './artficial-intelegence.controller';

@Module({
  providers: [ArtficialIntelegenceService],
  controllers: [ArtficialIntelegenceController]
})
export class ArtficialIntelegenceModule {}
