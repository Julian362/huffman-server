import { Injectable } from '@nestjs/common';

@Injectable()
export class HuffmanService {
  // coloca en un mapa la frecuencia de cada carácter
  private characterFrequencies(text: string): Map<string, number> {
    // crea un mapa vacío para guardar las frecuencias de cada carácter del texto, con la estructura Map<carácter, frecuencia>
    const frequencies = new Map<string, number>();

    // recorre cada carácter del texto
    for (const character of text) {
      // obtiene la frecuencia del carácter actual, o 0 si no existe
      const frequency = frequencies.get(character) || 0;
      // incrementa la frecuencia del carácter actual
      frequencies.set(character, frequency + 1);
    }
    // retorna el mapa con las frecuencias de cada carácter
    return frequencies;
  }

  // construye el árbol de Huffman a partir de las frecuencias de cada carácter
  private buildHuffmanTree(
    frequencies: Map<string, number>,
  ): HuffmanNode | null {
    // crea un arreglo con los nodos iniciales, cada uno con un carácter y su frecuencia
    const nodes = Array.from(
      frequencies,
      ([character, frequency]) => new HuffmanNode(character, frequency),
    );

    // mientras haya más de un nodo en el arreglo
    while (nodes.length > 1) {
      // ordena los nodos por su frecuencia de menor a mayor
      nodes.sort((a, b) => a.frequency - b.frequency);

      // esto se hace para que se saquen los dos primeros nodos del arreglo en el orden correcto (el de menor frecuencia primero)
      // obtiene los dos primeros nodos del arreglo
      const node1 = nodes.shift()!;
      // obtiene el primer elemento del arreglo y lo elimina del arreglo
      const node2 = nodes.shift()!;

      // crea un nuevo nodo con los dos nodos anteriores como hijos y con la suma de sus frecuencias
      const newNode = new HuffmanNode(
        undefined,
        node1.frequency + node2.frequency,
      );

      // asigna los nodos como hijos del nuevo nodo
      newNode.left = node1;
      // el signo de exclamación al final de la línea es para indicarle a TypeScript que el valor no puede ser nulo
      newNode.right = node2;

      // agrega el nuevo nodo al arreglo
      nodes.push(newNode);
    }

    // retorna el único nodo que queda en el arreglo, o null si no hay nodos
    return nodes[0] || null;
  }

  // construye una tabla con los códigos de cada carácter a partir del árbol de Huffman
  private buildCodeTable(
    root: HuffmanNode,
    prefix: string = '',
  ): Map<string, string> {
    // crea un mapa vacío para guardar los códigos de cada carácter, con la estructura Map<carácter, código>
    let codeTable = new Map<string, string>();

    // si el nodo actual tiene un carácter, lo agrega al mapa con su código
    if (root.character !== undefined) {
      codeTable.set(prefix, root.character);
    }

    // si el nodo actual tiene un hijo izquierdo, agrega sus códigos al mapa
    if (root.left) {
      // crea un nuevo mapa con los códigos del hijo izquierdo, agregando un 0 al prefijo
      codeTable = new Map([
        ...codeTable,
        ...this.buildCodeTable(root.left, prefix + '0'),
      ]);
    }

    // si el nodo actual tiene un hijo derecho, agrega sus códigos al mapa
    if (root.right) {
      // crea un nuevo mapa con los códigos del hijo derecho, agregando un 1 al prefijo
      codeTable = new Map([
        ...codeTable,
        ...this.buildCodeTable(root.right, prefix + '1'),
      ]);
    }

    // retorna el mapa con los códigos de cada carácter
    return codeTable;
  }

  // comprime un texto usando el algoritmo de Huffman
  compress(text: string): {
    compressedText: string;
    codeTable: Map<string, string>;
  } {
    // obtiene las frecuencias de cada carácter del texto
    const frequencies = this.characterFrequencies(text);
    // construye el árbol de Huffman a partir de las frecuencias de cada carácter
    const huffmanTree = this.buildHuffmanTree(frequencies);

    // si no se pudo construir el árbol de Huffman, lanza un error
    if (!huffmanTree) {
      throw new Error('Error building Huffman tree.');
    }

    // construye una tabla con los códigos de cada carácter a partir del árbol de Huffman
    const codeTable = this.buildCodeTable(huffmanTree);

    // comprime el texto usando la tabla de códigos
    const compressedText = this.compressText(text, codeTable);

    // retorna el texto comprimido y la tabla de códigos
    return { compressedText, codeTable };
  }

  // invierte un mapa, intercambiando las llaves y los valores
  private invertMap(originalMap: Map<string, string>): Map<string, string> {
    const invertedMap = new Map<string, string>();
    originalMap.forEach((value, key) => {
      invertedMap.set(value, key);
    });
    return invertedMap;
  }

  // comprime un texto usando una tabla de códigos
  private compressText(text: string, codeTable: Map<string, string>): string {
    let compressedText = '';
    // invierte la tabla de códigos, intercambiando las llaves y los valores para poder buscar los códigos por carácter
    codeTable = this.invertMap(codeTable);
    // recorre cada carácter del texto
    for (const character of text) {
      // busca el código del carácter actual en la tabla de códigos
      const code = codeTable.get(character);
      // si no se encontró el código, lanza un error
      if (code !== undefined) {
        // agrega el código al texto comprimido
        compressedText += code;
      }
    }
    // retorna el texto comprimido
    return compressedText;
  }

  // descomprime un texto usando una tabla de códigos
  decompress(compressedText: string, codeTable: Map<string, string>): string {
    let decompressedText = '';
    let currentCode = '';
    // recorre cada bit del texto comprimido
    for (const bit of compressedText) {
      // agrega el bit al código actual
      currentCode += bit;
      // busca el código actual en la tabla de códigos
      if (codeTable.get(currentCode)) {
        // si se encontró el código, agrega el carácter correspondiente al texto descomprimido
        decompressedText += codeTable.get(currentCode)!;
        // reinicia el código actual
        currentCode = '';
      }
    }

    // retorna el texto descomprimido
    return decompressedText;
  }
}

//clase para representar un nodo del árbol de Huffman
class HuffmanNode {
  // los hijos izquierdo y derecho pueden ser nulos
  left: HuffmanNode | null = null;
  right: HuffmanNode | null = null;

  // el carácter puede ser nulo
  constructor(
    public character: string | undefined,
    public frequency: number,
  ) {}
}
