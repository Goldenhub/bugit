import { Module } from '@nestjs/common';
import { MetaController } from './meta.controller';
import { BugsModule } from '../bugs/bugs.module';

@Module({
  imports: [BugsModule],
  controllers: [MetaController],
})
export class MetaModule {}
