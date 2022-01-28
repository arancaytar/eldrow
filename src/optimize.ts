import dictionary from "./dictionary.json";
import {sample} from "./util";
import {Clue, clue} from "./clue";
import lookup from "./lookup.json";

const limit = 10000;

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
  console.log(nonzeros);
  const logs = nonzeros.map(value => (value * Math.log(value) / Math.log(2)));
  console.log(logs);
  const logsum = logs.reduce((a, b) => a + b);
  return Math.log(solutions.length) / Math.log(2) -  logsum / solutions.length;
}

export function optimize(solutions: string[]): string {
  console.log("Random optimization");
  const dict = dictionary.filter((word) => word.length === solutions[0].length);
  const sampleSize = Math.min(dict.length, Math.floor(limit / solutions.length));
  let bestWord = "";
  let bestValue = 0;
  console.log(`Sampling 1e6/${solutions.length} = ${sampleSize} guesses`);
  sample(dict, sampleSize).concat(sample(solutions, sampleSize)).forEach((guess: string) => {
    const e = entropy(guess, solutions);
    console.log(`Guessing ${guess}, ${e}`);
    if (e > bestValue) {
      console.log(`Record! ${bestValue}`);
      bestWord = guess;
      bestValue = e;
    }
  });
  console.log(`Best word: ${bestWord}`);
  return bestWord;
}
