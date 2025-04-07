import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { buildResponse } from 'src/common/response.util';
import { getCurrentUtcTime } from 'src/common/date-helper';

@Injectable()
export class QuizService {
  constructor(private prisma: PrismaService) {}

  async create(createQuizDto: CreateQuizDto, userId: number) {
    try {
      // Check if materi exists and belongs to user
      const materi = await this.prisma.materi.findFirst({
        where: {
          id: createQuizDto.materi_id,
          user_id: userId,
        },
      });

      if (!materi) {
        throw new HttpException(
          buildResponse(null, 'Materi tidak ditemukan', HttpStatus.NOT_FOUND),
          HttpStatus.NOT_FOUND,
        );
      }

      const currentDateTime = getCurrentUtcTime();

      const quiz = await this.prisma.quiz.create({
        data: {
          materi_id: createQuizDto.materi_id,
          question_text: createQuizDto.question_text,
          option_a: createQuizDto.option_a,
          option_b: createQuizDto.option_b,
          option_c: createQuizDto.option_c,
          option_d: createQuizDto.option_d,
          correct_answer: createQuizDto.correct_answer,
          user_id: userId,
          created_at: currentDateTime,
          updated_at: currentDateTime,
        },
        include: {
          materi: {
            select: {
              title: true,
            },
          },
          user: {
            select: {
              name: true,
            },
          },
        },
      });

      return buildResponse(
        quiz,
        'Quiz berhasil ditambahkan',
        HttpStatus.CREATED,
      );
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        buildResponse(null, 'Gagal menambahkan quiz', HttpStatus.BAD_REQUEST),
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async findAll() {
    const quizzes = await this.prisma.quiz.findMany({
      include: {
        materi: {
          select: {
            title: true,
          },
        },
        user: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });
    return buildResponse(quizzes, 'Data quiz berhasil diambil', HttpStatus.OK);
  }

  async findOne(id: number) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id },
      include: {
        materi: {
          select: {
            title: true,
          },
        },
        user: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!quiz) {
      throw new HttpException(
        buildResponse(null, 'Quiz tidak ditemukan', HttpStatus.NOT_FOUND),
        HttpStatus.NOT_FOUND,
      );
    }

    return buildResponse(quiz, 'Data quiz berhasil diambil', HttpStatus.OK);
  }

  async findByMateriId(materiId: number) {
      const quizzes = await this.prisma.quiz.findMany({
        where: {
          materi_id: materiId,
        },
        include: {
          materi: {
            select: {
              title: true,
            },
          },
          user: {
            select: {
              name: true,
            },
          },
        },
        orderBy: {
          created_at: 'desc',
        },
      });
  
      if (quizzes.length === 0) {
        throw new HttpException(
          buildResponse(null, 'Quiz tidak ditemukan untuk materi ini', HttpStatus.NOT_FOUND),
          HttpStatus.NOT_FOUND,
        );
      }
  
      return buildResponse(quizzes, 'Data quiz berhasil diambil', HttpStatus.OK);
    }

  async update(updateQuizDto: UpdateQuizDto, userId: number) {
    try {
      // Check if quiz exists and belongs to user
      const quiz = await this.prisma.quiz.findFirst({
        where: {
          id: updateQuizDto.id,
          user_id: userId,
        },
      });

      if (!quiz) {
        throw new HttpException(
          buildResponse(null, 'Quiz tidak ditemukan', HttpStatus.NOT_FOUND),
          HttpStatus.NOT_FOUND,
        );
      }

      // If materi_id is provided, check if materi exists and belongs to user
      if (updateQuizDto.materi_id) {
        const materi = await this.prisma.materi.findFirst({
          where: {
            id: updateQuizDto.materi_id,
            user_id: userId,
          },
        });

        if (!materi) {
          throw new HttpException(
            buildResponse(null, 'Materi tidak ditemukan', HttpStatus.NOT_FOUND),
            HttpStatus.NOT_FOUND,
          );
        }
      }

      const currentDateTime = getCurrentUtcTime();

      const updatedQuiz = await this.prisma.quiz.update({
        where: { id: updateQuizDto.id },
        data: {
          materi_id: updateQuizDto.materi_id,
          question_text: updateQuizDto.question_text,
          option_a: updateQuizDto.option_a,
          option_b: updateQuizDto.option_b,
          option_c: updateQuizDto.option_c,
          option_d: updateQuizDto.option_d,
          correct_answer: updateQuizDto.correct_answer,
          updated_at: currentDateTime,
        },
        include: {
          materi: {
            select: {
              title: true,
            },
          },
          user: {
            select: {
              name: true,
            },
          },
        },
      });

      return buildResponse(
        updatedQuiz,
        'Quiz berhasil diperbarui',
        HttpStatus.OK,
      );
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        buildResponse(null, 'Gagal memperbarui quiz', HttpStatus.BAD_REQUEST),
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async remove(id: number, userId: number) {
    // Check if quiz exists and belongs to user
    const quiz = await this.prisma.quiz.findFirst({
      where: {
        id,
        user_id: userId,
      },
    });

    if (!quiz) {
      throw new HttpException(
        buildResponse(null, 'Quiz tidak ditemukan', HttpStatus.NOT_FOUND),
        HttpStatus.NOT_FOUND,
      );
    }

    await this.prisma.quiz.delete({
      where: { id },
    });

    return buildResponse(null, 'Quiz berhasil dihapus', HttpStatus.OK);
  }
}
