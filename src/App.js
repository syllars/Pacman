import "./styles.css";
import { useEffect, useReducer, useRef, useCallback, memo, useState } from "react";

// constants
const TILE_SIZE = 30;

// cell types
const empty = 0;
const wall  = 1;
const dot   = 2;
const power = 3;

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
  [0,0,0,0,2,0,0,1,0,0,0,0,0,1,0,0,2,0,0,0,0],
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
    return true;
  }
  else {
    return false;
  }
}

function nextPos(next_x, next_y, direction, is_ghost) {
  const speed = 5;
  const dirs = ["up", "down", "right", "left"];
  const at_intersection = "need logic to find when at intersection";
  const wall_up = checkWall(next_x, next_y - 20);
  const wall_down = checkWall(next_x, next_y + 15);
  const wall_left = checkWall(next_x - 20, next_y);
  const wall_right = checkWall(next_x + 15, next_y);

  if (is_ghost && at_intersection) {
    const validDirs = dirs.filter(dir => {
      if (dir === "up") return !checkWall(wall_up);
      if (dir === "down") return !checkWall(wall_down);
      if (dir === "left") return !checkWall(wall_left);
      if (dir === "right") return !checkWall(wall_right);
    })
    if (validDirs > 0) {
      direction = validDirs[Math.floor(Math.random() * validDirs.length)];
    }
  }

  if (direction === "up") {
    if (!wall_up) {
      next_y = next_y - speed;
      next_x = Math.floor(next_x/TILE_SIZE) * TILE_SIZE + TILE_SIZE/2;
    }
    if (is_ghost) {
      direction = dirs[Math.floor(Math.random() * dirs.length)];
    }
  }
  else if (direction === "down") {
    if (!wall_down) {
      next_y = next_y + speed;
      next_x = Math.floor(next_x/TILE_SIZE) * TILE_SIZE + TILE_SIZE/2;
    }
    if (is_ghost) {
      direction = dirs[Math.floor(Math.random() * dirs.length)];
    }
  }
  else if (direction === "left") {
    if (!wall_left) {
      next_x = next_x - speed;
      next_y = Math.floor(next_y/TILE_SIZE) * TILE_SIZE + TILE_SIZE/2;
      if (next_x < 0) {
        next_x = columns * TILE_SIZE;
      }
    }
    if (is_ghost) {
      direction = dirs[Math.floor(Math.random() * dirs.length)];
    }
  }
  else if (direction === "right") {
    if (!wall_right) {
      next_x = next_x + speed;
      next_y = Math.floor(next_y/TILE_SIZE) * TILE_SIZE + TILE_SIZE/2;
      if (next_x > columns * TILE_SIZE) {
        next_x = 0;
      }
    }
    if (wall_right && is_ghost) {
      direction = dirs[Math.floor(Math.random() * dirs.length)];
    }
  }
  if (!is_ghost) {
    return [next_x, next_y];
  }
  else {
    return [next_x, next_y, direction];
  }
}
  
export default function Game() {
  const [objects, setObjects] = useState({
    pacman: { x: 315, y: 495, dir: "" },
    ghosts: [
      { x: 255, y: 315, dir: "right" },
      { x: 285, y: 315, dir: "up" },
      { x: 345, y: 315, dir: "up" },
      { x: 375, y: 315, dir: "left" },
    ],
  });

  useEffect(() => {
    function handleKeyDown(e) {
      const dirMap = {
        ArrowUp: "up",
        ArrowDown: "down",
        ArrowLeft: "left",
        ArrowRight: "right",
      };
      if (dirMap[e.key]) {
        setObjects(prev => ({
          ...prev,
          pacman: { ...prev.pacman, dir: dirMap[e.key] },
        }));
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setObjects(prev => {
        const [next_x_pac, next_y_pac] = nextPos(prev.pacman.x, prev.pacman.y, prev.pacman.dir, false);
        const updatedGhosts = prev.ghosts.map(ghost => {
          const [next_x_ghost, next_y_ghost, next_dir_ghost] = nextPos(ghost.x, ghost.y, ghost.dir, true);
          return { x: next_x_ghost, y: next_y_ghost, dir: next_dir_ghost };
        });

        return {
          ...prev,
          pacman: { ...prev.pacman, x: next_x_pac, y: next_y_pac },
          ghosts: updatedGhosts
        };
      });
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <Board dots={buildDots()} />
      <div
        className="pacman"
        style={{ left: objects.pacman.x, top: objects.pacman.y }}
      />

      {objects.ghosts.map((ghost, index) => (
        <div
          key={index}
          className="ghost"
          style={{ left: ghost.x, top: ghost.y }}
        >
          <div className="ghost__eyes">
            <div className="ghost__eye" />
            <div className="ghost__eye" />
          </div>
        </div>
      ))}
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
  const pos = { left: x * TILE_SIZE, top: y * TILE_SIZE };
  const base = {
    position: "absolute",
    left: x * TILE_SIZE,
    top:  y * TILE_SIZE,
    width:  TILE_SIZE,
    height: TILE_SIZE,
    boxSizing: "border-box",
  };

  if (type == wall) {
    return <div className="cell cell-wall" style={pos} />;
  };

  return (
    <div className="cell" style={pos}>
      {hasDot && type === dot   && <div className="dot" />}
      {hasDot && type === power && <div className="power-pellet" />}
    </div>
  );
});