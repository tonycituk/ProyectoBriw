import { Injectable } from '@nestjs/common';
import { SolrService } from '../solr/solr.service';
import * as XLSX from 'xlsx';
import * as PDFDocument from 'pdfkit';
import { Response } from 'express';

@Injectable()
export class GenerateFilesService {
  constructor(private readonly solrService: SolrService) {}

  async createExcel() {
    const solrData = await this.solrService.fetchData('*:*', 100);

    // Transformar los datos para el Excel
    const formattedData = solrData.map((item) => ({
      ID: item.id,
      Title: item.title || 'Untitled',
      Content: this.cleanContent(item.content || 'No Content'), // Limpiar el contenido para Excel
    }));

    // Crear hoja de cálculo
    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');

    // Generar buffer del archivo Excel
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    return buffer;
  }

  async createPdf(response: Response) {
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

      let content = this.cleanContent(item.content || 'No Content');  // Limpiar el contenido para PDF
      doc.text(`Content: ${content}`);

      doc.moveDown(2); // Adding extra space between entries

      if (doc.y > 700) {
        doc.addPage(); // Add a new page if content overflows
      }
    });

    doc.end();
  }

  cleanContent(content: string): string {
    // Reemplazar caracteres extraños o no deseados
    content = content.replace(/[\x00-\x1F\x7F-\x9F]/g, ''); // Eliminar caracteres no imprimibles
    content = content.replace(/(https?:\/\/[^\s]+)/g, 'Link Removed'); // Reemplazar enlaces con "Link Removed"
    content = content.replace(/<\/?[^>]+(>|$)/g, ''); // Eliminar etiquetas HTML
    return content;
  }
}
