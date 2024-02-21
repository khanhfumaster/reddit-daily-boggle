import { Devvit } from '@devvit/public-api';
import { BoggleBoard } from './components/BoggleBoard.js';
import { generateBoggleGame } from './game/boggle.js';
import { Scoreboard, getScoreboard, updateScore } from './api/scoreboard.js';
import { LetterDice } from './components/LetterDice.js';

Devvit.configure({
  redditAPI: true,
  redis: true,
});

Devvit.addMenuItem({
  label: 'Create daily boggle',
  forUserType: 'moderator',
  location: 'subreddit',
  onPress: async (event, context) => {
    const subreddit = await context.reddit.getCurrentSubreddit();

    await createDailyBogglePost(context, subreddit.name);

    context.ui.showToast('Daily boggle created');
  },
});

Devvit.addMenuItem({
  label: 'Start daily boggle',
  forUserType: 'moderator',
  location: 'subreddit',
  onPress: async (event, context) => {
    const jobs = await context.scheduler.listJobs();

    if (jobs.some((job) => job.name === 'daily-boggle-create')) {
      context.ui.showToast('Daily boggle already running');
      return;
    }

    const subreddit = await context.reddit.getCurrentSubreddit();

    await context.scheduler.runJob({
      name: 'daily-boggle-create',
      cron: '0 6 * * *',
      data: {
        subredditName: subreddit.name,
      },
    });

    context.ui.showToast('Daily boggle started');
  },
});

Devvit.addMenuItem({
  label: 'Stop daily boggle',
  forUserType: 'moderator',
  location: 'subreddit',
  onPress: async (_, context) => {
    const jobs = await context.scheduler.listJobs();

    const job = jobs.find((job) => job.name === 'daily-boggle-create');

    if (!job) {
      context.ui.showToast('No daily boggle running');
      return;
    }

    await context.scheduler.cancelJob(job.id);
  },
});

const devModeGame = generateBoggleGame(5);

Devvit.addCustomPostType({
  name: 'Daily Boggle',
  height: 'tall',
  render: async (context) => {
    const [boggleGame] = context.useState<any>(async () => {
      const boggleGameString = await context.redis.get(
        `boggle:${context.postId}`
      );

      if (!boggleGameString) {
        return devModeGame;
      }

      return JSON.parse(boggleGameString);
    });

    const [wordList] = context.useState<string[]>(async () => {
      const wordListString = await context.redis.get(
        `boggle:${context.postId}:userWords:${context.userId}`
      );

      if (!wordListString) {
        return [];
      }

      return JSON.parse(wordListString);
    });

    const [scoreboard, setScoreboard] = context.useState<Scoreboard>(
      async () => {
        const _scoreboard = await getScoreboard(context, context.postId!);

        if (!_scoreboard) {
          return {};
        }

        return _scoreboard;
      }
    );

    const updateScoreboard = async (newScore: number) => {
      const newScoreboard = await updateScore(
        context,
        context.postId!,
        context.userId!,
        newScore
      );
      setScoreboard(newScoreboard);
    };

    return (
      <BoggleBoard
        boggleGame={boggleGame}
        initialWordList={wordList}
        scoreboard={scoreboard}
        updateScoreboard={updateScoreboard}
      />
    );
  },
});

const loadingBoard = [
  ['D', 'A', 'I', 'L', 'Y'],
  ['B', 'O', 'G', 'G', 'L'],
  ['E', ' ', 'I', 'S', ''],
  ['L', 'O', 'A', 'D', 'I'],
  ['N', 'G', '.', '.', '.'],
];

Devvit.addSchedulerJob({
  name: 'daily-boggle-create',
  onRun: async (event, context) => {
    if (!event.data?.subredditName) {
      return;
    }

    return createDailyBogglePost(context, event.data?.subredditName);
  },
});

async function createDailyBogglePost(
  context: Devvit.Context,
  subredditName: string
) {
  let gameNumber = 1;
  const gameCountString = await context.redis.get(
    `boggle:gameCount:${subredditName}`
  );

  if (gameCountString) {
    gameNumber = parseInt(gameCountString, 10) + 1;
  }

  const boggleGame = generateBoggleGame(5);

  const post = await context.reddit.submitPost({
    preview: (
      <blocks>
        <vstack
          width={'100%'}
          height="100%"
          alignment="center middle"
          padding="medium"
        >
          <vstack width={'100%'} height="100%">
            <vstack
              cornerRadius="medium"
              padding="medium"
              backgroundColor="#2e3a8e"
              gap="small"
            >
              {loadingBoard.map((row, y) => (
                <hstack gap="small">
                  {row.map((letter, x) => (
                    <LetterDice letter={letter}></LetterDice>
                  ))}
                </hstack>
              ))}
            </vstack>
          </vstack>
        </vstack>
      </blocks>
    ),
    title: `Daily boggle #${gameNumber}`,
    subredditName,
  });

  await Promise.all([
    context.redis.set(`boggle:${post.id}`, JSON.stringify(boggleGame)),
    context.redis.set(
      `boggle:gameCount:${subredditName}`,
      gameNumber.toString()
    ),
  ]);
}

export default Devvit;
