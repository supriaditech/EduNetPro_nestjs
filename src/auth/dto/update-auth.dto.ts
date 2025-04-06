import { PartialType } from '@nestjs/mapped-types';
import { CreateAuthDto } from './create-auth.dto';
import {
  IsOptional,
  IsString,
  IsEmail,
  MinLength,
  Matches,
  IsEnum,
  IsNumber,
  IsNotEmpty,
} from 'class-validator';
import { Role } from '@prisma/client';

export class UpdateAuthDto extends PartialType(CreateAuthDto) {
  @IsNumber()
  @IsNotEmpty()
  id: number;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/, {
    message:
      'Password must contain at least 1 uppercase letter, 1 lowercase letter, and 1 number',
  })
  password?: string;

  @IsOptional()
  @IsString()
  @MinLength(3)
  name?: string;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @IsOptional()
  @IsNumber()
  date_of_birth?: bigint;

  @IsOptional()
  @IsString()
  @Matches(/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/, {
    message: 'Photo URL must be a valid image URL',
  })
  photo_url?: string;
}
