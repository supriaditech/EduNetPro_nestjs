import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { buildResponse } from 'src/common/response.util';
import { compare, hash } from 'bcrypt';
import { getCurrentUtcTime } from 'src/common/date-helper';
import { LoginDto } from './dto/login.dto';
import { Request, Response } from 'express';
import { generateJWT } from 'src/common/generate-jwt.helper';
import { jwt_config } from 'src/config/jwt_config';
import { generateRefreshToken } from 'src/common/generate-jwt-refresh-token.helper';
import { JwtService } from '@nestjs/jwt';
import { Express } from 'express';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}
  async RegisterUserService(data: CreateAuthDto) {
    const checkUserExists = await this.prisma.user.findFirst({
      where: {
        email: data.email,
      },
    });

    if (checkUserExists) {
      throw new HttpException(
        buildResponse(null, 'Pengguna sudah terdaftar', HttpStatus.CONFLICT),
        HttpStatus.CONFLICT,
      );
    }

    // Pengecekan apakah email sudah terdaftar
    const checkEmailExists = await this.prisma.user.findFirst({
      where: {
        nisn: data.nisn,
      },
    });

    // Jika email sudah ada
    if (checkEmailExists) {
      throw new HttpException(
        buildResponse(null, 'NISN sudah terdaftar', HttpStatus.CONFLICT),
        HttpStatus.CONFLICT,
      );
    }

    // const password = data.password;
    data.password = await hash(data.password, 12);
    const currentDateTime = getCurrentUtcTime();
    const createUser = await this.prisma.user.create({
      data: {
        email: data.email,
        password: data.password,
        name: data.name,
        nisn: data.nisn,
        photo_url: data.photo_url ?? null,
        role: data.role,
        date_of_birth: data.date_of_birth,
        created_at: currentDateTime,
        updated_at: currentDateTime,
      },
    });

    // const resetToken = generateJWT({
    //   id: createUser.id,
    //   role: createUser.role,
    // });

    // const resetPasswordLink = `${process.env.NEXT_URL}/reset-password?token=${resetToken}`;
    const userWithClasses = await this.prisma.user.findUnique({
      where: { id: createUser.id },
    });

    if (userWithClasses) {
      return buildResponse(
        userWithClasses,
        'Pendaftaran berhasil',
        HttpStatus.OK,
      );
    } else {
      return buildResponse(
        null,
        'Mohon periksa data kembali',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async LoginService(data: LoginDto, req: Request, res: Response) {
    // Memeriksa apakah email atau username ada di database
    const checkUserExists = await this.prisma.user.findFirst({
      where: {
        email: data.email,
      },
    });

    if (!checkUserExists) {
      const response = buildResponse(
        null,
        'Pengguna tidak ditemukan',
        HttpStatus.NOT_FOUND,
      );
      return res.status(HttpStatus.NOT_FOUND).json(response);
    }

    // Memeriksa kecocokan password
    const checkPassword = await compare(
      data.password,
      checkUserExists.password,
    );
    if (!checkPassword) {
      const response = buildResponse(
        null,
        'Password tidak cocok',
        HttpStatus.FORBIDDEN,
      );
      return res.status(HttpStatus.FORBIDDEN).json(response);
    }

    // Membuat JWT token setelah login berhasil
    const accessToken = generateJWT(this.jwtService, {
      id: checkUserExists.id,
      role: checkUserExists.role,
    });
    const refreshToken = generateRefreshToken(this.jwtService, {
      id: checkUserExists.id,
      role: checkUserExists.role,
    });

    const currentMillis = Date.now(); // Mendapatkan waktu saat ini dalam milidetik
    const accessTokenExpiryMillis = currentMillis + jwt_config.expired * 1000;
    const expiredMillis = currentMillis + 7 * 24 * 60 * 60 * 1000; // 7 hari kedaluwarsa
    // Simpan refresh token di database
    await this.prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: checkUserExists.id,
        createdAt: currentMillis, // Waktu pembuatan dalam milidetik
        updatedAt: currentMillis, // Waktu pembaruan awal
        expiredAt: expiredMillis, // Waktu kedaluwarsa dalam milidetik
      },
    });
    // Set refresh token di httpOnly cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'PRODUCTION', // Hanya true di production
      sameSite: process.env.NODE_ENV === 'DEVELOPMENT' ? 'lax' : 'none', // Sesuaikan dengan lingkungan
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 hari
      path: '/',
      domain:
        process.env.NODE_ENV === 'DEVELOPMENT' ? 'localhost' : '.supriadi.tech', // Sesuaikan domain
    });

    // Hanya mengembalikan token, tanpa data pengguna sensitif lainnya
    const response = buildResponse(
      {
        accessToken,
        accessTokenExpiry: accessTokenExpiryMillis,
        id: checkUserExists.id,
        role: checkUserExists.role,
      },
      'Login berhasil',
      HttpStatus.OK,
    );
    return res.status(HttpStatus.OK).json(response);
  }

  async findAll() {
    const users = await this.prisma.user.findMany();
    return buildResponse(
      users,
      'Data pengguna berhasil diambil',
      HttpStatus.OK,
    );
  }

  async update(updateAuthDto: UpdateAuthDto) {
    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { id: updateAuthDto.id },
    });

    if (!user) {
      throw new HttpException(
        buildResponse(null, 'Pengguna tidak ditemukan', HttpStatus.NOT_FOUND),
        HttpStatus.NOT_FOUND,
      );
    }

    // Check if NISN is being updated and if it's already taken
    if (updateAuthDto.nisn && updateAuthDto.nisn !== user.nisn) {
      const existingUserWithNisn = await this.prisma.user.findFirst({
        where: {
          nisn: updateAuthDto.nisn,
          NOT: {
            id: updateAuthDto.id,
          },
        },
      });

      if (existingUserWithNisn) {
        throw new HttpException(
          buildResponse(null, 'NISN sudah digunakan', HttpStatus.CONFLICT),
          HttpStatus.CONFLICT,
        );
      }
    }

    // Rest of the update logic
    if (updateAuthDto.password) {
      updateAuthDto.password = await hash(updateAuthDto.password, 12);
    }

    const currentDateTime = getCurrentUtcTime();
    const { id, ...updateData } = updateAuthDto;

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: {
        ...updateData,
        updated_at: currentDateTime,
      },
      select: {
        id: true,
        email: true,
        name: true,
        nisn: true,
        photo_url: true,
        role: true,
        date_of_birth: true,
        created_at: true,
        updated_at: true,
      },
    });

    return buildResponse(
      updatedUser,
      'Data pengguna berhasil diperbarui',
      HttpStatus.OK,
    );
  }

  async remove(id: number) {
    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new HttpException(
        buildResponse(null, 'Pengguna tidak ditemukan', HttpStatus.NOT_FOUND),
        HttpStatus.NOT_FOUND,
      );
    }

    // Delete the user
    await this.prisma.user.delete({
      where: { id },
    });

    return buildResponse(null, 'Pengguna berhasil dihapus', HttpStatus.OK);
  }

  async getProfile(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        nisn: true,
        photo_url: true,
        role: true,
        date_of_birth: true,
        created_at: true,
        updated_at: true,
        materi: {
          select: {
            id: true,
            title: true,
            description: true,
            sort_desc: true,
            image_url: true,
            created_at: true,
            updated_at: true,
          },
        },
        quiz_attempt: {
          select: {
            id: true,
            total_question: true,
            correct_answers: true,
            score: true,
            created_at: true,
          },
        },
      },
    });

    if (!user) {
      throw new HttpException(
        buildResponse(null, 'Pengguna tidak ditemukan', HttpStatus.NOT_FOUND),
        HttpStatus.NOT_FOUND,
      );
    }

    return buildResponse(user, 'Profil berhasil diambil', HttpStatus.OK);
  }

  async uploadProfilePhoto(userId: number, file: Express.Multer.File) {
    // Cek pengguna
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new HttpException(
        buildResponse(null, 'Pengguna tidak ditemukan', HttpStatus.NOT_FOUND),
        HttpStatus.NOT_FOUND,
      );
    }

    // Buat direktori jika belum ada
    const uploadDir = path.join(process.cwd(), 'uploads', 'profile-photos');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Generate nama file unik
    const fileExt = path.extname(file.originalname);
    const fileName = `${userId}-${Date.now()}${fileExt}`;
    const filePath = path.join(uploadDir, fileName);

    // Hapus foto lama jika ada
    if (user.photo_url) {
      const oldFilePath = path.join(process.cwd(), user.photo_url.substring(1));
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
    }

    // Simpan foto baru
    await fs.promises.writeFile(filePath, file.buffer);

    // Update URL foto di database
    const photoUrl = `/uploads/profile-photos/${fileName}`;
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        photo_url: photoUrl,
        updated_at: getCurrentUtcTime(),
      },
      select: {
        id: true,
        name: true,
        photo_url: true,
      },
    });

    return buildResponse(
      updatedUser,
      'Foto profil berhasil diperbarui',
      HttpStatus.OK,
    );
  }
}
