import { Role } from '@prisma/client';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsEmail,
  MinLength,
  Matches,
  IsEnum,
  IsNumber,
} from 'class-validator';

export class CreateAuthDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/, {
    message:
      'Password must contain at least 1 uppercase letter, 1 lowercase letter, and 1 number',
  })
  password: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  nisn: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  name: string;

  @IsEnum(Role)
  @IsNotEmpty()
  role: Role;

  @IsNumber()
  @IsNotEmpty()
  date_of_birth: bigint;

  @IsString()
  @IsOptional()
  @Matches(/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/, {
    message: 'Photo URL must be a valid image URL',
  })
  photo_url?: string;
}
