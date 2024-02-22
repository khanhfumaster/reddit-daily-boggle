import { Devvit } from '@devvit/public-api';
import { Colors } from '../constants/colors.js';
import { LetterDice, SmallLetterDice } from './LetterDice.js';
import { trie } from '../game/trie.js';
import { BoggleGame, wordToPoints } from '../game/boggle.js';
import { updateScore } from '../api/scoreboard.js';
import { Scoreboard } from './Scoreboard.js';
import { Scoreboard as ScoreboardType } from '../api/scoreboard.js';

export interface BoggleBoardProps {
  boggleGame: BoggleGame;
  initialWordList: string[];
  scoreboard: ScoreboardType;
  updateScoreboard: (score: number) => Promise<void>;
  reloadScoreboard: () => Promise<void>;
}

export const BoggleBoard: Devvit.BlockComponent<BoggleBoardProps> = (
  {
    boggleGame,
    initialWordList,
    scoreboard,
    updateScoreboard,
    reloadScoreboard,
  },
  context
) => {
  const [selectedLetters, setSelectedLetters] = context.useState<
    `${number}:${number}`[]
  >([]);

  const [wordList, setWordList] = context.useState<string[]>(initialWordList);

  const [showScoreboard, setShowScoreboard] = context.useState<boolean>(false);

  const [isInvalidWord, setIsInvalidWord] = context.useState<boolean>(false);

  const [isValidWord, setIsValidWord] = context.useState<boolean>(false);

  const onInvalidWord = () => {
    setSelectedLetters([]);
    setIsInvalidWord(true);
  };

  const onClear = () => {
    setSelectedLetters([]);
    setIsInvalidWord(false);
  };

  const onLetterDicePress = async (x: number, y: number) => {
    let newSelectedLetters: `${number}:${number}`[] = [
      ...selectedLetters,
      `${x}:${y}`,
    ];

    if (isValidWord) {
      setIsValidWord(false);
      newSelectedLetters = [`${x}:${y}`];
    } else {
      if (selectedLetters.includes(`${x}:${y}`)) {
        onClear();
        return;
      }

      if (selectedLetters.length > 0) {
        const [lastX, lastY] = selectedLetters[selectedLetters.length - 1]
          .split(':')
          .map((n) => parseInt(n, 10));

        if (Math.abs(x - lastX) > 1 || Math.abs(y - lastY) > 1) {
          onClear();
          return;
        }
      }
    }

    const currentWord = newSelectedLetters
      .map((l) => {
        const [x, y] = l.split(':').map((n) => parseInt(n, 10));
        return boggleGame.board[y][x];
      })
      .join('')
      .toLocaleLowerCase();

    if (trie.startsWith(currentWord)) {
      setIsInvalidWord(false);
    } else {
      onInvalidWord();

      return;
    }

    if (trie.search(currentWord) && !wordList.includes(currentWord)) {
      const newWordList = [...wordList, currentWord];

      const newScore = newWordList.reduce(
        (acc, word) => acc + wordToPoints(word),
        0
      );

      await Promise.all([
        context.scheduler.runJob({
          name: 'update-word-list',
          data: {
            postId: context.postId,
            userId: context.userId,
            wordList: newWordList,
          },
          runAt: new Date(Date.now()),
        }),
        updateScoreboard(newScore),
      ]);

      setWordList(newWordList);
      setIsValidWord(true);
    }

    setSelectedLetters(newSelectedLetters);
  };

  const totalPoints = wordList.reduce(
    (acc, word) => acc + wordToPoints(word),
    0
  );

  const currentWord = selectedLetters
    .map((l) => {
      const [x, y] = l.split(':').map((n) => parseInt(n, 10));
      return `${boggleGame.board[y][x]} `;
    })
    .join('');

  if (showScoreboard) {
    return (
      <Scoreboard
        scoreboard={scoreboard}
        closeScoreboard={() => setShowScoreboard(false)}
      />
    );
  }

  return (
    <vstack
      backgroundColor="#ffffff"
      width={'100%'}
      height={'100%'}
      padding="small"
      gap="small"
    >
      <hstack width="100%" gap="small">
        <vstack
          width="80%"
          alignment="middle center"
          gap="medium"
          cornerRadius="medium"
          border="thick"
          borderColor={Colors.boggleBoard}
        >
          <text
            style={isValidWord ? 'heading' : undefined}
            color={isValidWord ? '#65b200' : '#403e91'}
            alignment="middle center"
          >
            {currentWord}
          </text>
        </vstack>

        <hstack width="20%" grow alignment="center middle">
          <button
            onPress={async () => {
              if (showScoreboard) {
                return setShowScoreboard(false);
              }

              await reloadScoreboard();

              setShowScoreboard(true);
            }}
          >
            {totalPoints}
          </button>
        </hstack>
      </hstack>

      <vstack width={'100%'}>
        <vstack
          cornerRadius="medium"
          padding="medium"
          backgroundColor={Colors.boggleBoard}
          gap="small"
        >
          {boggleGame.board.map((row, y) => (
            <hstack gap="small">
              {row.map((letter, x) => (
                <LetterDice
                  correct={isValidWord && selectedLetters.includes(`${x}:${y}`)}
                  onPress={() => onLetterDicePress(x, y)}
                  letter={letter}
                  selected={selectedLetters.some((l) => l === `${x}:${y}`)}
                ></LetterDice>
              ))}
            </hstack>
          ))}
        </vstack>
      </vstack>

      <vstack
        grow
        width="100%"
        gap="medium"
        cornerRadius="medium"
        padding="small"
        border="thick"
        borderColor={Colors.boggleBoard}
      >
        <text style="metadata" wrap color="#000000">
          {wordList.join(', ').toLocaleUpperCase()}
        </text>
      </vstack>
    </vstack>
  );
};
