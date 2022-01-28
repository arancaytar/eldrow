import React from 'react';
import { useEffect, useState } from "react";
import './App.css';
import Game from './Game';
import { maxGuesses } from "./util";

function useSetting<T>(
  key: string,
  initial: T
): [T, (value: T | ((t: T) => T)) => void] {
  const [current, setCurrent] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initial;
    } catch (e) {
      return initial;
    }
  });
  const setSetting = (value: T | ((t: T) => T)) => {
    try {
      const v = value instanceof Function ? value(current) : value;
      setCurrent(v);
      window.localStorage.setItem(key, JSON.stringify(v));
    } catch (e) {}
  };
  return [current, setSetting];
}

function App() {
  return (
      <div className="App-container">
        <header className="App-header">
          <h1>eldrow</h1>
        </header>
        <Game />
      </div>
  );
}

export default App;
