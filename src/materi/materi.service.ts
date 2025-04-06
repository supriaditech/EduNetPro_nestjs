import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateMateriDto } from './dto/create-materi.dto';
import { UpdateMateriDto } from './dto/update-materi.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { buildResponse } from 'src/common/response.util';
import * as path from 'path';
import * as fs from 'fs';
import { getCurrentUtcTime } from 'src/common/date-helper';

@Injectable()
export class MateriService {
  constructor(private prisma: PrismaService) {}

  // Add this helper method at the top of the class
  private async checkUserRole(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!user || user.role !== 'GURU') {
      throw new HttpException(
        buildResponse(null, 'Akses ditolak', HttpStatus.FORBIDDEN),
        HttpStatus.FORBIDDEN,
      );
    }
  }

  async create(
    createMateriDto: CreateMateriDto,
    file: Express.Multer.File,
    userId: number,
  ) {
    try {
      // Check if user is GURU
      await this.checkUserRole(userId);

      // Create uploads directory if it doesn't exist
      const uploadDir = path.join(process.cwd(), 'uploads', 'materi');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      // Generate unique filename
      const fileExt = path.extname(file.originalname);
      const fileName = `${Date.now()}${fileExt}`;
      const filePath = path.join(uploadDir, fileName);

      // Save image
      await fs.promises.writeFile(filePath, file.buffer);

      const currentDateTime = getCurrentUtcTime();
      const imageUrl = `/uploads/materi/${fileName}`;

      // Create materi in database using userId from token
      const materi = await this.prisma.materi.create({
        data: {
          title: createMateriDto.title,
          description: createMateriDto.description,
          sort_desc: createMateriDto.sort_desc,
          image_url: imageUrl,
          user_id: userId, // Using userId from token
          created_at: currentDateTime,
          updated_at: currentDateTime,
        },
      });

      return buildResponse(
        materi,
        'Materi berhasil ditambahkan',
        HttpStatus.CREATED,
      );
    } catch (error) {
      throw new HttpException(
        buildResponse(null, 'Gagal menambahkan materi', HttpStatus.BAD_REQUEST),
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async findAll() {
    const materi = await this.prisma.materi.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });
    return buildResponse(materi, 'Data materi berhasil diambil', HttpStatus.OK);
  }

  async findOne(id: number) {
    const materi = await this.prisma.materi.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!materi) {
      throw new HttpException(
        buildResponse(null, 'Materi tidak ditemukan', HttpStatus.NOT_FOUND),
        HttpStatus.NOT_FOUND,
      );
    }

    return buildResponse(materi, 'Data materi berhasil diambil', HttpStatus.OK);
  }

  async update(
    id: number,
    updateMateriDto: UpdateMateriDto,
    file: Express.Multer.File,
    userId: number,
  ) {
    // Check if materi exists and belongs to user
    const materi = await this.prisma.materi.findFirst({
      where: {
        id,
        user_id: userId,
      },
    });

    if (!materi) {
      throw new HttpException(
        buildResponse(null, 'Materi tidak ditemukan', HttpStatus.NOT_FOUND),
        HttpStatus.NOT_FOUND,
      );
    }

    let imageUrl = materi.image_url;

    if (file) {
      // Handle new image upload
      const uploadDir = path.join(process.cwd(), 'uploads', 'materi');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      // Delete old image
      if (materi.image_url) {
        const oldFilePath = path.join(
          process.cwd(),
          materi.image_url.substring(1),
        );
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }

      // Save new image
      const fileExt = path.extname(file.originalname);
      const fileName = `${Date.now()}${fileExt}`;
      const filePath = path.join(uploadDir, fileName);
      await fs.promises.writeFile(filePath, file.buffer);
      imageUrl = `/uploads/materi/${fileName}`;
    }

    const currentDateTime = getCurrentUtcTime();
    const updatedMateri = await this.prisma.materi.update({
      where: { id },
      data: {
        title: updateMateriDto.title,
        description: updateMateriDto.description,
        sort_desc: updateMateriDto.sort_desc,
        image_url: imageUrl,
        updated_at: currentDateTime,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return buildResponse(
      updatedMateri,
      'Materi berhasil diperbarui',
      HttpStatus.OK,
    );
  }

  async remove(id: number, userId: number) {
    // Check if user is GURU
    await this.checkUserRole(userId);

    // Check if materi exists and belongs to user
    const materi = await this.prisma.materi.findFirst({
      where: {
        id,
        user_id: userId,
      },
    });

    if (!materi) {
      throw new HttpException(
        buildResponse(null, 'Materi tidak ditemukan', HttpStatus.NOT_FOUND),
        HttpStatus.NOT_FOUND,
      );
    }

    // Delete image file
    if (materi.image_url) {
      const filePath = path.join(process.cwd(), materi.image_url.substring(1));
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // Delete materi from database
    await this.prisma.materi.delete({
      where: { id },
    });

    return buildResponse(null, 'Materi berhasil dihapus', HttpStatus.OK);
  }
}
