import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { SolrService } from '../solr/solr.service';
import * as PDFDocument from 'pdfkit';
import { Response } from 'express';
import * as ExcelJS from 'exceljs';


@Injectable()
export class GenerateFilesService {
  constructor(private readonly solrService: SolrService) {}

  async createExcel(response: Response) {
    try {
      const solrData = await this.solrService.fetchData('*:*', 100);
  
      // Crear un nuevo libro de Excel
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Solr Data');
  
      // Agregar encabezados
      worksheet.columns = [
        { header: 'Entry', key: 'entry', width: 10 },
        { header: 'ID', key: 'id', width: 30 },
        { header: 'Title', key: 'title', width: 30 },
        { header: 'Content', key: 'content', width: 50 },
      ];
  
      // Agregar datos
      solrData.forEach((item, index) => {
        worksheet.addRow({
          entry: `Entry ${index + 1}`,
          id: item.id,
          title: item.title || 'Untitled',
          content: this.cleanContent(item.content || 'No Content'),
        });
      });
  
      // Establecer encabezados de respuesta
      response.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      response.setHeader('Content-Disposition', 'attachment; filename="solr-data-report.xlsx"');
  
      // Enviar archivo como respuesta
      await workbook.xlsx.write(response);
      response.end();
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Error generating XLSX file');
    }
  }
  

  async createPdf(response: Response) {
    try {
      const solrData = await this.solrService.fetchData('*:*', 100);

      const doc = new PDFDocument({ margin: 50 });

      response.setHeader('Content-Type', 'application/pdf');
      response.setHeader('Content-Disposition', 'attachment; filename="solr-data-report.pdf"');

      doc.pipe(response);

      doc.fontSize(16).text('Solr Data Report', { align: 'center' });
      doc.moveDown(2);

      solrData.forEach((item, index) => {
        doc.fontSize(12).text(`Entry ${index + 1}`, { underline: true });
        doc.text(`ID: ${item.id}`);
        doc.text(`Title: ${item.title || 'Untitled'}`);

        let content = this.cleanContent(item.content || 'No Content');
        doc.text(`Content: ${content}`);

        doc.moveDown(2);

        if (doc.y > 700) {
          doc.addPage();
        }
      });

      doc.end();
    } catch (error) {
      console.log(error)
      throw new InternalServerErrorException('Error generating PDF file');
    }
  }

  cleanContent(content: string): string {
    content = content.replace(/[\x00-\x1F\x7F-\x9F]/g, ''); // Eliminar caracteres no imprimibles
    content = content.replace(/(https?:\/\/[^\s]+)/g, 'Link Removed'); // Reemplazar enlaces
    content = content.replace(/<\/?[^>]+(>|$)/g, ''); // Eliminar etiquetas HTML
    return content;
  }
}
