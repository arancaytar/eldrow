import {useEffect, useRef, useState} from "react";
import {Keyboard, Answerboard} from "./Keyboard";
import lookup from "./lookup.json";
import targetList from "./targets.json";
import {Clue, clueAnswer, clueFilter} from "./clue";
import {Row, RowState} from "./Row";
import {optimize} from "./optimize";
import {ordinal} from "./util";

enum GameState {
  Guessing,
  Responding,
  Finished,
  AutoGuessing = 3
}

const targets = targetList.slice(0, targetList.indexOf("murky") + 1); // Words no rarer than this one
const minWordLength = 4;
const maxWordLength = 11;

async function fastOptimize(guesses: string[], answers: Clue[][]): Promise<string> {
  if (guesses.length === 0) return lookup[""];
  if (guesses.length === 1 && answers.length === 1 && guesses[0].toLowerCase() === lookup[""]) {
    const answer = answers[0].map((clue: Clue) => {
      switch (clue) {
        case Clue.Absent: return "0";
        case Clue.Elsewhere: return "1";
        case Clue.Correct: return "2";
      }
      return "";
    }).join("");
    // @ts-ignore
    console.log(`Fast guesser: ${lookup[answer]}`);
    // @ts-ignore
    return lookup[answer];
  }
  const solutions = getSolutions(guesses, answers);
  if (solutions.length <= 2) return solutions[0];
  return optimize(solutions);
}

function getSolutions(guesses: string[], answers: Clue[][]): string[] {
  return guesses.reduce<string[]>((solutions, guess, i) => {
    return clueFilter(guess, answers[i], solutions);
  }, targets.filter(w => w.length === guesses[0].length));
}

function Game() {
  const [gameState, setGameState] = useState(GameState.AutoGuessing);
  const [guesses, setGuesses] = useState<string[]>([]);
  const [answers, setAnswers] = useState<Clue[][]>([]);
  const [currentGuess, setCurrentGuess] = useState<string>("");
  const [currentAnswer, setCurrentAnswer] = useState<Clue[]>([]);

  const [wordLength, setWordLength] = useState(5);
  const tableRef = useRef<HTMLTableElement>(null);
  const [hint, setHint] = useState<string>(`Answer the first guess!`);

  const startNextGame = () => {
    const newWordLength =
      wordLength < minWordLength || wordLength > maxWordLength ? 5 : wordLength;
    setWordLength(newWordLength);
    setGuesses([]);
    setCurrentGuess("");
    setAnswers([]);
    setCurrentAnswer([]);
    setHint("");
    setGameState(GameState.AutoGuessing);
  };

  const onKey = (key: string) => {
    if (gameState === GameState.Finished) {
      if (key === "Enter") {
        startNextGame();
      }
      return;
    }

    if (gameState === GameState.Guessing) {
      if (/^[a-z]$/i.test(key)) {
        setCurrentGuess((guess : string) =>
          (guess + key.toLowerCase()).slice(0, wordLength)
        );
        tableRef.current?.focus();
        setHint("");
      } else if (key === "Backspace") {
        setCurrentGuess((guess : string) => guess.slice(0, -1));
        setHint("");
      } else if (key === "Enter") {
        if (currentGuess.length !== wordLength) {
          setHint("Too short");
          return;
        }
        setGuesses((guesses) => guesses.concat([currentGuess]));
        setCurrentGuess((guess : string) => "");
        setGameState(GameState.Responding)
      }
    }
    else if (gameState === GameState.Responding) {
      if (/^[2g]$/i.test(key)) {
        setCurrentAnswer((answer : Clue[]) => answer.concat(Clue.Correct).slice(0, wordLength));
      } else if (/^[1y]$/i.test(key)) {
        setCurrentAnswer((answer : Clue[]) => answer.concat(Clue.Elsewhere).slice(0, wordLength));
      } else if (/^[0bw]$/i.test(key)) {
        setCurrentAnswer((answer : Clue[]) => answer.concat(Clue.Absent).slice(0, wordLength));
      } else if (key === "Backspace") {
        setCurrentAnswer((answer : Clue[]) => answer.slice(0, -1));
      } else if (key === "Enter") {
        if (currentAnswer.length !== wordLength) {
          setHint(`Too short: ${currentAnswer}`);
          return;
        }
        const solutions = getSolutions(guesses, answers.concat([currentAnswer]));
        if (currentAnswer.filter(clue => clue !== Clue.Correct).length === 0) {
          setHint(`Finished after ${guesses.length} guesses. Press enter to restart.`);
          setGameState(GameState.Finished);
          return;
        }
        if (solutions.length === 0) {
          setHint(`No solutions found; check answers.`);
          return;
        }
        setHint(`${solutions.slice(0, 3).map(s => s.toUpperCase()).join(', ')} and ${Math.max(0, solutions.length - 3)} others remaining. `);
        setAnswers((answers) => answers.concat([currentAnswer]));
        setCurrentAnswer((answer : Clue[]) => []);
        setGameState(GameState.AutoGuessing);
      }
    }
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!e.ctrlKey && !e.metaKey) {
        onKey(e.key);
      }
      if (e.key === "Backspace") {
        e.preventDefault();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [currentGuess, currentAnswer, gameState]);

  useEffect(() => {
    if (gameState === GameState.AutoGuessing) {
      const time = (new Date()).getTime();
      fastOptimize(guesses, answers)
        .then((guess: string) => {
          setGuesses(guesses.concat([guess]));
          setGameState(GameState.Responding);
          setHint(hint => hint + ` Generated ${ordinal(guesses.length + 1)} guess in ${(((new Date()).getTime() - time) / 1000).toPrecision(2)} seconds.`);
        });
    }
  }, [guesses, answers, gameState]);

  const onReset = (i: number, target: GameState) => {
    // :eave last guess if we only reset the answer:
    setGuesses(guesses => guesses.slice(0, i + +(target === GameState.Responding)));
    setAnswers(answers => answers.slice(0, i));
    setCurrentGuess("");
    setCurrentAnswer([]);
    setGameState(target);
  }

  const tableRows = Array(guesses.length + +(gameState === GameState.Guessing))
    .fill(undefined)
    .map((_, i) => {
      const guess = [...guesses, currentGuess][i] ?? "";
      const answer = [...answers, currentAnswer][i] ?? "";
      console.log(`Row for ${guess}, ${answer}`);
      const cluedLetters = clueAnswer(guess, answer);
      console.log(cluedLetters);
      const lockedIn = i < guesses.length - 1;
      return (
        <Row
          key={i}
          wordLength={wordLength}
          rowState={
            lockedIn
              ? RowState.LockedIn
              : i === guesses.length
                ? RowState.Editing
                : RowState.Pending
          }
          cluedLetters={cluedLetters}
          resetAnswer={() => {onReset(i, GameState.Responding);}}
          editGuess={() => {onReset(i, GameState.Guessing);}}
          resetGuess={() => {onReset(i, GameState.AutoGuessing);}}
        />
      );
    });

  return (
    <div className="Game" style={{display: "block"}}>
      <table
        className="Game-rows"
        tabIndex={0}
        aria-label="Table of guesses"
        ref={tableRef}
      >
        <tbody>{tableRows}</tbody>
      </table>
      <p
        role="alert"
        style={{
          userSelect: /https?:/.test(hint) ? "text" : "none",
          whiteSpace: "pre-wrap",
        }}
      >
        {hint || `\u00a0`}
      </p>
      {gameState === GameState.Guessing && (
        <Keyboard onKey={onKey} />
      )}
      {gameState === GameState.Responding && (
        <Answerboard onKey={onKey} />
      )}
    </div>
  );
}

export default Game;