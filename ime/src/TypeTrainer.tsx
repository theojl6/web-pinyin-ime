import * as React from "react";
import "./App.css";
import getIMECandidates from "./pinyin/ime_engine";
import { isNumeric } from "./utils";

const MAX_CANDIDATES = 50;

type Char = {
  index: number;
  char: string;
  typed: boolean;
  correct: boolean;
};

type Candidate = {
  value: string;
  index: number;
};

const ignoredSymbols = new Set([" ", "Escape", "Backspace", "Meta", "Enter"]);

const sampleChars: Char[] =
  `以前有一个小村庄，村子里住着一个叫小明的男孩。小明聪明又好奇，常常在村子附近的森林中探险。一天，小明在森林里发现了一只受伤的小鸟。他心里很难过，决定把小鸟带回家照顾。小明用温暖的布包好小鸟，轻轻喂它水和食物。经过几天的细心照料，小鸟渐渐恢复了健康。小明每天和小鸟聊天，彼此成了好朋友。终于有一天，小鸟展开翅膀，飞上了天空。小明站在树下，微笑着看着小鸟飞得越来越高。他知道，虽然小鸟要离开了，但他们的友谊将永远存在。 从此以后，小明每当看到空中的小鸟，心里总是暖暖的。`
    .split("")
    .map((c, i) => ({ index: i, char: c, typed: false, correct: false }));

function TypeTrainer() {
  const [cursor, setCursor] = React.useState(0);
  const [currentInput, setCurrentInput] = React.useState<string[]>([]);
  const [chars, setChars] = React.useState<Char[]>(sampleChars);

  const currentChar = chars[cursor];

  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const onEnter = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        ref.current!.focus();
      }
    };
    window.addEventListener("keydown", onEnter);
    return () => {
      window.addEventListener("keydown", onEnter);
    };
  }, []);

  const [candidates, setCandidates] = React.useState<Candidate[]>([]);

  const updateCandidates = (input: string[]) => {
    if (input.length) {
      setCandidates(
        getIMECandidates(input.join(""))
          .slice(0, MAX_CANDIDATES)
          .map((value, index) => ({ value, index }))
      );
    } else {
      setCandidates([]);
    }
  };
  console.log("candidates", candidates);
  console.log("currentInput", currentInput);

  return (
    <div className="max-w-full m-0-auto p-8 text-center">
      <h1>pinyin trainer</h1>
      <div
        ref={ref}
        onKeyDown={(e) => {
          if (e.key === currentChar.char) {
            setCursor((c) => c + 1);
          } else if (e.key === "Backspace") {
            if (!currentInput.length) {
              setCursor((c) => (c > 0 ? c - 1 : c));
            }
          }
          if (e.key === "Backspace") {
            setCurrentInput((ci) => {
              const input = ci.slice(0, ci.length - 1);
              updateCandidates(input);
              return input;
            });
          } else {
            setCurrentInput((ci) => {
              const input = ignoredSymbols.has(e.key) ? ci : [...ci, e.key];
              updateCandidates(input);
              return input;
            });
          }
          if (isNumeric(e.key)) {
            const numericKey = +e.key;
            const candidateOption = candidates[numericKey];
            if (candidateOption) {
              if (
                chars
                  .slice(cursor)
                  .map(({ char }) => char)
                  .join("")
                  .startsWith(candidateOption.value)
              ) {
                setCursor((c) => c + candidateOption.value.length);
                const input: string[] = [];
                updateCandidates(input);
                setCurrentInput(input as string[]);
              }
            }
          }
        }}
        tabIndex={0}
      >
        {chars.map((c, i) => (
          <span className="text-6xl" key={`${c.char}-${c.index}`}>
            <span className={cursor === i ? "text-white" : "text-gray-400"}>
              {cursor === i ? (
                <>
                  <Caret />
                  {`${c.char}`}
                </>
              ) : (
                `${c.char}`
              )}
            </span>
          </span>
        ))}
      </div>
      <p>{currentInput.join(" ")}</p>
      <p>
        {candidates.map((c) => (
          <span key={`${c.index}-${c.value}`}>{`${c.index}-${c.value} `}</span>
        ))}
      </p>
    </div>
  );
}

const Caret = () => {
  return (
    <span>
      <span>|</span>
    </span>
  );
};

export default TypeTrainer;
