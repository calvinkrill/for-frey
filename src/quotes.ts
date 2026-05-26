export interface ComfortQuote {
  id: string;
  text: string;
  subtext: string;
}

export const FREY_QUOTES: ComfortQuote[] = [
  {
    id: "q1",
    text: "Frey, you don't have to carry the weight of being strong right now. It is completely okay to feel sad and tired.",
    subtext: "Your tears are not a weakness. They show how deeply you care and how hard you tried."
  },
  {
    id: "q2",
    text: "Your soft heart is hurt, Frey, and it deserves gentle love, not rushed fixes.",
    subtext: "Take all the time you need. No one is rushing you to feel better. Healing has no timetable."
  },
  {
    id: "q3",
    text: "Even in the darkest times, your heart is a safe and beautiful place, Frey.",
    subtext: "Let the noisy world fade away. Right here, in this quiet light, you are completely safe."
  },
  {
    id: "q4",
    text: "Frey, you are enough. Not because of what you can do for others—but simply because of who you are.",
    subtext: "You are worthy, beautiful, and so precious just the way you are."
  },
  {
    id: "q5",
    text: "Take a slow, deep breath, Frey. You got through today. That is a very big win.",
    subtext: "Do not worry about tomorrow. Tomorrow has not happened yet. Just focus on this single breath."
  },
  {
    id: "q6",
    text: "I am here with you, Frey. You do not have to carry this heavy and quiet feeling alone.",
    subtext: "Close your eyes if you want. Let this soft pink light remind you that you are loved."
  },
  {
    id: "q7",
    text: "The world is softer because you are in it, Frey.",
    subtext: "Your mind may feel very noisy right now, but underneath it all, you are so precious."
  },
  {
    id: "q8",
    text: "Feelings are like clouds in the sky, Frey. They are very heavy now, but they will pass.",
    subtext: "Let the clouds drift by. The clear sky behind them is always waiting for you."
  },
  {
    id: "q9",
    text: "It is okay to sit in the quiet dark for a little while, Frey. You do not have to force a smile.",
    subtext: "Rest is a way of moving forward. Let your tired mind rest tonight."
  },
  {
    id: "q10",
    text: "Frey, your feelings are normal and real. Your pain deserves to be held with absolute gentleness.",
    subtext: "I hear you, and I am here for you."
  }
];

export const OFFLINE_LETTERS: Record<string, { title: string; paragraphs: string[] }> = {
  "gentle-reminder": {
    title: "A Gentle Reminder of Your Light",
    paragraphs: [
      "Dearest Frey,",
      "I know your heart feels very tired, heavy, and broken right now. Sometimes the world is too loud, and you feel like you are falling apart in the quiet. I want to remind you of something very important: you do not have to be okay today.",
      "You are allowed to feel tired. You are allowed to get into bed and cry. Your soft heart is not broken or wrong; it is beautiful and precious. The gentle way you feel things is what makes you so wonderful.",
      "Be sweet to yourself, Frey. You do not need to fix everything all at once. Just breathe, and know that sitting here in this warm pink light, you are safe and loved.",
      "With cozy warmth,\nYour Safe Space"
    ]
  },
  "warm-embrace": {
    title: "A Cozy Hug for You",
    paragraphs: [
      "Dear Frey,",
      "If I could wrap you in a soft blanket of warm stars right now, I would. Close your eyes for a moment and imagine a beautiful, quiet place under the night sky. Safe, warm, and peaceful. No one wants anything from you here.",
      "You are safe here. Let your shoulders relax. Let your jaw relax. Let your hands go soft. You have been holding on for so long. It is okay to stop trying so hard right now. We are holding you up.",
      "You are safe, you are protected, and you are cared for. Rest your tired mind in this pink warmth, Frey. You are not alone.",
      "Sending you silent love,\nYour Glow of Peace"
    ]
  },
  "midnight-whisper": {
    title: "A Soft Whisper at Night",
    paragraphs: [
      "My dear Frey,",
      "When the night feels very long and your mind cannot stop worrying, I want to whisper these words to you. You are loved. You are real. You are doing so well, even when you feel like you are barely getting by.",
      "Every broken part of you is still beautiful. The pain you carry is hard, but it is okay to feel it. We can sit with it together in the quiet.",
      "I hope you can feel the soft pulsing of this screen as if it is my hand gently holding yours. Sleep well when you can, or just rest in the quiet. I am always here for you.",
      "Holding your hand in the quiet,\nYour Eternal Comfort"
    ]
  }
};

export const OFFLINE_POEM = `In the quiet of the night,
The stars are glowing soft and pink,
To watch you, Frey, with gentle light,
And give you space to rest and think.

You do not have to be so brave,
You do not have to fight the storm,
Just float upon the gentle wave,
And let this pink light keep you warm.

The sun will rise when it is time,
But for tonight, just rest your head.
In this sweet place of peace and chime,
You are loved, and safe in bed.`;
