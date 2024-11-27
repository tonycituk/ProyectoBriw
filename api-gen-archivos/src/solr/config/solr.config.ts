import { ConfigService } from '@nestjs/config';
import * as solr from 'solr-client';

export const createSolrClient = (configService: ConfigService): solr.Client => {
  console.log(`${process.env.SOLR_HOST}, ${process.env.SOLR_PORT}, ${process.env.SOLR_CORE}`);
  return solr.createClient({
    host: process.env.SOLR_HOST,
    port: process.env.SOLR_PORT,
    core: process.env.SOLR_CORE,
  });
};
