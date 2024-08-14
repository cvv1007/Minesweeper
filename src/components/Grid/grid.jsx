import React from "react";
import { useState } from "react";

import Tile from "../Tile/tile.jsx";
import { directions } from "./constants.js"

import "./gridStyle.css";

function Grid({ x, y, percentMines }) {
    // TODO menu stuff and styling
    let numMines = x * y * (percentMines / 100);
    x = 15
    y = 15
    numMines = 30

    const [gameOver, setGameOver] = useState(false);
    const [gameGrid, setGrid] = useState(createGrid());
    const [update, forceUpdate] = useState(false);

    function createGrid() {
        let grid = [];

        for (let i = 0; i < x; i++) {
            let row = [];
            for (let j = 0; j < y; j++) {
                row.push({ 
                    adjacency: 0, 
                    mine: false, 
                    flag: false, 
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

        if (data.status === 'lose') setGameOver(true);

        if (data.hasOwnProperty("flag")) {
            updateGridCell(row, col, {...tile, flag: data.flag, wrong: data.wrong});
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
                if (countAdjacentFlags === tile.adjacency) {
                    bfsOpenTiles(row, col);
                }
            }
            updateGridCell(row, col, {...tile, open: true});

            if (tile.adjacency === 0) bfsOpenTiles(row, col);
        }
        
        if (gameGrid.every(row => row.every(cell => cellCorrect(cell) ))) {
            console.log("win")
            setGameOver(true);
        }
    }

    // TODO highlight adjacent tiles that are to be opened when adjacency > 0
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

    /*
    * Old function that opened adjacency 0 tiles by clicking child component
    */
    // function propagateOpenTiles(row, col) {
    //     for (let [rDir, cDir] of directions) {
    //         let r = row + rDir;
    //         let c = col + cDir;
            
    //         if (r < 0 || c < 0 || r >= x || c >= y || seen[r*y+c]) continue;
    //         tileRefs.current[r][c].current.click();
    //         seen[r*y+c] = true;
    //     }
    // }

    return (
        <div className="grid" style={ {pointerEvents: gameOver ? 'none':'auto'} }>
            <p id="hidden">{update}</p>
            {gameGrid.map((row, i) => (
                <div className="row" key={i}>
                    {row.map((cell, j) => (
                        <Tile 
                            key={i+j} 
                            id={[i, j]} 
                            mine={cell.mine} 
                            end={gameOver}
                            open={cell.open}
                            wrong={cell.wrong}
                            adjacent={cell.adjacency} 
                            sendData={handleDataFromTile}
                        />
                    ))} 
                </div>
            ))}
        </div>
    );
}

export default Grid;