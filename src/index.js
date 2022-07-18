import React, {useState} from 'react';
import ReactDOM from 'react-dom/client';
import {data} from './DataSource'
import './index.css';

let nextId = 0;

function genId() {
    return ++nextId;
}

function TextBox(props) {
    const xRatio = props.width;
    const yRatio = props.height;
    const x = props.left * xRatio;
    const y = props.top * yRatio;
    const width = (props.right - props.left) * xRatio;
    const height = (props.bottom - props.top) * yRatio;
    const t = props.content;

    return (
        <>
            <svg {...{x, y, width, height}} >
                <text x="50%" y="70%">{t}</text>
            </svg>
            <rect {...{x, y, width, height}} className="tbox"/>
        </>
    );
}

function TextViewer(props) {
    const size = {"width": props.width, "height": props.height};
    const [dragging, setDragging] = useState(null);
    const [selection, setSelection] = useState([]);

    function onClick(e) {
        if (dragging) {
            setSelection([...selection, {...toRectParameter(dragging), id: genId()}])
            setDragging(null);
            console.log('drag ended: ', e);
        } else {
            setDragging({
                start: {x: e.pageX, y: e.pageY},
                end: {x: e.pageX, y: e.pageY}
            });
            console.log('drag started at: ', {x: e.pageX, y: e.pageY});
        }
    }

    function onRightClick(e) {
        if (dragging) {
            setDragging(null);
            console.log('drag canceled: ', e);
            e.preventDefault();
        }
    }

    function onMouseMove(e) {
        if (dragging) {
            setDragging({
                start: dragging.start,
                end: {x: e.pageX, y: e.pageY}
            });
            //console.log('dragging at: ', {x: e.pageX, y: e.pageY});
        }
    }

    function onDelete(e, id){
        setSelection(selection.filter(item=> item.id!==id));
        e.preventDefault();
        e.stopPropagation();
    }

    return (
        <svg {...size} onClick={onClick}
             onContextMenu={onRightClick} onMouseMove={onMouseMove}
        >
            {/*<image href={"imgs/"+props.name+".jpg"}  {...size}/>*/}
            {props.waypoints.map((wp, i) => <TextBox key={i} {...wp} {...size} />)}
            {selection.map((slt) => <Selection key={slt.id} {...slt} onDelete={onDelete} />)}
            <Dragging dragging={dragging}/>
        </svg>
    );
}

function Selection(props) {
    const border_padding = 4;
    const resizer_size = 8;
    const resizer_padding = 2;

    return (
        <svg {...props} className="selection">
            <text x="8" y={props.height - 4}>{props.id}</text>
            <rect x={border_padding} y={border_padding}
                  width={props.width - 4 - border_padding}
                  height={props.height - 4 - border_padding}
                  className="border"/>
            <rect x={resizer_padding} y={resizer_padding}
                  width={resizer_size} height={resizer_size}
                  className="resizer"/>
            <rect x={props.width - resizer_size - resizer_padding}
                  y={props.height - resizer_size - resizer_padding}
                  width={resizer_size} height={resizer_size}
                  className="resizer"/>
            <svg x={props.width - 20} y="0" width="20" height="20"
                 onClick={e=>props.onDelete(e, props.id)}
                 className="delete">
                <circle cx="50%" cy="50%" r="35%" />
                <line x1="25%" y1="25%" x2="75%" y2="75%" />
                <line x1="75%" y1="25%" x2="25%" y2="75%" />
            </svg>
        </svg>
    );
}

function Dragging(props) {
    const dragging = props.dragging;
    if (!(dragging && dragging.start && dragging.end)) {
        return null;
    }
    const par = toRectParameter(dragging);
    return (<rect {...par} className="dragging"/>);
}

function toRectParameter(dragging) {
    let {x, y} = {...dragging.start};
    let [x2, y2] = [dragging.end.x, dragging.end.y];

    if (x > x2) {
        [x, x2] = [x2, x];
    }
    if (y > y2) {
        [y, y2] = [y2, y];
    }
    const [width, height] = [x2 - x, y2 - y];
    const result = {x, y, width, height};
    console.log("toRectParameter: ", dragging, result)
    return result;
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <TextViewer {...data} />
    </React.StrictMode>
);

