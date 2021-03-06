import dictionary from "./dictionary.json";
import {sample} from "./util";
import {Clue, clue} from "./clue";

const limit = 10000000;

function entropy(guess: string, solutions: string[]) {
  const bins = Array(Math.pow(3, guess.length)).fill(0);
  console.log(solutions);
  solutions.forEach((solution: string) => {
    let value = 0;
    let power = 1
    clue(guess, solution).map(c => {
      switch (c.clue) {
        case Clue.Absent: return 0;
        case Clue.Elsewhere: return 1;
        case Clue.Correct: return 2;
      }
      return 0;
    }).forEach(d => {
      value += d * power;
      power *= 3;
    });
    bins[value]++;
  });
  const nonzeros =bins.filter(x => x > 0);
  const logs = nonzeros.map(value => (value * Math.log(value) / Math.log(2)));
  const logsum = logs.reduce((a, b) => a + b);
  return Math.log(solutions.length) / Math.log(2) -  logsum / solutions.length;
}

export function optimize(solutions: string[]): string {
  const dict = dictionary.filter((word) => word.length === solutions[0].length);
  const sampleSize = Math.min(dict.length, Math.floor(Math.sqrt(limit / solutions.length)));
  let bestWord = "";
  let bestValue = 0;
  sample(dict, sampleSize).concat(sample(solutions, sampleSize)).forEach((guess: string) => {
    const e = entropy(guess, solutions);
    if (e > bestValue) {
      bestWord = guess;
      bestValue = e;
    }
  });
  return bestWord;
}
