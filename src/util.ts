import dictionary from "./dictionary.json";

export const maxGuesses = 6;

export const dictionarySet: Set<string> = new Set(dictionary);

// https://a11y-guidelines.orange.com/en/web/components-examples/make-a-screen-reader-talk/
export function speak(
  text: string,
  priority: "polite" | "assertive" = "assertive"
) {
  var el = document.createElement("div");
  var id = "speak-" + Date.now();
  el.setAttribute("id", id);
  el.setAttribute("aria-live", priority || "polite");
  el.classList.add("sr-only");
  document.body.appendChild(el);

  window.setTimeout(function () {
    document.getElementById(id)!.innerHTML = text;
  }, 100);

  window.setTimeout(function () {
    document.body.removeChild(document.getElementById(id)!);
  }, 1000);
}

export function ordinal(n: number): string {
  return n + ([, "st", "nd", "rd"][(n % 100 >> 3) ^ 1 && n % 10] || "th");
}

export function shuffle(arr: string[]) {
  let currentIndex = arr.length,  randomIndex;

  // While there remain elements to shuffle...
  while (currentIndex !== 0) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [arr[currentIndex], arr[randomIndex]] = [
      arr[randomIndex], arr[currentIndex]];
  }

  return arr;
}

export function sample(arr: string[], k: number) {
  return shuffle(arr).slice(0, k);
}

export const englishNumbers =
  "zero one two three four five six seven eight nine ten eleven".split(" ");