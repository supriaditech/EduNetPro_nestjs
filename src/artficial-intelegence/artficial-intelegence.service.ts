import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import OpenAI from 'openai';

@Injectable()
export class ArtficialIntelegenceService {
  private openAi: OpenAI;

  constructor() {
    // Tambahkan console.log untuk melihat apakah API Key terbaca dengan benar
    const apiKey = process.env['OPENAI_API_KEY'];
    console.log('OpenAI API Key:', apiKey);

    if (!apiKey) {
      throw new Error(
        'The OPENAI_API_KEY environment variable is missing or empty.',
      );
    }

    this.openAi = new OpenAI({
      apiKey: apiKey, // API Key dari OpenAI
    });
  }

  async askFreePrompt(prompt: string): Promise<any> {
    return this.getResponseFromOpenAI(prompt);
  }

  private async getResponseFromOpenAI(prompt: string): Promise<any> {
    try {
      console.log('Prompt:', prompt); // Log prompt untuk debugging

      const stream = await this.openAi.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        stream: true,
      });

      let responseContent = '';
      for await (const chunk of stream) {
        responseContent += chunk.choices[0]?.delta?.content || '';
      }

      console.log('Response from OpenAI:', responseContent); // Log respons untuk debugging

      return this.buildResponse(
        responseContent,
        'Request successful',
        HttpStatus.OK,
      );
    } catch (error) {
      console.log('Error:', error); // Log error untuk debugging
      if (error.response) {
        console.error('Error response:', error.response.data);
      }
      throw new HttpException(
        this.buildResponse(
          null,
          'There was a problem processing your request',
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private buildResponse(data: any, message: string, status: HttpStatus) {
    return {
      data,
      message,
      status,
    };
  }
}
