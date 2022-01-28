import { Clue, clueClass, CluedLetter, clueWord } from "./clue";
import {useRef, useState} from "react";

export enum RowState {
  LockedIn,
  Editing,
  Pending,
}

interface RowProps {
  rowState: RowState;
  wordLength: number;
  cluedLetters: CluedLetter[];
  annotation?: string;
  resetAnswer: () => void;
  resetGuess: () => void;
  editGuess: () => void;
}

export function Row(props: RowProps) {
  //const [rowState, setRowState] = useState(props.rowState);
  const isLockedIn = props.rowState === RowState.LockedIn;
  const isEditing = props.rowState === RowState.Editing;
  const letterDivs = props.cluedLetters
    .concat(Array(props.wordLength).fill({ clue: Clue.Absent, letter: "" }))
    .slice(0, props.wordLength)
    .map(({ clue, letter }, i) => {
      let letterClass = "Row-letter";
      if (clue !== undefined && letter) {
        letterClass += " " + clueClass(clue);
      }
      return (
        <td
          key={i}
          className={letterClass}
          aria-live={isEditing ? "assertive" : "off"}
          aria-label={
            letter.toUpperCase() +
              (clue === undefined ? "" : ": " + clueWord(clue))
          }
        >
          {letter}
        </td>
      );
    });
  let rowClass = "Row";
  if (isLockedIn) rowClass += " Row-locked-in";
  return (
    <tr className={rowClass}>
      {letterDivs}
      <td className="Row-button">
        {isEditing ? (
          <button onClick={props.resetGuess} title="Revert to the automatic guess.">▶️</button>
        ) : (
          <button onClick={props.editGuess} title="Override this guess manually." onKeyDown={() => false}>✏️</button>
        )}
      </td>
      <td className="Row-button">
      {isLockedIn && (
          <button onClick={props.resetAnswer} title="Revert this and all following rows.">⏪️</button>
      )}
      </td>
      {props.annotation && (
        <span className="Row-annotation">{props.annotation}</span>
      )}
    </tr>
  );
}