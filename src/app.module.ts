import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ArtficialIntelegenceModule } from './artficial-intelegence/artficial-intelegence.module';

@Module({
  imports: [ArtficialIntelegenceModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
