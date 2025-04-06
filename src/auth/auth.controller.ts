import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Req,
  Res,
  Patch,
  UseInterceptors,
  UploadedFile,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { AuthGuard } from './auth.guard';
import { Role } from '@prisma/client';
import { LoginDto } from './dto/login.dto';
import { Request, Response } from 'express';
import { AuthRequest } from './interfaces/auth-request.interface';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import { buildResponse } from 'src/common/response.util';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(new AuthGuard([Role.GURU]))
  @Post('register')
  create(@Body() createAuthDto: CreateAuthDto) {
    return this.authService.RegisterUserService(createAuthDto);
  }

  @Post('login')
  async login(
    @Body() data: LoginDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return await this.authService.LoginService(data, req, res);
  }

  @UseGuards(AuthGuard)
  @Get('profile')
  async getProfile(@Req() req: AuthRequest) {
    return this.authService.getProfile(req.user.id);
  }

  @UseGuards(new AuthGuard([Role.GURU]))
  @Get('users')
  findAll() {
    return this.authService.findAll();
  }

  @UseGuards(new AuthGuard([Role.GURU]))
  @Patch('users/update')
  update(@Body() updateAuthDto: UpdateAuthDto) {
    return this.authService.update(updateAuthDto);
  }

  @UseGuards(new AuthGuard([Role.GURU]))
  @Delete('users/:id')
  remove(@Param('id') id: string) {
    return this.authService.remove(+id);
  }

  @UseGuards(AuthGuard)
  @Post('profile/photo')
  @UseInterceptors(
    FileInterceptor('photo', {
      fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
          return cb(
            new HttpException(
              buildResponse(
                null,
                'Hanya file gambar (jpg, jpeg, png) yang diizinkan',
                HttpStatus.BAD_REQUEST,
              ),
              HttpStatus.BAD_REQUEST,
            ),
            false,
          );
        }
        cb(null, true);
      },
      limits: {
        fileSize: 1024 * 1024 * 2, // Maksimal 2MB
      },
    }),
  )
  async updateProfilePhoto(
    @Req() req: AuthRequest,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new HttpException(
        buildResponse(null, 'File tidak ditemukan', HttpStatus.BAD_REQUEST),
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.authService.uploadProfilePhoto(req.user.id, file);
  }
}
