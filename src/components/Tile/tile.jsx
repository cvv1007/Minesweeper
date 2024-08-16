import React from "react";

import "./tileStyle.css";

function Tile(props) {

    const handleClick = (e) => {
        e.preventDefault();
        if (props.flag) return; 

        if (props.mine) {
            props.sendData({ status: 'lose', loc: props.id });
            return;
        }
        props.sendData({ status: 'open', loc: props.id });
    }

    const handleFlag = (e) => {
        e.preventDefault();
        if (props.open) return;

        let flag = !props.flag;

        props.sendData({ flag, wrong: (flag && !props.mine), loc: props.id });
    }

    function setTileContent() {
        if (props.flag) return "🚩";
        if (props.mine && props.open) return "💥";
        if (props.mine && !props.flag && props.end) return "💣";
        if (props.open && !props.mine && props.adjacent > 0) return props.adjacent;

        return "";
    }

    function setTileClass() {
        let tileClass = "unopened";
        
        if (props.highlight) tileClass = "active";
        if (props.open) tileClass = "opened";
        if ((props.wrong && props.end) || (props.mine && props.open)) tileClass = "wrong";

        return "tile " + tileClass;
    }

    const selectAdjacents = (e) => { 
        const LEFT_CLICK = 0;
        if (e.button !== LEFT_CLICK || props.flag) return;
        props.hover({ status: "select", loc: props.id }) 
    }

    const deselectAdjacents = () => { props.hover({ status: "deselect", loc: props.id }) }

    return (
        <div
            className={setTileClass()}
            onClick={handleClick}
            onContextMenu={handleFlag}
            onMouseDown={selectAdjacents}
            onMouseUp={deselectAdjacents}
            onMouseLeave={deselectAdjacents}
        >
            {setTileContent()}
        </div>
    );
};

export default Tile;