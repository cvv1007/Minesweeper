import React from "react";
import { useState } from "react";

import "./tileStyle.css";

function Tile(props) {
    const [flagged, setFlag] = useState(false);
    const [opened, setOpen] = useState(false);

    const handleClick = (e) => {
        e.preventDefault();
        if (flagged) return; 

        setOpen(true);
        if (props.mine) {
            props.sendData({ status: 'lose', loc: props.id });
            return;
        }
        props.sendData({ status: 'open', loc: props.id });
    }

    const handleFlag = (e) => {
        e.preventDefault();
        if (opened || props.open) return;

        let flag = true;
        if (flagged) flag = false;
        setFlag(!flagged);

        props.sendData({ 
            flag,
            wrong: (flag && !props.mine),
            loc: props.id, 
        });
    }

    function setTileContent() {
        if (flagged) return "🚩";
        if (props.mine && (opened || props.open)) return "💥";
        if (props.mine && !flagged && props.end) return "💣";
        if ((opened || props.open) && !props.mine && props.adjacent > 0) return props.adjacent;

        return "";
    }

    function setTileClass() {
        let tileClass = "unopened";
        
        if (props.open || opened) tileClass = "opened";
        if ((props.wrong && props.end) || (props.mine && (opened || props.open))) tileClass = "wrong";

        return "tile " + tileClass;
    }

    return (
        <div
            className={setTileClass()}
            onClick={handleClick}
            onContextMenu={handleFlag}
        >
            {setTileContent()}
        </div>
    );
};

export default Tile;