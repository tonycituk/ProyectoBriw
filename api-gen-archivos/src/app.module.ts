import { Module } from '@nestjs/common';
import { GenerateFilesModule } from './generate-files/generate-files.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SolrService } from './solr/solr.service';
import { createSolrClient } from './solr/config/solr.config';
import { SolrModule } from './solr/solr.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    GenerateFilesModule,
    SolrModule,
  ],
  providers: [],
})
export class AppModule {}
