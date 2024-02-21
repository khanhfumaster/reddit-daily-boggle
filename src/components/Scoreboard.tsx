import { Devvit } from '@devvit/public-api';
import {
  Scoreboard as ScoreboardType,
  getScoreboard,
} from '../api/scoreboard.js';
import { Colors } from '../constants/colors.js';

export const Scoreboard: Devvit.BlockComponent<{
  scoreboard: ScoreboardType;
  closeScoreboard: () => void;
}> = ({ scoreboard, closeScoreboard }, context) => {
  const sortedScoreboard = Object.entries(scoreboard).sort(
    (a, b) => b[1].score - a[1].score
  );

  const topTenScores = sortedScoreboard.slice(0, 10);

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
          <text color="#403e91" alignment="middle center">
            Scoreboard - Top 10
          </text>
        </vstack>

        <hstack width="20%" grow alignment="center middle">
          <button onPress={() => closeScoreboard()}>x</button>
        </hstack>
      </hstack>

      <vstack width={'100%'} grow>
        <vstack
          grow
          cornerRadius="medium"
          padding="small"
          backgroundColor={Colors.boggleBoard}
          gap="small"
        >
          {topTenScores.map(([userId, data], index) => (
            <vstack>
              <hstack padding="small" gap="medium">
                <hstack gap="medium" grow>
                  <text color="#FFFFFF" size="medium">
                    {getRankFromIndex(index)}
                  </text>
                  <text color="#FFFFFF" size="medium">
                    u/{data.username}
                  </text>
                </hstack>

                <text color="#FFFFFF" size="medium">
                  {data.score}
                </text>
              </hstack>
            </vstack>
          ))}
        </vstack>
      </vstack>
    </vstack>
  );
};

function getRankFromIndex(index: number): string {
  switch (index) {
    case 0:
      return '🥇 ';
    case 1:
      return '🥈 ';
    case 2:
      return '🥉 ';
    default:
      return `${index + 1}th `;
  }
}
