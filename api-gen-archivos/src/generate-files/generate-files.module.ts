import { Module } from '@nestjs/common';
import { GenerateFilesService } from './generate-files.service';
import { GenerateFilesController } from './generate-files.controller';
import { SolrModule } from 'src/solr/solr.module';

@Module({
  controllers: [GenerateFilesController],
  providers: [GenerateFilesService],
  exports: [GenerateFilesService],
  imports: [SolrModule]
})
export class GenerateFilesModule {}
