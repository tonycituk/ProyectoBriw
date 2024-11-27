import { Injectable, Inject } from '@nestjs/common';
import * as solr from 'solr-client';

@Injectable()
export class SolrService {
  constructor(@Inject('SOLR_CLIENT') private readonly client: solr.Client) {}

  async fetchData(query: string = '*:*', rows: number = 100): Promise<any[]> {
    try {
      const options = {
        q: query, // Cambiar "query" a "q" según el estándar de Solr
        rows,
        wt: 'json', // Asegurar que el formato sea JSON
      };

      const result = await this.client.search(options);
      return result.response.docs;
    } catch (err) {
      throw new Error(`Error al consultar Solr: ${err.message}`);
    }
  }
}
