import React from "react";
import { useState } from "react";

import Tile from "../Tile/tile.jsx";
import { directions } from "./constants.js"

import "./gridStyle.css";

function Grid({ x, y, percentMines, refresh }) {
    const numMines = Math.floor(x * y * (percentMines / 100));

    const [gameOver, setGameOver] = useState(false);
    const [gameGrid, setGrid] = useState(createGrid());
    const [update, forceUpdate] = useState(false);
    const [counter, updateCounter] = useState(numMines);

    // Refresh game grid on Restart press
    const [restart, restartGame] = useState(refresh);
    if (restart !== refresh) {
        restartGame(refresh);
        setGameOver(false);
        updateCounter(numMines);
        setGrid(createGrid());
    }

    function createGrid() {
        let grid = [];

        for (let i = 0; i < x; i++) {
            let row = [];
            for (let j = 0; j < y; j++) {
                row.push({ 
                    adjacency: 0, 
                    mine: false, 
                    flag: false, 
                    highlight: false,
                    open: false, 
                    loc: [i, j],
                });
            }
            grid.push(row);
        }
        generateMines(grid);
        return grid;
    }

    function generateMines(grid) {
        const minesSet = new Set();
        let setMines = 0;
        while (setMines < numMines) {
            let row = Math.floor(Math.random() * grid.length);
            let col = Math.floor(Math.random() * grid[0].length);
            if (minesSet.has(`r${row}c${col}`)) continue;

            minesSet.add(`r${row}c${col}`);
            setMines++;
            grid[row][col].mine = true;
            grid[row][col].adjacency = -1;
            grid = updateTileAdjacency(grid, row, col);
        }
        return grid;
    }

    function updateTileAdjacency(grid, row, col) {
        for (let i = row - 1; i <= row + 1; i++) {
            for (let j = col - 1; j <= col + 1; j++) {
                if (i < 0 || j < 0 || i >= x || j >= y || 
                    (i === row && j === col) || grid[i][j].mine) continue;
                grid[i][j].adjacency++;
            }
        }
        return grid;
    }

    function updateGridCell(row, col, newCell) {
        let gridCopy = gameGrid;
        gridCopy[row][col] = newCell;
        setGrid(gridCopy);
    }

    function handleDataFromTile(data) {
        const [row, col] = data.loc;
        const tile = gameGrid[row][col];
        const cellCorrect = (cell) => { return (cell.flag === cell.mine) && (!cell.mine === cell.open) };

        if (data.status === 'lose') {
            updateGridCell(row, col, {...tile, wrong: true, open: true});
            setGameOver(true);
        }

        if (data.hasOwnProperty("flag")) {
            updateGridCell(row, col, {...tile, flag: data.flag, wrong: data.wrong});
            data.flag ? updateCounter(counter - 1) : updateCounter(counter + 1);
        }

        if (data.status === 'open') {
            if (tile.open && tile.adjacency > 0) {
                let countAdjacentFlags = 0;

                for (const [rDir, cDir] of directions) {
                    const r = row + rDir;
                    const c = col + cDir;
                    if (r < 0 || c < 0 || r >= x || c >= y) continue;
                    if (gameGrid[r][c].flag) countAdjacentFlags++;
                }
                if (countAdjacentFlags === tile.adjacency) bfsOpenTiles(row, col);            
            }
            updateGridCell(row, col, {...tile, open: true});
            forceUpdate(!update);

            if (tile.adjacency === 0) bfsOpenTiles(row, col);
        }
        
        if (gameGrid.every(row => row.every(cell => cellCorrect(cell) ))) {
            // TODO do something on win and add more styling
            console.log("win")
            setGameOver(true);
        }
    }

    function handleHover(data) {
        const [row, col] = data.loc;

        if (data.status === 'select') {
            let gridCopy = gameGrid;
            gridCopy[row][col].highlight = true;
            
            if (gridCopy[row][col].open) {
                for (const [rDir, cDir] of directions) {
                    const r = row + rDir;
                    const c = col + cDir;
                    if (r < 0 || c < 0 || r >= x || c >= y || gameGrid[r][c].flag) continue;
                    gridCopy[r][c].highlight = true;
                }
            }
            setGrid(gridCopy);
            forceUpdate(!update);
        }

        if (data.status === 'deselect') {
            setGrid(gameGrid.map((row) => row.map((tile) => tile = { ...tile, highlight: false } )));
            forceUpdate(!update);
        }
    }

    function bfsOpenTiles(row, col) {
        let gridCopy = gameGrid;
        const queue = [gameGrid[row][col]];

        while (queue.length > 0) {
            const tile = queue.shift();
            const [i, j] = tile.loc;

            for (const [rDir, cDir] of directions) {
                const r = i + rDir;
                const c = j + cDir;
                
                if (r < 0 || c < 0 || r >= x || c >= y || gridCopy[r][c].open || gridCopy[r][c].flag) continue;
                gridCopy[r][c].open = true;

                if (gridCopy[r][c].mine) setGameOver(true);
                if (gridCopy[r][c].adjacency === 0) queue.push(gridCopy[r][c]);
            }
        }
        setGrid(gridCopy);
        forceUpdate(!update);
    }

    return (
        <div className="grid" style={ {pointerEvents: gameOver ? 'none':'auto'} }>
            <p id="hidden">{update}</p>
            <div>Remaining Mines: {counter > 0 ? counter : 0}</div>
            {gameGrid.map((row, i) => (
                <div className="row" key={i}>
                    {row.map((cell, j) => (
                        <Tile 
                            key={i+j} 
                            id={[i, j]} 
                            end={gameOver}
                            mine={cell.mine} 
                            open={cell.open}
                            flag={cell.flag}
                            wrong={cell.wrong}
                            adjacent={cell.adjacency} 
                            highlight={cell.highlight}
                            sendData={handleDataFromTile}
                            hover={handleHover}
                        />
                    ))} 
                </div>
            ))}
        </div>
    );
}

export default Grid;