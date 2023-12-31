import { Body, Controller, Get, Post } from '@nestjs/common';
import { HuffmanService } from './huffman.service';

@Controller('huffman')
export class HuffmanController {
  constructor(private readonly huffmanService: HuffmanService) {}

  private codeTable: Map<string, string> = new Map<string, string>();

  @Post('compress')
  compressText(@Body('text') text: string): {
    compressedText: string;
    table: string;
  } {
    const result = this.huffmanService.compress(text);
    this.codeTable = result.codeTable;
    //code table to JSON
    const mapArray: [string, string][] = Array.from(this.codeTable);

    // Serialize the array to JSON
    const jsonResult = JSON.stringify(mapArray);
    return {
      compressedText: result.compressedText,
      table: jsonResult,
    };
  }

  @Post('decompress')
  decompressText(@Body('compressedText') compressedText: string): string {
    return JSON.stringify(
      this.huffmanService.decompress(compressedText, this.codeTable),
    );
  }

  @Get('dictionary')
  getDictionary(): string {
    const mapArray: [string, string][] = Array.from(this.codeTable);
    return JSON.stringify(mapArray);
  }
}
