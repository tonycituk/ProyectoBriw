import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SolrService } from './solr.service';
import { createSolrClient } from './config/solr.config';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'SOLR_CLIENT',
      useFactory: (configService: ConfigService) =>
        createSolrClient(configService),
      inject: [ConfigService],
    },
    SolrService,
  ],
  exports: [SolrService],
})
export class SolrModule {}
