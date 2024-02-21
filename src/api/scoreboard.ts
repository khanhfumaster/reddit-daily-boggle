import { Devvit } from '@devvit/public-api';

export interface Scoreboard {
  [userId: string]: {
    score: number;
    username: string;
  };
}

export async function getScoreboard(
  context: Devvit.Context,
  postId: string
): Promise<Scoreboard> {
  const scoreboardString = await context.redis.get(
    `boggle:${postId}:scoreboard`
  );

  if (!scoreboardString) {
    return {};
  }

  return JSON.parse(scoreboardString);
}

export async function updateScore(
  context: Devvit.Context,
  postId: string,
  userId: string,
  score: number
) {
  const scoreboard = await getScoreboard(context, postId);

  const user = await context.reddit.getUserById(userId);

  if (!scoreboard[userId]) {
    scoreboard[userId] = {
      score,
      username: user.username,
    };
  } else {
    scoreboard[userId].score = score;
  }

  await context.redis.set(
    `boggle:${postId}:scoreboard`,
    JSON.stringify(scoreboard)
  );

  return scoreboard;
}
