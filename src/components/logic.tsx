const HEIGHT: number = 4;
const WIDTH: number = HEIGHT;

type Cell = number; 
type Field = Cell[][];

const FIELD: Field = new Array(HEIGHT)
  .fill(0)
  .map(() => new Array(WIDTH).fill(0));

interface CoverState {
  color: string;
  text: string;
}

const COVER: { win: CoverState; lose: CoverState } = {
  win: {
    color: "rgba(255, 217, 0, .4)",
    text: "You win!",
  },
  lose: {
    color: "rgba(255, 255, 255, .6)",
    text: "Game Over",
  },
};

let WON: boolean = false;
let GENERATE_NEXT: boolean = false;
let SCORE: number = 0;

function removeZeros(array: number[], position: "l" | "r" = "l"): number[] {
    const prev: number[] = [...array];
  

    array = array.filter((e) => e !== 0);
  
    let lPart: number[] = [];
    let rPart: number[] = [];
  
    lPart = position === "l" ? array : [];
	  rPart = position === "r" ? array : [];
  

    array = [...lPart, ...new Array(WIDTH - array.length).fill(0), ...rPart];
  

    if (JSON.stringify(prev) !== JSON.stringify(array)) {
      GENERATE_NEXT = true; 
    }
  
    return array;
  }

  function moveDown(): void {
    for (let i = 0; i < WIDTH; i++) {

      let column: number[] = removeZeros(
        FIELD.map((e) => e[i]),
        "r"
      );

      column = slideRight(column);
      for (let j = 0; j < HEIGHT; j++) {
        FIELD[j][i] = column[j];
      }
    }
  }
  function moveUp(): void {
    for (let i = 0; i < WIDTH; i++) {

      let column: number[] = removeZeros(FIELD.map((e) => e[i]));
      column = slideLeft(column);
      for (let j = 0; j < HEIGHT; j++) {
        FIELD[j][i] = column[j];
      }
    }
  }

  function slideLeft(array: number[]): number[] {
    for (let j = 0; j < WIDTH - 1; j++) {
      if (array[j] === array[j + 1] && array[j] !== 0) {
        SCORE += array[j] + array[j + 1]; 
        array[j] = array[j] + array[j + 1]; 
  
 
        if (array[j] >= 2048) {
          WON = true;
        }
  
        array[j + 1] = 0; 
        array = removeZeros(array); 
        GENERATE_NEXT = true; 
      }
    }
    return array; 
  }
  
  function slideRight(array: number[]): number[] {
    for (let j = WIDTH - 1; j > 0; j--) {
      if (array[j] === array[j - 1] && array[j] !== 0) {
        SCORE += array[j] + array[j - 1]; 
        array[j] = array[j] + array[j - 1]; 
  
 
        if (array[j] >= 2048) {
          WON = true;
        }
  
        array[j - 1] = 0; 
        array = removeZeros(array, "r"); 
        GENERATE_NEXT = true; 
      }
    }
    return array; 
  }
  

  function moveLeft(): void {
    for (let i = 0; i < HEIGHT; i++) {
  
      FIELD[i] = removeZeros(FIELD[i]);
      FIELD[i] = slideLeft(FIELD[i]);
    }
  }
  
  function moveRight(): void {
    for (let i = 0; i < HEIGHT; i++) {

      FIELD[i] = removeZeros(FIELD[i], "r");
      FIELD[i] = slideRight(FIELD[i]);
    }
  }


  function checkLose(): boolean {
    for (let i = 0; i < HEIGHT; i++) {
      for (let j = 0; j < WIDTH; j++) {
        if (
          FIELD[i][j] === 0 || 
          (i < HEIGHT - 1 && FIELD[i][j] === FIELD[i + 1][j]) || 
          (j < WIDTH - 1 && FIELD[i][j] === FIELD[i][j + 1]) 
        ) {
          return false; 
        }
      }
    }
    return true; 
  }

  
  function setWrapper(
    win: boolean = true,
    background: string,
    text: string,
    btn: string = "block"
  ): void {
    const gameDialog = document.getElementById("game-dialog");
    const gameReset = document.getElementById("game-reset");
    const gameContainer = document.getElementById("game-container");
  
    if (gameDialog && gameReset && gameContainer) {
      gameDialog.innerHTML = text;
      gameReset.style.display = btn;
      gameContainer.style.background = background;
      gameDialog.style.color = win ? "#fff" : "#776e65"; 
    }
  
    
    document.removeEventListener("keydown", move);
  }

  function move(e: KeyboardEvent): void {
    GENERATE_NEXT = false;
  
    if (e.key === "a") moveLeft();
    if (e.key === "d") moveRight();
    if (e.key === "s") moveDown();
    if (e.key === "w") moveUp();
  

    if ("adsw".includes(e.key)) {
      if (GENERATE_NEXT) {
        newRandomCell(); 
      }
      refreshUI(); 
  
   
      if (WON) {
        setWrapper(true, COVER.win.color, COVER.win.text); 
      }
      if (checkLose()) {
        setWrapper(false, COVER.lose.color, COVER.lose.text); 
      }
    }
  }

  function newRandomCell(): void {
 
    function getRandomCoordinates(): [number, number] {
      const free: [number, number][] = [];
      for (let i = 0; i < HEIGHT; i++) {
        for (let j = 0; j < WIDTH; j++) {
          if (FIELD[i][j] === 0) {
            free.push([i, j]);
          }
        }
      }

      return free[Math.floor(Math.random() * free.length)] || [0, 0];
    }
  
    const [i, j] = getRandomCoordinates();
    FIELD[i][j] = 2; 
  }

  function refreshUI(): void {
    const scoreElement = document.getElementById("game-score");
    if (scoreElement) {
      scoreElement.innerHTML = SCORE.toString(); 
    }
  
    for (let i = 0; i < HEIGHT; i++) {
      for (let j = 0; j < WIDTH; j++) {
        const cell = document.getElementById((i * HEIGHT + j + 1).toString());
        if (cell) {
          cell.className = ""; 
          cell.innerHTML = ""; 
          cell.classList.add(`_${FIELD[i][j]}`, "c"); 
          if (FIELD[i][j] !== 0) {
            cell.innerHTML = FIELD[i][j].toString(); 
          }
        }
      }
    }
  }
  
  
 export function resetGame(): void {
    SCORE = 0;
    WON = false;
    GENERATE_NEXT = true;
    setWrapper(true, "", "", "none");
  

    document.addEventListener("keydown", move);
  

    for (let i = 0; i < HEIGHT; i++) {
      for (let j = 0; j < WIDTH; j++) {
        FIELD[i][j] = 0;
      }
    }

    newRandomCell();
    newRandomCell();
  

    refreshUI();
  }

function handleTouchEvents(): void {
  let touchStartX = 0;
  let touchStartY = 0;

  document.addEventListener("touchstart", (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  });

  document.addEventListener("touchend", (e) => {
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;

    const diffX = touchEndX - touchStartX;
    const diffY = touchEndY - touchStartY;

   
    if (Math.abs(diffX) > Math.abs(diffY)) {
      if (diffX > 0) {
        moveRight(); 
      } else {
        moveLeft();
      }
    } 

    else {
      if (diffY > 0) {
        moveDown(); 
      } else {
        moveUp();
      }
    }
    if (GENERATE_NEXT) {
      newRandomCell(); 
    }

    refreshUI(); 
    if (WON) setWrapper(true, COVER.win.color, COVER.win.text);
    if (checkLose()) setWrapper(false, COVER.lose.color, COVER.lose.text);
  });
}


handleTouchEvents();




  function initiateCells(): void {
    const field = document.getElementById("field");
  
    if (field) {

      for (let i = 0; i < WIDTH * HEIGHT; i++) {
        const cell = document.createElement("div");
        cell.className = "c";
        cell.id = (i + 1).toString(); 
        field.appendChild(cell);
      }

      const style = document.createElement("style");
      document.head.appendChild(style);
      style.sheet?.insertRule(
        `.c {
         width: calc(520px / ${WIDTH} - 20px);
          height: calc(520px / ${HEIGHT} - 20px); 
          line-height: calc(520px / ${HEIGHT} - 20px);
   
        }`
      );
    } 
  }
  document.addEventListener("keydown", move);

  const gameReset= document.getElementById("game-reset");
  if (gameReset) {
    gameReset.addEventListener("click", resetGame);
  } else {
    console.error("Element with ID 'game-reset' not found.");
  }
  
 
  initiateCells();
  resetGame();

export {}