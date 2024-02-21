import { Devvit } from '@devvit/public-api';

export const Word: Devvit.BlockComponent<{ word: string }> = (
  props,
  context
) => {
  return (
    <vstack padding="medium" backgroundColor="#ffffff" cornerRadius="large">
      <text>{props.word}</text>
    </vstack>
  );
};

export const WordsList: Devvit.BlockComponent<{}> = (props, context) => {
  return (
    <vstack padding="medium">
      <hstack gap="medium" alignment="middle">
        <text color="#000000" size="xxlarge" style="heading">
          T
        </text>
        <text color="#000000" size="xxlarge" style="heading">
          E
        </text>
        <text color="#000000" size="xxlarge" style="heading">
          S
        </text>
        <text color="#000000" size="xxlarge" style="heading">
          T
        </text>
        <hstack gap="small">
          <button>→</button>
          <button>🗑️</button>
        </hstack>
      </hstack>
    </vstack>
  );
};
