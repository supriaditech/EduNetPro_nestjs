import { Module } from '@nestjs/common';
import { QuizService } from './quiz.service';
import { QuizController } from './quiz.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  controllers: [QuizController],
  providers: [QuizService],
  imports: [PrismaModule],
})
export class QuizModule {}
