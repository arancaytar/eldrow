import React from 'react';
import './App.css';
import Game from './Game';

class App extends React.Component {
  componentDidMount(){
    const enter = document.getElementById('Game-keyboard-button-Enter');
    if (enter) enter.focus();
  }
  render() {
    return (
      <div className="App-container">
        <header className="App-header">
          <h1>eldrow</h1>
        </header>
        <Game />
      </div>
    );
  }
}

export default App;
