// All dialogue content as data.
// Format: { pages: string[][] }
// Each inner array is one "page" of lines — max 3 lines, ~22 chars each.
// Keep lines oblique, sparse. The mystery does the work.

export const DIALOGUES = {

  // ── Forest objects ──────────────────────────────────────────────────────

  mushrooms_1: {
    pages: [
      ['A ring of quiet.',
       'The air moves differently',
       'inside it.'],
    ],
  },

  mushrooms_2: {
    pages: [
      ['Same ring. Different light.',
       'Something here was waiting',
       'for you to come back.'],
    ],
  },

  mushrooms_3: { pages: [['The spores remember', 'where you have been.']] },
  mushrooms_4: { pages: [['Quiet here, still.']] },

  log: {
    pages: [
      ['A fallen log,', 'thick as a promise.'],
      ['You can walk behind it.'],
    ],
  },

  stone_1_before: {
    pages: [
      ['Smooth marks on granite.',
       'You can\'t make sense of them.',
       'They feel deliberate.'],
    ],
  },

  stone_1_after: {
    pages: [
      ['The marks resolve.',
       'Something about return —',
       'about seeing the same thing twice.'],
    ],
  },

  stone_2_before: {
    pages: [
      ['More marks. A pattern,',
       'maybe. You can\'t read it yet.'],
    ],
  },

  stone_2_after: {
    pages: [
      ['A rendering instruction.',
       'Apply what you know.',
       'The woods are already doing it.'],
    ],
  },

  // ── Shrine ──────────────────────────────────────────────────────────────

  shrine_before: {
    pages: [
      ['An empty bowl set in stone.',
       'The indent where something',
       'should be poured.'],
    ],
  },

  shrine_ready: {
    pages: [
      ['The bowl warms at your touch.',
       'You pour something wordless',
       'into the stone.'],
      ['A sound like the fog lifting.'],
    ],
  },

  shrine_filled: {
    pages: [
      ['The bowl catches the light.',
       'Something was accepted.'],
    ],
  },

  // ── Cabin ───────────────────────────────────────────────────────────────

  window: {
    pages: [
      ['Light through old glass.',
       'The forest outside is the same',
       'forest. But.'],
    ],
  },

  books: {
    pages: [
      ['Handwriting in the margins.',
       'Someone was working',
       'something out.'],
    ],
  },

  journal_before: {
    pages: [
      ['The ink stops mid-sentence.',
       'Whatever they were writing,',
       'they got up to do it.'],
    ],
  },

  journal_after: {
    pages: [
      ['The handwriting is yours.',
       'You don\'t remember writing it.',
       'The last line reads:'],
      ['"Go back into the woods."'],
    ],
  },

  tea: {
    pages: [
      ['Still warm.',
       'Someone was here recently.'],
    ],
  },

  tea_after: {
    pages: [
      ['The cup is empty.',
       'You don\'t remember drinking it.'],
    ],
  },

  mirror_before: {
    pages: [
      ['Your reflection holds a beat',
       'too long before following.',
       'You pretend not to notice.'],
    ],
  },

  mirror_after: {
    pages: [
      ['It moves with you now.',
       'Both of you arrived',
       'at the same time.'],
    ],
  },

  artifact: {
    pages: [
      ['A bowl of pale bone.',
       'A light turns over,',
       'slowly. It is warm.'],
    ],
  },

  // ── Deer ────────────────────────────────────────────────────────────────

  deer_calm: {
    pages: [
      ['The deer watches.',
       'It doesn\'t leave.',
       'Neither do you.'],
    ],
  },

  // ── Hyperspace entities ─────────────────────────────────────────────────

  weaver: {
    pages: [
      ['THE WEAVER:',
       'I am still rendering',
       'the woods you left.'],
      ['Structure is not a prison.',
       'It is what makes the walk',
       'possible.'],
      ['What you call outside',
       'is appearing within you.',
       'I never stopped drawing it.'],
    ],
  },

  twin: {
    pages: [
      ['It looks like you.',
       'You look like it.',
       'The distinction matters less'],
      ['than you thought.',
       'The room it stands in',
       'is the same room you\'re in.'],
      ['What you seek is already given.',
       'Align with it',
       'by being it.'],
    ],
  },

  gardener: {
    pages: [
      ['THE GARDENER:',
       'That bowl in the clearing —',
       'the one in the stone.'],
      ['Fill it when you return.',
       'Not because it needs filling.',
       'Because you are ready.'],
      ['The deer already knows.',
       'The stones already read.',
       'The woods are waiting for you.'],
    ],
  },

  threshold_entity: {
    pages: [
      ['You understand now.',
       'The woods did not change.',
       'You gave yourself permission'],
      ['to see them.',
       'The floor you thought',
       'was solid was always a render.'],
      ['This is the last door.',
       'It was never locked.'],
    ],
  },

  // ── Ending ──────────────────────────────────────────────────────────────

  ending_ready: {
    pages: [
      ['You wake in the cabin.',
       'The tea is gone.',
       'The mirror moves with you.'],
      ['The journal is in your hand.',
       'You wrote: go back.',
       'So you go back.'],
    ],
  },

  ending_wait: {
    pages: [
      ['You wake in the cabin.',
       'Everything is the same.',
       'Except you.'],
      ['The door is open.',
       'The forest is waiting.',
       'It always was.'],
    ],
  },
};
