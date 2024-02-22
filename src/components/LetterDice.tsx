import { Devvit } from '@devvit/public-api';

interface LetterDiceProps {
  letter: string;
  onPress?: () => void;
  selected?: boolean;
  correct?: boolean;
}

export function LetterDice({
  letter,
  selected,
  onPress,
  correct,
}: LetterDiceProps) {
  return (
    <vstack
      border="thick"
      borderColor={correct ? '#65b200' : selected ? '#FF4500' : '#e5e8ef'}
      onPress={() => {
        if (onPress) return onPress();
      }}
      padding="small"
      cornerRadius="medium"
      backgroundColor="#e5e8ef"
      grow
    >
      <vstack
        cornerRadius="full"
        backgroundColor="#ffffff"
        padding="small"
        grow
      >
        <text
          selectable={true}
          size="xlarge"
          style={selected ? 'heading' : 'body'}
          color="#403e91"
          alignment="center"
        >
          {letter}
        </text>
      </vstack>
    </vstack>
  );
}

export function SmallLetterDice({ letter }: { letter: string }) {
  return (
    <vstack
      cornerRadius="small"
      backgroundColor="#ffffff"
      alignment="middle center"
      padding="small"
    >
      <text color="#403e91" alignment="middle center">
        {letter}
      </text>
    </vstack>
  );
}
