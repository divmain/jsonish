import { describe, mock, it } from 'node:test';
import { repair } from '../dist/index.js';

const largeObj = {
  "title": "The Newsroom",
  "overview": {
    "genre": "Drama",
    "creator": "Aaron Sorkin",
    "premiere_date": "2012-06-24",
    "finale_date": "2014-12-14",
    "seasons": 3,
    "episodes": 25,
    "network": "HBO",
    "summary": "The Newsroom is a drama that takes a behind-the-scenes look at the people who make a nightly cable-news program, focusing on their personal and professional challenges while striving for journalistic integrity."
  },
  "main_cast": [
    {
      "actor": "Jeff Daniels",
      "character": "Will McAvoy",
      "role": "Lead Anchor",
      "description": "The principled, often volatile anchor of Atlantis Cable News (ACN) who struggles to balance journalistic integrity with network pressures."
    },
    {
      "actor": "Emily Mortimer",
      "character": "MacKenzie McHale",
      "role": "Executive Producer",
      "description": "Will's former romantic partner and the executive producer brought in to overhaul the newsroom's focus on serious journalism."
    },
    {
      "actor": "John Gallagher Jr.",
      "character": "Jim Harper",
      "role": "Senior Producer",
      "description": "A talented producer with a strong moral compass and a complicated love life."
    },
    {
      "actor": "Alison Pill",
      "character": "Maggie Jordan",
      "role": "Associate Producer",
      "description": "A young and ambitious producer navigating professional and personal growth."
    },
    {
      "actor": "Thomas Sadoski",
      "character": "Don Keefer",
      "role": "Executive Producer (initially)",
      "description": "A pragmatic producer who starts the series producing for another show before moving to News Night."
    },
    {
      "actor": "Sam Waterston",
      "character": "Charlie Skinner",
      "role": "News Division President",
      "description": "The eccentric, fatherly president of ACN's news division, dedicated to supporting his team."
    }
  ],
  "crew": {
    "creator": "Aaron Sorkin",
    "producers": [
      "Alan Poul",
      "Scott Rudin",
      "Paul Lieberstein"
    ],
    "directors": [
      "Greg Mottola",
      "Daniel Minahan",
      "Lesli Linka Glatter"
    ],
    "writers": [
      "Aaron Sorkin",
      "Eli Attie",
      "Sarah Sorkin"
    ],
    "cinematographers": [
      "Todd McMullen",
      "Jay Worth"
    ]
  },
  "seasons": [
    {
      "season_number": 1,
      "episodes": 10,
      "premiere_date": "2012-06-24",
      "finale_date": "2012-08-26",
      "highlighted_episodes": [
        {
          "title": "We Just Decided To",
          "episode_number": 1,
          "air_date": "2012-06-24",
          "plot": "Will McAvoy's public outburst forces him to reevaluate his approach to news reporting."
        },
        {
          "title": "5/1",
          "episode_number": 7,
          "air_date": "2012-08-05",
          "plot": "The newsroom scrambles to report on the death of Osama bin Laden."
        }
      ]
    },
    {
      "season_number": 2,
      "episodes": 9,
      "premiere_date": "2013-07-14",
      "finale_date": "2013-09-15",
      "highlighted_episodes": [
        {
          "title": "First Thing We Do, Let's Kill All the Lawyers",
          "episode_number": 1,
          "air_date": "2013-07-14",
          "plot": "The team faces fallout from a controversial story and a wrongful termination lawsuit."
        }
      ]
    },
    {
      "season_number": 3,
      "episodes": 6,
      "premiere_date": "2014-11-09",
      "finale_date": "2014-12-14",
      "highlighted_episodes": [
        {
          "title": "What Kind of Day Has It Been",
          "episode_number": 6,
          "air_date": "2014-12-14",
          "plot": "The series concludes with significant changes at ACN and a reflection on journalistic ideals."
        }
      ]
    }
  ],
  "themes": [
    "Ethics in journalism",
    "Personal and professional conflict",
    "Impact of news on society",
    "Struggle for journalistic independence",
    "Challenges of modern news production"
  ],
  "awards": [
    {
      "name": "Primetime Emmy Awards",
      "category": "Outstanding Lead Actor in a Drama Series",
      "recipient": "Jeff Daniels",
      "year": 2013
    },
    {
      "name": "Golden Globe Awards",
      "category": "Best Actor in a Television Series - Drama",
      "nominee": "Jeff Daniels",
      "year": 2013
    }
  ],
  "fan_statistics": {
    "average_viewership_per_season": {
      "season_1": "2.1 million",
      "season_2": "1.7 million",
      "season_3": "1.6 million"
    },
    "critical_scores": {
      "season_1": "80%",
      "season_2": "88%",
      "season_3": "74%"
    }
  }
};
const largeJson = JSON.stringify(largeObj);

describe('jsonish', () => {
  it('can repair undelimited keys', (t) => {
    const input = `{ foo: "bar" }`;
    const repaired = repair(input);
    t.assert.equal(repaired, `{"foo":"bar"}`);
  })

  it('preserves already-valid JSON', (t) => {
    const repaired = repair(largeJson);
    let parsed;
    t.assert.doesNotThrow(() => { parsed = JSON.parse(repaired); });
    t.assert.deepStrictEqual(parsed, largeObj);
  });
});
