import { Injectable } from '@nestjs/common';

@Injectable()
export class HuffmanService {
  private characterFrequencies(text: string): Map<string, number> {
    const frequencies = new Map<string, number>();
    for (const character of text) {
      const frequency = frequencies.get(character) || 0;
      frequencies.set(character, frequency + 1);
    }
    return frequencies;
  }

  private buildHuffmanTree(
    frequencies: Map<string, number>,
  ): HuffmanNode | null {
    const nodes = Array.from(
      frequencies,
      ([character, frequency]) => new HuffmanNode(character, frequency),
    );

    while (nodes.length > 1) {
      nodes.sort((a, b) => a.frequency - b.frequency);

      const node1 = nodes.shift()!;
      const node2 = nodes.shift()!;

      const newNode = new HuffmanNode(
        undefined,
        node1.frequency + node2.frequency,
      );
      newNode.left = node1;
      newNode.right = node2;

      nodes.push(newNode);
    }

    return nodes[0] || null;
  }

  private buildCodeTable(
    root: HuffmanNode,
    prefix: string = '',
  ): Map<string, string> {
    let codeTable = new Map<string, string>();
    if (root.character !== undefined) {
      codeTable.set(prefix, root.character);
    }

    if (root.left) {
      codeTable = new Map([
        ...codeTable,
        ...this.buildCodeTable(root.left, prefix + '0'),
      ]);
    }

    if (root.right) {
      codeTable = new Map([
        ...codeTable,
        ...this.buildCodeTable(root.right, prefix + '1'),
      ]);
    }

    return codeTable;
  }

  compress(text: string): {
    compressedText: string;
    codeTable: Map<string, string>;
  } {
    const frequencies = this.characterFrequencies(text);
    const huffmanTree = this.buildHuffmanTree(frequencies);
    if (!huffmanTree) {
      throw new Error('Error building Huffman tree.');
    }

    const codeTable = this.buildCodeTable(huffmanTree);
    const compressedText = this.compressText(text, codeTable);

    return { compressedText, codeTable };
  }

  private invertMap(originalMap: Map<string, string>): Map<string, string> {
    const invertedMap = new Map<string, string>();
    originalMap.forEach((value, key) => {
      invertedMap.set(value, key);
    });
    return invertedMap;
  }

  private compressText(text: string, codeTable: Map<string, string>): string {
    let compressedText = '';
    codeTable = this.invertMap(codeTable);
    for (const character of text) {
      const code = codeTable.get(character);
      if (code !== undefined) {
        compressedText += code;
      }
    }

    return compressedText;
  }

  decompress(compressedText: string, codeTable: Map<string, string>): string {
    let decompressedText = '';
    let currentCode = '';
    for (const bit of compressedText) {
      currentCode += bit;
      if (codeTable.get(currentCode)) {
        decompressedText += codeTable.get(currentCode)!;
        currentCode = '';
      }
    }

    return decompressedText;
  }
}

class HuffmanNode {
  left: HuffmanNode | null = null;
  right: HuffmanNode | null = null;

  constructor(
    public character: string | undefined,
    public frequency: number,
  ) {}
}
