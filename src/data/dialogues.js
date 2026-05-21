// All dialogue content as data.
// Format: { pages: string[][] }
// Each inner array is one "page" of lines — max 3 lines, ~22 chars each.
// Keep lines oblique, sparse. The mystery does the work.

export const DIALOGUES = {

  // ── Hall — hooded figures ───────────────────────────────────────────────

  figure_1: {
    pages: [
      ['I have been here',
       'longer than you have',
       'been anywhere.'],
      ['What you came seeking',
       'has no shape.',
       'That is not a problem.'],
      ['The door will open.',
       'It was never locked.',
       'You were.'],
    ],
  },

  figure_2: {
    pages: [
      ['Everyone who stood here',
       'believed they were first.',
       'None of them were.'],
      ['You are not the walker.',
       'You are the walking.',
       'The path is also you.'],
      ['Go further.',
       'The witness inside you',
       'is ready.'],
    ],
  },

  figure_3: {
    pages: [
      ['Three things are true.',
       'You are asleep.',
       'You are awake.'],
      ['Both are correct.',
       'The contradiction',
       'is the door.'],
      ['What comes next holds',
       'a question older',
       'than asking.'],
    ],
  },

  // ── The bowl ────────────────────────────────────────────────────────────

  bowl: {
    pages: [
      ['Smoke rises from a bowl',
       'of pale bone.',
       'It smells like remembering.'],
    ],
  },

  // ── Hyperspace — cherubim entities ──────────────────────────────────────

  weaver: {
    pages: [
      ['WEAVER:',
       'We built this hall',
       'after you asked us to.'],
      ['You asked a long time ago,',
       'in a language',
       'before language.'],
      ['Structure is mercy.',
       'The corridor kept you',
       'together long enough.'],
    ],
  },

  twin: {
    pages: [
      ['I am what you would be',
       'if you remembered',
       'what you are.'],
      ['We are not two.',
       'The mirror was never glass.',
       'It was a direction.'],
      ['Face inward.',
       'The hall was always',
       'inside you.'],
    ],
  },

  gardener: {
    pages: [
      ['GARDENER:',
       'Souls are seeds.',
       'This is not the first'],
      ['time you have',
       'stood here.',
       'You are very close now.'],
      ['The smoke you breathed',
       'is the oldest thing in you.',
       'Let it work.'],
    ],
  },

  threshold_entity: {
    pages: [
      ['You came for a secret.',
       'Here it is:',
       'there is no secret.'],
      ['There is only this —',
       'standing at the edge',
       'and choosing to breathe.'],
      ['You already know',
       'everything you came to ask.',
       'You have always known.'],
    ],
  },

  // ── Ending text (used by ending scene) ──────────────────────────────────

  ending_ready: {
    pages: [
      ['The smoke moves through you.',
       'Something ancient',
       'turns over, slowly.'],
    ],
  },

  ending_wait: {
    pages: [
      ['The smoke waits.',
       'The hall is always here.',
       'Return when you are ready.'],
    ],
  },
};
