export type TaskType =
  | "timed_focus"
  | "code_challenge"
  | "draw"
  | "journal"
  | "language_quiz"
  | "article"
  | "sudoku";

export interface FocusOption {
  minutes: number;
}

export const FOCUS_OPTIONS: FocusOption[] = [
  { minutes: 5 },
  { minutes: 10 },
  { minutes: 15 },
];

// --- Draw ---
// Reward is time-based, not flat: every minute actually spent drawing
// earns this many minutes of unlock. Deliberately low — unlike Sudoku,
// the language quiz, articles, or code challenges, there's no real way
// to verify a drawing is genuine effort rather than idle scribbling, so
// this is intentionally the weakest-paying option, not the best one.
export const DRAW_REWARD_PER_MINUTE = 2;
// Counted drawing time caps here, so leaving the screen open passively
// doesn't inflate the reward — has to be spent actually drawing. Kept
// short so Draw's ceiling stays well under what a genuinely verified
// task (like a hard Sudoku) pays out.
export const DRAW_MAX_COUNTED_SECONDS = 5 * 60;
// Must draw for at least this long before claiming.
export const DRAW_MIN_SECONDS = 60;
// Minimum total points drawn across all strokes before a doodle counts as
// "actually drawn something" rather than one stray tap.
export const DRAW_MIN_POINTS = 40;
// Anti-abuse: this is the easiest task to spam for free unlock time, so
// it's rate-limited — a handful of uses a day, with a cooldown in between,
// rather than something you could loop indefinitely.
export const DRAW_MAX_USES_PER_DAY = 4;
export const DRAW_COOLDOWN_MINUTES = 30;

export const DRAW_PROMPTS = [
  "a cube",
  "a sphere",
  "a cylinder",
  "a cone",
  "a pyramid",
  "a rounded cube",
  "a simple house",
  "a five-point star",
];

// --- Journal ---
export const JOURNAL_REWARD_MINUTES = 5;
export const JOURNAL_MIN_WORDS = 40;
export const JOURNAL_PROMPTS = [
  "What's one thing on your mind right now?",
  "What went well today, even something small?",
  "What's something you're avoiding, and why?",
  "What would make tomorrow feel like a win?",
];

// --- Language quiz ---
export const LANGUAGE_REWARD_MINUTES = 5;
export const LANGUAGE_PASS_THRESHOLD = 3; // out of QUIZ_LENGTH

export interface VocabWord {
  word: string;
  translation: string;
  language: string;
}

const SPANISH_WORDS: VocabWord[] = [
  { word: "el libro", translation: "the book", language: "Spanish" },
  { word: "el tiempo", translation: "the weather / time", language: "Spanish" },
  { word: "aprender", translation: "to learn", language: "Spanish" },
  { word: "el trabajo", translation: "the work", language: "Spanish" },
  { word: "la mañana", translation: "the morning", language: "Spanish" },
  { word: "el sueño", translation: "the dream / sleep", language: "Spanish" },
  { word: "cambiar", translation: "to change", language: "Spanish" },
  { word: "el camino", translation: "the path / road", language: "Spanish" },
];

export function buildLanguageQuiz(length = 5): { word: VocabWord; options: string[] }[] {
  const pool = [...SPANISH_WORDS].sort(() => Math.random() - 0.5).slice(0, length);
  return pool.map((word) => {
    const distractors = SPANISH_WORDS.filter((w) => w.word !== word.word)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map((w) => w.translation);
    const options = [...distractors, word.translation].sort(() => Math.random() - 0.5);
    return { word, options };
  });
}

// --- Read an article ---
export const ARTICLE_REWARD_MINUTES = 5;

export interface Article {
  id: string;
  title: string;
  body: string;
  question: string;
  options: string[];
  correctIndex: number;
}

export const ARTICLES: Article[] = [
  {
    id: "habit-loop",
    title: "The habit loop",
    body: "Every habit runs on the same three-step loop: a cue, a routine, and a reward. Doomscrolling is a habit like any other — the cue might be boredom or a notification, the routine is opening the app, and the reward is a small hit of novelty. You can't easily delete a habit loop, but you can swap the routine while keeping the same cue and reward. That's the whole idea behind trading scroll time for something else: same trigger, same craving for stimulation, different action in between.",
    question: "According to the passage, what are the three parts of a habit loop?",
    options: ["Cue, routine, reward", "Trigger, action, guilt", "Boredom, phone, scroll", "Notification, app, novelty"],
    correctIndex: 0,
  },
  {
    id: "focus-cost",
    title: "The cost of switching",
    body: "Every time you switch tasks — say, from writing to checking a notification — your brain doesn't switch instantly. Researchers call the lag 'attention residue': part of your focus stays stuck on the old task for minutes afterward. A quick 30-second phone check can cost several minutes of real focus recovery, not 30 seconds. That's why short, frequent scroll breaks are far more costly to deep work than one longer break at a natural stopping point.",
    question: "What does 'attention residue' mean, per the passage?",
    options: [
      "Part of your focus stays on the old task after switching",
      "Notifications residue on your lock screen",
      "The 30 seconds a phone check takes",
      "A technique for improving memory",
    ],
    correctIndex: 0,
  },
  {
    id: "compounding",
    title: "Small and often beats big and rare",
    body: "Ten minutes a day for a month is five hours of practice. That's not a lot in one sitting, but it's enough to notice real progress on a new skill — a handful of songs on guitar, a solid grasp of basic vocabulary, or a working habit of daily writing. The advantage of small daily sessions isn't the total time, it's that showing up daily builds the habit itself, which is what makes the next month easier than the first.",
    question: "What does the passage say is the real advantage of small daily sessions?",
    options: [
      "They build the habit itself, making it easier to continue",
      "They take less total time than one big session",
      "They require less willpower than doomscrolling",
      "They always beat professional training",
    ],
    correctIndex: 0,
  },
];

export interface CodeProblem {
  id: string;
  title: string;
  difficulty: "easy" | "medium" | "hard";
  rewardMinutes: number;
  prompt: string;
  starterCode: string;
  // Judge0 language ID for JavaScript (Node.js).
  languageId: number;
  // stdin fed to the program, and the exact stdout it must produce.
  stdin: string;
  expectedOutput: string;
}

// JavaScript (Node.js) on Judge0.
const JS_LANGUAGE_ID = 63;

export const CODE_PROBLEMS: CodeProblem[] = [
  {
    id: "sum-two",
    title: "Sum two numbers",
    difficulty: "easy",
    rewardMinutes: 5,
    prompt:
      "Read two integers from stdin (space-separated) and print their sum.\n\nExample: input \"2 3\" -> output \"5\"",
    starterCode: `const [a, b] = require('fs').readFileSync(0, 'utf8').trim().split(' ').map(Number);\nconsole.log(a + b);\n`,
    languageId: JS_LANGUAGE_ID,
    stdin: "4 7",
    expectedOutput: "11",
  },
  {
    id: "reverse-string",
    title: "Reverse a string",
    difficulty: "easy",
    rewardMinutes: 5,
    prompt: "Read a line from stdin and print it reversed.\n\nExample: input \"abc\" -> output \"cba\"",
    starterCode: `const s = require('fs').readFileSync(0, 'utf8').trim();\nconsole.log(s.split('').reverse().join(''));\n`,
    languageId: JS_LANGUAGE_ID,
    stdin: "instead",
    expectedOutput: "daetsni",
  },
  {
    id: "fizzbuzz-count",
    title: "FizzBuzz count",
    difficulty: "medium",
    rewardMinutes: 10,
    prompt:
      "Read an integer N from stdin. Print how many numbers from 1 to N are divisible by 3 or 5.",
    starterCode: `const n = Number(require('fs').readFileSync(0, 'utf8').trim());\nlet count = 0;\nfor (let i = 1; i <= n; i++) if (i % 3 === 0 || i % 5 === 0) count++;\nconsole.log(count);\n`,
    languageId: JS_LANGUAGE_ID,
    stdin: "30",
    expectedOutput: "14",
  },
];

// --- Sudoku ---
// A real, objectively-checkable puzzle — the "clear the puzzle to earn
// the time" task, since it's genuinely gradeable (unlike drawing).
export interface SudokuPuzzle {
  id: string;
  label: string;
  difficulty: "easy" | "hard";
  rewardMinutes: number;
  // 9x9, 0 = blank cell to fill in.
  grid: number[][];
}

export const SUDOKU_PUZZLES: SudokuPuzzle[] = [
  {
    id: "warm-up",
    label: "Warm-up",
    difficulty: "easy",
    rewardMinutes: 5,
    grid: [
      [5, 3, 4, 6, 7, 0, 9, 1, 2],
      [6, 7, 0, 1, 9, 5, 3, 4, 8],
      [1, 0, 8, 3, 4, 2, 5, 6, 0],
      [8, 5, 9, 0, 6, 1, 4, 0, 3],
      [4, 0, 6, 8, 0, 3, 0, 9, 1],
      [7, 1, 0, 9, 2, 0, 8, 5, 6],
      [0, 6, 1, 5, 0, 7, 2, 8, 0],
      [2, 8, 0, 4, 1, 0, 6, 3, 5],
      [3, 4, 5, 0, 8, 6, 1, 0, 9],
    ],
  },
  {
    id: "classic",
    label: "Classic",
    difficulty: "hard",
    rewardMinutes: 15,
    grid: [
      [5, 3, 0, 0, 7, 0, 0, 0, 0],
      [6, 0, 0, 1, 9, 5, 0, 0, 0],
      [0, 9, 8, 0, 0, 0, 0, 6, 0],
      [8, 0, 0, 0, 6, 0, 0, 0, 3],
      [4, 0, 0, 8, 0, 3, 0, 0, 1],
      [7, 0, 0, 0, 2, 0, 0, 0, 6],
      [0, 6, 0, 0, 0, 0, 2, 8, 0],
      [0, 0, 0, 4, 1, 9, 0, 0, 5],
      [0, 0, 0, 0, 8, 0, 0, 7, 9],
    ],
  },
];

export interface CompletedTask {
  id: string;
  type: TaskType;
  completedAt: string;
  rewardMinutes: number;
  label: string;
}
