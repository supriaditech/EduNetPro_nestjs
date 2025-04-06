import { IsNotEmpty, IsString } from 'class-validator';

export class CreateMateriDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsString()
  sort_desc: string;
}
