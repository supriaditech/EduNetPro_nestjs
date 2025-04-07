import { PartialType } from '@nestjs/mapped-types';
import { CreateQuizDto } from './create-quiz.dto';
import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class UpdateQuizDto extends PartialType(CreateQuizDto) {
  @IsNotEmpty()
  @IsNumber()
  id: number;

  @IsOptional()
  @IsNumber()
  materi_id?: number;
}
