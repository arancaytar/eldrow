import {clueClass} from "./clue";

interface KeyboardProps {
  onKey: (key: string) => void;
}

export function Keyboard(props: KeyboardProps) {
  const keyboard = [
    "q w e r t y u i o p".split(" "),
    "a s d f g h j k l".split(" "),
    "Backspace z x c v b n m Enter".split(" "),
  ];

  return (
    <div className="Game-keyboard" aria-hidden="true">
      {keyboard.map((row, i) => (
        <div key={i} className="Game-keyboard-row">
          {row.map((label, j) => {
            let className = "Game-keyboard-button";
            if (label.length > 1) {
              className += " Game-keyboard-button-wide";
            }
            return (
              <div
                id={`Game-keyboard-button-${label}`}
                tabIndex={-1}
                key={j}
                role="button"
                className={className}
                onClick={() => {
                  props.onKey(label);
                }}
              >
                {label.replace("Backspace", "⌫")}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

export function Answerboard(props: KeyboardProps) {
  const keyboard = [
    "0 1 2".split(" "),
    "Backspace Enter".split(" "),
  ];


  return (
    <div className="Game-keyboard" aria-hidden="true">
      {keyboard.map((row, i) => (
        <div key={i} className="Game-keyboard-row">
          {row.map((label, j) => {
            let className = "Game-keyboard-button";
            if (label.length > 1) {
              className += " Game-keyboard-button-wide";
            }
            if (+label in [0, 1, 2]) {
              className += " " + clueClass(+label);
            }
            return (
              <div
                tabIndex={-1}
                key={j}
                role="button"
                className={className}
                onClick={() => {
                  props.onKey(label);
                }}
              >
                {label.replace("Backspace", "⌫")}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}