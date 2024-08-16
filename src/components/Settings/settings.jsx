import React from "react";
import { useState } from "react";

import Grid from "../Grid/grid.jsx";

import "./settings.css";

function Settings() {
    const DEFAULT_DIM = 9;
    const DEFAULT_MINES = 10;

    const [x, setXvalue] = useState(DEFAULT_DIM);
    const [y, setYvalue] = useState(DEFAULT_DIM);
    const [percentMines, setPercentMines] = useState(DEFAULT_MINES);
    const [refresh, refreshGame] = useState(false);

    const handleXChange = (e) => { setXvalue(e.target.valueAsNumber > 0 ? e.target.valueAsNumber : 1) }
    const handleYChange = (e) => { setYvalue(e.target.valueAsNumber > 0 ? e.target.valueAsNumber : 1) }

    const handleMineChange = (e) => { 
        let minePercent = e.target.valueAsNumber;
        if (minePercent < 0) minePercent = 0;
        if (minePercent > 100) minePercent = 100;

        setPercentMines(minePercent);
    }

    const restartGame = () => { refreshGame(!refresh) }

    return (
        <div className="settings">
            <div className="inputs">
                <button onClick={restartGame}>Restart</button>
                <input type="number" min="1" defaultValue={DEFAULT_DIM} onChange={handleXChange}></input>
                <input type="number" min="1" defaultValue={DEFAULT_DIM} onChange={handleYChange}></input>
                <input type="number" min="0" defaultValue={DEFAULT_MINES} max="100" onChange={handleMineChange}></input>
            </div>
            <Grid x={x} y={y} percentMines={percentMines} refresh={refresh} />
        </div>
    )
}

export default Settings;