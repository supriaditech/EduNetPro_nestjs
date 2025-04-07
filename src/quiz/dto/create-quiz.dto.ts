import { IsNotEmpty, IsNumber, IsString, Matches } from 'class-validator';

export class CreateQuizDto {
  @IsNotEmpty()
  @IsNumber()
  materi_id: number;

  @IsNotEmpty()
  @IsString()
  question_text: string;

  @IsNotEmpty()
  @IsString()
  option_a: string;

  @IsNotEmpty()
  @IsString()
  option_b: string;

  @IsNotEmpty()
  @IsString()
  option_c: string;

  @IsNotEmpty()
  @IsString()
  option_d: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^[A-D]$/, {
    message: 'correct_answer must be either A, B, C, or D',
  })
  correct_answer: string;
}
