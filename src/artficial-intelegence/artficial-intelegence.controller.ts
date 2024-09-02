import { Body, Controller, HttpStatus, Post } from '@nestjs/common';
import { ArtficialIntelegenceService } from './artficial-intelegence.service';
import { buildResponse } from 'helper/buildResponse';

@Controller('artficial-intelegence')
export class ArtficialIntelegenceController {
  constructor(
    private readonly artficialIntelegenceService: ArtficialIntelegenceService,
  ) {}
  @Post('ask')
  async askFreePrompt(@Body('prompt') prompt: string): Promise<any> {
    try {
      const response =
        await this.artficialIntelegenceService.askFreePrompt(prompt);
      return response; // Kembalikan response yang dibentuk oleh buildResponse
    } catch (error) {
      console.log('Controller Error:', error); // Log error untuk debugging
      if (error.status === HttpStatus.TOO_MANY_REQUESTS) {
        return buildResponse(
          null,
          'Kelas gagal di muat karena kuota terlampaui',
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }
      return buildResponse(null, 'Kelas gagal di muat', HttpStatus.BAD_REQUEST);
    }
  }
}
