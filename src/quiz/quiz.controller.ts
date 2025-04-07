import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { QuizService } from './quiz.service';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { Role } from '@prisma/client';
import { AuthRequest } from 'src/auth/interfaces/auth-request.interface';

@Controller('quiz')
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @UseGuards(new AuthGuard([Role.GURU]))
  @Post()
  create(@Body() createQuizDto: CreateQuizDto, @Req() req: AuthRequest) {
    return this.quizService.create(createQuizDto, req.user.id);
  }

  @Get()
  findAll() {
    return this.quizService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.quizService.findOne(+id);
  }

  @UseGuards(new AuthGuard([Role.GURU]))
  @Patch()
  update(@Body() updateQuizDto: UpdateQuizDto, @Req() req: AuthRequest) {
    return this.quizService.update(updateQuizDto, req.user.id);
  }

  @UseGuards(new AuthGuard([Role.GURU]))
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: AuthRequest) {
    return this.quizService.remove(+id, req.user.id);
  }

  @Get('materi/:materiId')
  findByMateriId(@Param('materiId') materiId: string) {
    return this.quizService.findByMateriId(+materiId);
  }
}
