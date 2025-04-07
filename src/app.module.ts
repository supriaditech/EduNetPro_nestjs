import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ArtficialIntelegenceModule } from './artficial-intelegence/artficial-intelegence.module';
import { AuthModule } from './auth/auth.module';
import { MateriModule } from './materi/materi.module';
import { QuizModule } from './quiz/quiz.module';

@Module({
  imports: [ArtficialIntelegenceModule, AuthModule, MateriModule, QuizModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
