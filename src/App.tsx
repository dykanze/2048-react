import React from "react";
import "./App.css";
import "./components/logic.tsx";


function App() {
  return (
    <div id="wrapper">
			<p id="game-title">2048</p>
			<p id="score">Score: <span id="game-score">0</span></p>
			<div id="field">
				<div id="game-container">
					<div id="game-dialog"></div>
					<button id="game-reset">Try again</button>
				</div>

			</div>
		</div>
  );
}

export default App;