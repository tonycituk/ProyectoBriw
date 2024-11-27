import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { GenerateFilesService } from './generate-files.service';

@Controller('generate-files')
export class GenerateFilesController {
  constructor(private readonly generateFilesService: GenerateFilesService) {}

  @Get('xlsx')
  async generateExcel() {
    await this.generateFilesService.createExcel();
  }
  
  @Get('pdf')
  async generatePdf(@Res() response: Response) {
    await this.generateFilesService.createPdf(response);
  }
}
