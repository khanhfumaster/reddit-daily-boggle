export interface BoggleGame {
  id: string;
  board: string[][];
  date: string;
  boardSize: number;
}

const diceConfig: { [gridSize: number]: string[] } = {
  4: [
    'AAEEGN',
    'ELRTTY',
    'AOOTTW',
    'ABBJOO',
    'EHRTVW',
    'CIMOTU',
    'DISTTY',
    'EIOSST',
    'DELRVY',
    'ACHOPS',
    'HIMNQU',
    'EEINSU',
    'EEGHNW',
    'AFFKPS',
    'HLNNRZ',
    'DEILRX',
  ],
  5: [
    'AAAFRS',
    'AAEEEE',
    'AAFIRS',
    'ADENNN',
    'AEEEEM',
    'AEEGMU',
    'AEGMNN',
    'AFIRSY',
    'BJKQXZ',
    'CCNSTW',
    'CEIILT',
    'CEILPT',
    'CEIPST',
    'DHHNOT',
    'DHHLOR',
    'DHLNOR',
    'DDLNOR',
    'EIIITT',
    'EMOTTT',
    'ENSSSU',
    'FIPRSY',
    'GORRVW',
    'HIPRRY',
    'NOOTUW',
    'OOOTTU',
  ],
};

export function generateBoard(n: number) {
  // Boggle dice distribution (English version, 16 dice, each die has 6 faces)
  const dice = diceConfig[n];

  if (!dice) {
    throw new Error('Unsupported grid size');
  }

  // Shuffle dice to simulate rolling and placement on the board
  for (let i = dice.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [dice[i], dice[j]] = [dice[j], dice[i]];
  }

  const board = [];
  let diceIndex = 0; // Keep track of the dice being used

  for (let i = 0; i < n; i++) {
    const row = [];
    for (let j = 0; j < n; j++) {
      if (diceIndex < dice.length) {
        // Select a random face of the die
        const dieFaces = dice[diceIndex];
        const randomFace =
          dieFaces[Math.floor(Math.random() * dieFaces.length)];
        row.push(randomFace);
        diceIndex++;
      } else {
        // If there are more board cells than dice, just repeat the shuffle and selection process
        // This is not standard for Boggle but allows for boards larger than 4x4
        diceIndex = 0; // Reset index to reuse dice for larger boards
        const dieFaces = dice[diceIndex];
        const randomFace =
          dieFaces[Math.floor(Math.random() * dieFaces.length)];
        row.push(randomFace);
        diceIndex++;
      }
    }
    board.push(row);
  }

  return board;
}

export function generateBoggleGame(n: number): BoggleGame {
  const board = generateBoard(n);
  return {
    id: Math.random().toString(36).substring(7),
    board: board,
    date: new Date().toISOString(),
    boardSize: n,
  };
}

export function wordToPoints(word: string): number {
  switch (word.length) {
    case 0:
    case 1:
    case 2:
      return 0;
    case 3:
    case 4:
      return 1;
    case 5:
      return 2;
    case 6:
      return 3;
    case 7:
      return 5;
    default:
      return 11;
  }
}
