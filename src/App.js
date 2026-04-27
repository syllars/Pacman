import { useEffect, useReducer, useRef, useCallback, memo, useState } from "react";

// constants
const TILE_SIZE = 30;

// directions
const dir = {
    up:    { x:  0, y: -1 },
    down:  { x:  0, y:  1 },
    left:  { x: -1, y:  0 },
    right: { x:  1, y:  0 },
  };

// cell types
const empty = 0;
const wall  = 1;
const dot   = 2;
const power = 3;
const portal = 4;

const board_template = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,3,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,3,1],
  [1,2,1,1,2,1,1,1,2,1,1,1,2,1,1,1,2,1,1,2,1],
  [1,2,1,1,2,1,1,1,2,1,1,1,2,1,1,1,2,1,1,2,1],
  [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
  [1,2,1,1,2,1,2,1,1,1,1,1,1,1,2,1,2,1,1,2,1],
  [1,2,2,2,2,1,2,2,2,2,1,2,2,2,2,1,2,2,2,2,1],
  [1,1,1,1,2,1,1,1,0,1,1,1,0,1,1,1,2,1,1,1,1],
  [1,1,1,1,2,1,0,0,0,0,0,0,0,0,0,1,2,1,1,1,1],
  [1,1,1,1,2,1,0,1,1,0,1,0,1,1,0,1,2,1,1,1,1],
  [4,0,0,0,0,2,0,0,1,0,0,0,0,0,1,0,0,2,0,0,0,0,4],
  [1,1,1,1,2,1,0,1,1,1,1,1,1,1,0,1,2,1,1,1,1],
  [1,1,1,1,2,1,0,0,0,0,0,0,0,0,0,1,2,1,1,1,1],
  [1,1,1,1,2,1,0,1,1,1,1,1,1,1,0,1,2,1,1,1,1],
  [1,2,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,2,1],
  [1,2,1,1,2,1,1,1,2,1,1,1,2,1,1,1,2,1,1,2,1],
  [1,3,2,1,2,2,2,2,2,2,0,2,2,2,2,2,2,1,2,3,1],
  [1,1,2,1,2,1,2,1,1,1,1,1,1,1,2,1,2,1,2,1,1],
  [1,2,2,2,2,1,2,2,2,2,1,2,2,2,2,1,2,2,2,2,1],
  [1,2,1,1,1,1,1,1,2,1,1,1,2,1,1,1,1,1,1,2,1],
  [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
];

const rows = board_template.length;
const columns = board_template[0].length;


function buildDots() {
  const dots = new Set();
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < columns; x++) {
      if (board_template[y][x] === dot || board_template[y][x] === power) {
        dots.add(`${x},${y}`)
      }
    }
  }
  return dots;
}

function checkWall(next_x, next_y) {
  const index_x = Math.round((next_x/TILE_SIZE)-0.5);
  const index_y = Math.round((next_y/TILE_SIZE)-0.5);
  if (board_template[index_y][index_x] === 1) {
    return "wall";
  }
  else {
    if (index_y === 10 && (index_x === 0 || index_x === 20)) {
      return "loop"
    }
    else {
      return "free";
    }
  }
}

function nextPos(prev, direction) {
  const speed = 5;
  let next_x = prev.circle1.x;
  let next_y = prev.circle1.y;
  if (direction === "up") {
    if (checkWall(next_x, next_y - 20) === "free") {
      next_y = next_y - speed;
    }
  }
  else if (direction === "down") {
    if (checkWall(next_x, next_y + 15) === "free") {
      next_y = next_y + speed;
    }
  }
  else if (direction === "left") {
    if (checkWall(next_x - 20, next_y) === "free") {
      next_x = next_x - speed;
    }
    else if (checkWall(next_x - 20, next_y) === "loop") {
      next_x = 585;
    }
  }
  else if (direction === "right") {
    if (checkWall(next_x + 15, next_y) === "free") {
      next_x = next_x + speed;
    }
    else if (checkWall(next_x + 15, next_y) === "loop") {
      next_x = 15;
    }
  }
  return [next_x, next_y];
}

export default function Game() {
   const [objects, setObjects] = useState({
    circle1: { x: 315, y: 495 },
  });
  const direction_x = useRef(0);
  const direction_y = useRef(0);
  const direction = useRef(0);

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "ArrowUp") {direction.current = "up";}
      if (e.key === "ArrowDown") {direction.current = "down";}
      if (e.key === "ArrowLeft") {direction.current = "left";}
      if (e.key === "ArrowRight") {direction.current = "right";}
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setObjects(prev => {
        const [next_x, next_y] = nextPos(prev, direction.current);
        return {
          circle1: { x: next_x, y: next_y }
        }
      });
    }, 50);

    return () => clearInterval(interval);
  }, []);

/*
  return (
    <div>
        <Board dots={buildDots()} />
    </div>
  );
*/
return (
  <div>
    <Board dots={buildDots()} />
    <div style={{
      position: "absolute",
      left: objects.circle1.x,
      top: objects.circle1.y,
      transform: "translate(-50%, -50%)",
      width: 22, height: 22,
      borderRadius: "50%",
      background: "#FFD700"
    }} />
  </div>

);
}

// memo cuts unnessesary rerenders
const Board = memo(function Board({ dots }) {
  const cells = [];
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < columns; x++) {
      const type = board_template[y][x];
      const key  = `${x},${y}`;
      // dots is going to be a passed in list of all squares with dots
      const hasDot = dots.has(key);
      cells.push(
        <Cell key={key} x={x} y={y} type={type} hasDot={hasDot} />
      );
    }
  }
  return <div>{cells}</div>;
});

const Cell = memo(function Cell({ x, y, type, hasDot }) {
  const base = {
    position: "absolute",
    left: x * TILE_SIZE,
    top:  y * TILE_SIZE,
    width:  TILE_SIZE,
    height: TILE_SIZE,
    boxSizing: "border-box",
  };

  if (type == wall) {
    return(
      <div style={{ ...base, background: "#1a1aff", border: "1px solid #3333ff", borderRadius: 3 }} />
    )
  };

  return(
    <div style={{ ...base, background: "#000" }}>
      {hasDot && type === dot && (
        <div style={styles.dot} />
      )}
      {hasDot && type === power && (
        <div style={styles.powerPellet} />
      )}
    </div>
  );
});

/*
function PacmanSprite({x, y, dir, mouthOpen}) {
  // have to convert objects into strings
  const rotationMap = {
    [JSON.stringify(dir.right)]: 0,
    [JSON.stringify(dir.left)]:  180,
    [JSON.stringify(dir.up)]:    270,
    [JSON.stringify(dir.down)]:  90,
  };
  const rotation = rotationMap[JSON.stringify(dir)];
  const mouth    = mouthOpen ? 40 : 5;

  return(
    <div style={{
      position: "absolute",
      left:  position.x * TILE_SIZE,
      top:   position.y * TILE_SIZE,
      width:  TILE_SIZE,
      height: TILE_SIZE,
      transform: `rotate(${rotation}deg)`,
      transition: "left 0.1s linear, top 0.1s linear",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: TILE_SIZE - 2,
      height: TILE_SIZE - 2,
      borderRadius: "50%",
      background: "#00ffaa",
      clipPath: `polygon(50% 50%, 100% ${mouth}%, 100% 0%, 0% 0%, 0% 100%, 100% 100%, 100% ${100-mouth}%)`,
      boxShadow: powered ? `0 0 8px ${color}` : "none",
    }}></div>
  )
}
*/




const styles = {
  dot: {
    position: "absolute",
    top: "50%", left: "50%",
    transform: "translate(-50%, -50%)",
    width: 4, height: 4,
    borderRadius: "50%",
    background: "#FFD700",
  },
  powerPellet: {
    position: "absolute",
    top: "50%", left: "50%",
    transform: "translate(-50%, -50%)",
    width: 10, height: 10,
    borderRadius: "50%",
    background: "#FFD700",
    boxShadow: "0 0 6px #FFD700",
    animation: "pulse 0.5s ease-in-out infinite alternate",
  },
};