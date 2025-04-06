import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  HttpException,
  HttpStatus,
  Req,
  Get,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import { MateriService } from './materi.service';
import { CreateMateriDto } from './dto/create-materi.dto';
import { UpdateMateriDto } from './dto/update-materi.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from 'src/auth/auth.guard';
import { Role } from '@prisma/client';
import { AuthRequest } from 'src/auth/interfaces/auth-request.interface';
import { buildResponse } from 'src/common/response.util';

@Controller('materi')
export class MateriController {
  constructor(private readonly materiService: MateriService) {}

  @UseGuards(new AuthGuard([Role.GURU]))
  @Post()
  @UseInterceptors(
    FileInterceptor('image', {
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
        fileSize: 1024 * 1024 * 2, // 2MB
      },
    }),
  )
  create(
    @Body() createMateriDto: CreateMateriDto,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: AuthRequest,
  ) {
    if (!file) {
      throw new HttpException(
        buildResponse(null, 'File tidak ditemukan', HttpStatus.BAD_REQUEST),
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.materiService.create(createMateriDto, file, req.user.id);
  }

  @Get()
  findAll() {
    return this.materiService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.materiService.findOne(+id);
  }

  @UseGuards(new AuthGuard([Role.GURU]))
  @Patch(':id')
  @UseInterceptors(
    FileInterceptor('image', {
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
        fileSize: 1024 * 1024 * 2, // 2MB
      },
    }),
  )
  update(
    @Param('id') id: string,
    @Body() updateMateriDto: UpdateMateriDto,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: AuthRequest,
  ) {
    return this.materiService.update(+id, updateMateriDto, file, req.user.id);
  }

  @UseGuards(new AuthGuard([Role.GURU]))
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: AuthRequest) {
    return this.materiService.remove(+id, req.user.id);
  }
}
