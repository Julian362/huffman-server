import { Module } from '@nestjs/common';
import { HuffmanController } from './huffman.controller';
import { HuffmanService } from './huffman.service';

@Module({
  imports: [],
  controllers: [HuffmanController],
  providers: [HuffmanService],
})
export class AppModule {}
