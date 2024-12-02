

const HEIGHT: number = 4;
const WIDTH: number = HEIGHT;

type Cell = number; // Тип для ячейки поля
type Field = Cell[][]; // Тип для игрового поля

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
  
    // Удаляем нули из массива
    array = array.filter((e) => e !== 0);
  
    let lPart: number[] = [];
    let rPart: number[] = [];
  
    // В зависимости от позиции заполняем части массива
    lPart = position === "l" ? array : [];
	  rPart = position === "r" ? array : [];
  
    // Объединяем части массива с нулями
    array = [...lPart, ...new Array(WIDTH - array.length).fill(0), ...rPart];
  
    // Проверяем, изменился ли массив
    if (JSON.stringify(prev) !== JSON.stringify(array)) {
      GENERATE_NEXT = true; // Обновляем глобальную переменную
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
        SCORE += array[j] + array[j + 1]; // Увеличиваем счет
        array[j] = array[j] + array[j + 1]; // Объединяем ячейки
  
        // Проверяем, достигли ли значения 2048
        if (array[j] >= 2048) {
          WON = true;
        }
  
        array[j + 1] = 0; // Обнуляем следующую ячейку
        array = removeZeros(array); // Удаляем нули
        GENERATE_NEXT = true; // Указываем, что нужно генерировать следующую клетку
      }
    }
    return array; // Возвращаем обновленный массив
  }
  
  function slideRight(array: number[]): number[] {
    for (let j = WIDTH - 1; j > 0; j--) {
      if (array[j] === array[j - 1] && array[j] !== 0) {
        SCORE += array[j] + array[j - 1]; // Увеличиваем счет
        array[j] = array[j] + array[j - 1]; // Объединяем ячейки
  
        // Проверяем, достигли ли значения 2048
        if (array[j] >= 2048) {
          WON = true;
        }
  
        array[j - 1] = 0; // Обнуляем предыдущую ячейку
        array = removeZeros(array, "r"); // Удаляем нули справа
        GENERATE_NEXT = true; // Указываем, что нужно генерировать следующую клетку
      }
    }
    return array; // Возвращаем обновленный массив
  }
  

  function moveLeft(): void {
    for (let i = 0; i < HEIGHT; i++) {
      // Удаляем нули слева и сдвигаем ячейки влево
      FIELD[i] = removeZeros(FIELD[i]);
      FIELD[i] = slideLeft(FIELD[i]);
    }
  }
  
  function moveRight(): void {
    for (let i = 0; i < HEIGHT; i++) {
      // Удаляем нули справа и сдвигаем ячейки вправо
      FIELD[i] = removeZeros(FIELD[i], "r");
      FIELD[i] = slideRight(FIELD[i]);
    }
  }


  function checkLose(): boolean {
    for (let i = 0; i < HEIGHT; i++) {
      for (let j = 0; j < WIDTH; j++) {
        if (
          FIELD[i][j] === 0 || // Есть пустая ячейка
          (i < HEIGHT - 1 && FIELD[i][j] === FIELD[i + 1][j]) || // Есть возможность объединения по вертикали
          (j < WIDTH - 1 && FIELD[i][j] === FIELD[i][j + 1]) // Есть возможность объединения по горизонтали
        ) {
          return false; // Игра не окончена
        }
      }
    }
    return true; // Проигрыш
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
      gameDialog.style.color = win ? "#fff" : "#776e65"; // Правильный цвет текста
    }
  
    // Убираем обработчик клавиш для завершения игры
    document.removeEventListener("keydown", move);
  }

  function move(e: KeyboardEvent): void {
    GENERATE_NEXT = false;
  
    // Проверяем нажатую клавишу и выполняем соответствующее действие
    if (e.key === "a") moveLeft();
    if (e.key === "d") moveRight();
    if (e.key === "s") moveDown();
    if (e.key === "w") moveUp();
  
    // Если была нажата одна из управляющих клавиш
    if ("adsw".includes(e.key)) {
      if (GENERATE_NEXT) {
        newRandomCell(); // Генерация новой случайной ячейки
      }
      refreshUI(); // Обновление пользовательского интерфейса
  
      // Проверяем состояние игры
      if (WON) {
        setWrapper(true, COVER.win.color, COVER.win.text); // Победа
      }
      if (checkLose()) {
        setWrapper(false, COVER.lose.color, COVER.lose.text); // Проигрыш
      }
    }
  }

  function newRandomCell(): void {
    // Получение координат случайной пустой ячейки
    function getRandomCoordinates(): [number, number] {
      const free: [number, number][] = [];
      for (let i = 0; i < HEIGHT; i++) {
        for (let j = 0; j < WIDTH; j++) {
          if (FIELD[i][j] === 0) {
            free.push([i, j]);
          }
        }
      }
      // Возвращаем случайные координаты или [0, 0], если нет свободных ячеек
      return free[Math.floor(Math.random() * free.length)] || [0, 0];
    }
  
    const [i, j] = getRandomCoordinates();
    FIELD[i][j] = 2; // Устанавливаем значение новой ячейки
  }

  function refreshUI(): void {
    const scoreElement = document.getElementById("game-score");
    if (scoreElement) {
      scoreElement.innerHTML = SCORE.toString(); // Обновляем счет
    }
  
    for (let i = 0; i < HEIGHT; i++) {
      for (let j = 0; j < WIDTH; j++) {
        const cell = document.getElementById((i * HEIGHT + j + 1).toString());
        if (cell) {
          cell.className = ""; // Сбрасываем классы
          cell.innerHTML = ""; // Очищаем содержимое
          cell.classList.add(`_${FIELD[i][j]}`, "c"); // Добавляем классы
          if (FIELD[i][j] !== 0) {
            cell.innerHTML = FIELD[i][j].toString(); // Устанавливаем значение ячейки
          }
        }
      }
    }
  }
  
  
  function resetGame(): void {
    SCORE = 0;
    WON = false;
    GENERATE_NEXT = true;
    setWrapper(true, "", "", "none");
  
    // Добавляем обработчик нажатий клавиш
    document.addEventListener("keydown", move);
  
    // Сбрасываем поле
    for (let i = 0; i < HEIGHT; i++) {
      for (let j = 0; j < WIDTH; j++) {
        FIELD[i][j] = 0;
      }
    }
  
    // Добавляем две случайные клетки
    newRandomCell();
    newRandomCell();
  
    // Обновляем интерфейс
    refreshUI();
  }

  function initiateCells(): void {
    const field = document.getElementById("field");
  
    if (field) {
      // Создаем клетки игрового поля
      for (let i = 0; i < WIDTH * HEIGHT; i++) {
        const cell = document.createElement("div");
        cell.className = "c";
        cell.id = (i + 1).toString(); // Преобразование идентификатора в строку
        field.appendChild(cell);
      }
  
      // Добавляем стили для класса `.c`
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