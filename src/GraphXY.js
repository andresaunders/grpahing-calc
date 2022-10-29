import {svg_ns, getSVGViewBox, addSVGListeners} from './Svg.js'
import {defaultOptions} from './DefaultOptions.js';
import {addStyle} from './html'

function createXYPlaneCanvas(x_min, x_max, y_min, y_max, options){

    let canvas_container = document.createElement('div');

    addStyle(canvas_container, {
        width: options.width,
        height: options.height,
        marginBottom: options.margin_bottom
    })

    let canvas = document.createElement('canvas');

    let context = canvas.getContext('2d');

}



function createXYPlaneSVG(x_min, x_max, y_min, y_max, options){

    let svg_container = document.createElement('div');

    svg_container.style.width = options.width;

    svg_container.style.height = options.height;

    svg_container.style.marginBottom = options.margin_bottom;

    let svg = document.createElementNS(svg_ns, 'svg');

    svg.style.width = options.width;

    svg.style.height = options.height;

    let view_box = {x_min: x_min, y_min: y_min, width: x_max - x_min, height: y_max - y_min};

    if(options.drawAxes){

        drawLine(svg, 0, y_min - 5, 0, y_max + 5, {width: options.line_width});//y - axes

        drawLine(svg, x_min - 5, 0, x_max + 5, 0, {width: options.line_width}); //x -axes
    }

    if(options.positive_y_axis_up){

        y_min = 0 - y_max;

        view_box.y_min = y_min;
    }

    if(options.drawGridLines){

        let grid_line_width = Number(options.line_width) * .35

        let grid_line_color = '#202020'

        let x_range = x_max - x_min;

        let x_delta = calculateRangeDelta(x_range);

        for(let x = x_delta; x <= x_max; x += x_delta){//draw Y lines

            drawLine(svg, x, y_min, x, y_max, {width: grid_line_width, color: grid_line_color});

            drawLine(svg, -x, y_min, -x, y_max, {width: grid_line_width, color: grid_line_color});
        }

        let y_range = y_max - y_min;

        let y_delta = calculateRangeDelta(y_range);

        for(let y = y_delta; y <= y_max; y += y_delta){//draw Y lines

            drawLine(svg, x_min, y, x_max, y, {width: grid_line_width, color: grid_line_color});

            drawLine(svg, x_min, -1*y, x_max, -1*y, {width: grid_line_width, color: grid_line_color});
        }
    }

    if(options.axis_numbers){


    }
  
    svg.setAttribute('viewBox', `${view_box.x_min} ${view_box.y_min} ${view_box.width} ${view_box.height}`);

    //svg_container.appendChild(svg);

    if(options.append_to_dom) {
        
        document.body.appendChild(svg_container);  
    }

    if(options.add_svg_listeners) {

        addSVGListeners(svg);
    }
   
    return svg;
}

function createXYPlane(x_min = 0, x_max = 200, y_min = 0, y_max = 400, options){

    options = new defaultOptions(options, 
        {
            drawAxes: true, 
            axis_numbers: true,
            drawGridLines: true, 
            positive_y_axis_up: true, 
            line_width: .2,
            add_svg_listeners: true,
            append_to_dom: true,
            height: '100%',//500px
            width: '100%',
            marginBottom: '10px',
            canvas: false,
            svg: true
        });

    if(options.canvas){

        return createXYPlaneCanvas(x_min, x_max, y_min, y_max, options);
    }
    else {

        return createXYPlaneSVG(x_min, x_max, y_min, y_max, options);
    }
}

function calculateRangeDelta(range){

    let delta;

    if(range < 1){

        delta = range/10;
    }
    if(range >= 1 && range < 5){

        delta = .5;
    } 
    if(range >= 5 && range < 25){

        delta = 1;
    }
    if(range >= 25 && range < 75){

        delta = 5;
    }
    else if(range >= 75){

        delta = range/30;
    }

    return delta;
}

function drawPoint(svg, cx, cy, r, options){

    options = new defaultOptions(options, {color: 'black'});

    let point = document.createElementNS(svg_ns, 'circle');

    point.setAttribute('cx', cx);

    point.setAttribute('cy', -cy);

    point.setAttribute('r', r);

    point.setAttribute('fill', options.color);

    svg.appendChild(point);

    return point;
}

function drawVector(){

}

function drawLineCanvas(options){

    let canvas = options.canvas;

    let context = canvas.getContext('2d');

    let x1 = Number(options.x1);

    let y1 = Number(options.y1);

    let x2 = Number(options.x2);

    let y2 = Number(options.y2);

    if(options.moveTo){

        context.moveTo(options.moveTo.x, options.moveTo.y)
    }
    
    for(let point of options.line){}
}

function drawLineSVG(options){

    let svg = options.svg;

    let x1 = Number(options.x1);

    let y1 = Number(options.y1);

    let x2 = Number(options.x2);

    let y2 = Number(options.y2);

    console.log(`x1: ${typeof x1}, x2: ${typeof x2}, y1: ${typeof y1}, y2: ${typeof y2}`)

    if(!options.width){

        options.width = 1;
    }
    if(!options.color){

        options.color = 'black'
    }

    let line = document.createElementNS(svg_ns, 'path');

    let line_path = ''

    try {

        line_path = `M ${x1} ${-1*y1} L ${(x2+x1)/2} ${(-1*y2 + -1*y1)/2} L ${x2} ${-1*y2}`

        console.log(`line_path: ${line_path}`);
    }
    catch(error){

        console.log('line_path_error: ', error);
    }

    /*
        line_path: M -2.40972569747149e+236 3.5 L -2.40972569747149e+236 0 L -2.40972569747149e+236 -3.5
    */
   try{

    line.setAttribute('d', line_path);
   }
   catch(error){

    console.log(`line.setAttribute('d', ${line_path}) error`)
   }
   
    line.setAttribute('stroke', options.color);

    line.setAttribute('stroke-width', options.width);

    if(options.arrow){

        if(options.arrow == 'end'){

            line.setAttribute('marker-end', `url(#${options.arrow_id})`)
        }
        else if(options.arrow == 'start'){

            line.setAttribute('marker-start', `url(#${options.arrow_id})`)
        }
        else if(options.arrow == 'mid'){

            line.setAttribute('marker-mid', `url(#${options.arrow_id})`)
        }
    }

    for(let s in options.style){

        if(s != 'classList'){

            line.style[s] = options.style[s];
        }
        else{

            for(let c of options.style.classList){

                line.classList.add(c);
            }
        }
        
    }

    svg.appendChild(line);

    return line;
}

function drawLine(options){

    options = new defaultOptions(options, {
        svg: null,
        canvas: null,
        x1: null,
        y1: null,
        x2: null,
        y2: null,
        width: 1,
        color: 'black', 
        arrow: null, 
        arrow_id: null, 
        style: {'classList': ['graph-grid-line']}})

    if(options.svg){

        return drawLineSVG(options);
    }
    else if(options.canvas){

        return drawLineCanvas(options);
    }
}

 
function drawFunction(svg, expression, options){

    options = new defaultOptions(options, {t: 0, draw_type: 'line', color: 'black'});

    let math = window.math;

    let expr = math.compile(expression);

    console.log('expr: ', expr);

    let dx = .01;

    let svg_view_box = getSVGViewBox(svg);

    let x_min = Number(svg_view_box.min_x);

    let x_max = x_min + Number(svg_view_box.width);

    let x_values = math.range(x_min, x_max, dx);

    let y_values = x_values.map(x_value => expr.eval({x: x_value, t: options.t}));

    //console.log('x: ', x_values._data, ', y: ', y_values._data)

    for(let i = 0; i < x_values._data.length; i++){

        //let point = {x: }
        //drawGridPoint({x: x_values._data[i], y: y_values._data[i]})
        if(i > 0 && options.draw_type == 'line'){

            let dy = y_values._data[i] - y_values._data[i - 1];

            //console.log('dy: ',dy*grid.y_unit);
            if(!validY(y_values._data[i-1]) || !validY(y_values._data[i])){

                continue;
            }

            drawLine(svg, x_values._data[i-1], y_values._data[i-1],  x_values._data[i], y_values._data[i], {width: .1, color: options.color});
        }
    }
} 

function createParallelPlane(num_dimensions = 2, options){

    options = new defaultOptions(options, {
        min: -20, 
        max: 20, 
        points_as_shape: false, 
        points_as_lines: true, 
        positive_y_axis_up: true, 
        add_svg_listeners: true
    });

    let svg_container = document.createElement('div');

    svg_container.style.width = '100%';

    svg_container.style.height = '500px';

    svg_container.style.marginBottom = '10px'

    let svg = document.createElementNS(svg_ns, 'svg');

    svg.style.width = '100%';

    svg.style.height = '100%';

    let dimension_line_coordinate_spacing = (Number(options.max)-Number(options.min))/2;

    let dimension_width = dimension_line_coordinate_spacing * (num_dimensions - 1);

    let x_min = -5

    let view_box = {x_min: x_min, y_min: options.min, width: dimension_width + 10, height: options.max - options.min};

    for(let d = 0; d < num_dimensions; d++){

        let x = d*dimension_line_coordinate_spacing

        drawLine(svg, x, options.min, x, options.max);
    }

    //0 horizontal line
    drawLine(svg, 0, 0, dimension_width, 0);

    svg.setAttribute('viewBox', `${view_box.x_min} ${view_box.y_min} ${view_box.width} ${view_box.height}`);

    svg_container.appendChild(svg);

    document.body.appendChild(svg_container); 
    
    if(options.add_svg_listeners) {
        
        addSVGListeners(svg);
    }
   
    return svg;
}

function drawParallelPoint(svg, point){


}

function drawParallelVector(svg, vector){

}

function validY(y){

    return Number.isInteger(Math.floor(y));
}

/*

    Graph a function/ set of points in complex plane, and apply a function to the set of points and show function in separate graph

*/

export {
    createXYPlane, drawPoint, drawLine, drawFunction, createParallelPlane
}

export default{
    createXYPlane, drawPoint, drawLine, drawFunction, createParallelPlane
}