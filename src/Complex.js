
import {defaultOptions} from './DefaultOptions.js';
import { getObjectString } from './Format.js';
import {svg_ns, addSVGListeners, transformPointToSVG} from './Svg.js';
import {evalComplexExpression} from './Expression'
import {createXYPlane, drawPoint, drawLine, drawFunction} from './GraphXY.js';
import {randomRange} from './Random'

let z_index = 0;

let z_max = 10;

let use_z_max = false;

let eval_function = 'evaluate'

class Angle {

    constructor(theta, type = 'rad'){

        this.theta = theta;
        
        this.type = type;
    }

    toRad(){

        if(this.type == 'rad'){

            return this.theta;
        }

        if(this.type == 'deg'){

            return this.theta * Math.PI/(180);
        }

        if(this.type == 'fraction'){

            return this.theta * 2 * Math.PI;
        }
    }

    toDeg(){

        if(this.type == 'rad'){

            return this.theta * (180/Math.PI);
        }

        if(this.type == 'deg'){

            return this.theta;
        }

        if(this.type == 'fraction'){

            return this.theta * 360;
        }
    }

    toFraction(){

        if(this.type == 'rad'){

            return this.theta/(2 * Math.PI)
        }

        if(this.type == 'deg'){

            return this.theta/(360)
        }

        if(this.type == 'fraction'){

            return this.theta;
        }
    }

    static copy(a){

        return new Angle(a.theta, a.type);
    }
}

class Z {

    constructor(a,b, angle = null, is_unit = false, conjugate = null){

        if(use_z_max && z_index > z_max){

            return;
        }

        z_index++;

        this.a = a;

        this.b = b;   

        this.abs = is_unit ? 1 : Z.abs(this);

        console.log(`a: ${a}, b: ${b}, abs: ${this.abs}`);

        this.unit = is_unit ? this : Z.unit(this);

        console.log('unit: ', this.unit)

        this.angle = angle ? angle : Z.angle(this);

        console.log('angle: ', this.angle);

        this.conjugate = conjugate ?  conjugate : Z.conjugate(this);

        console.log('conjugate: ', this.conjugate);
    }

    valueString(){

        return `${this.a} + ${this.b} * i`;
    }

    toString(){

        let a = Number(this.a);

        let b = Number(this.b);

        let angle = Number(this.angle.toRad());

        let abs = Number(this.abs);

        let s = `{a: ${a.toFixed(2)}, b: ${b.toFixed(2)}, angle: ${angle.toFixed(2)}, abs: ${abs.toFixed(2)}}`;

        return s;
    }

    static add(){

        let z_array = Array.from(arguments);

        let a_sum = 0;

        let b_sum = 0;

        let new_z;

        for(let z of z_array){

            a_sum += z.a;

            b_sum += z.b;
        }

        new_z = new Z(a_sum, b_sum);

        return new_z;
    }

    static multiply(){

        let z_array = Array.from(arguments);

        if(z_array.length == 0){

            return new Z(0, 0);
        }

        if(z_array.length == 1){

            return new Z(z_array[0].a, z_array[0].b);
        }

        let first = Z.copy(z_array[0]);

        console.log(`first: ${first.toString()}`)

       for(let index = 1; index < z_array.length; index++){

        let second = z_array[index];

        console.log(`${index + 1}: ${second.toString()}`)

        //(a1 + b1*i)(a2 + b2*i) = (a1*a2 + a1*b2*i + b1*a2*i + b2*b1*-1)
        let a1 = Number(first.a);
        let b1 = Number(first.b);
        let a2 = Number(second.a);
        let b2 = Number(second.b);

        first.a = (a1 * a2) - (b1 * b2);

        first.b = (a1 * b2) + (b1 * a2);

        console.log(`product a: ${first.a}, b: ${first.b}`);
       }

       return new Z(first.a, first.b);
    }

    static subtract(z1 ,z2){

        let sub = new Z(z1.a - z2.a, z1.b - z2.b);

        return sub;
    }

    // ((a,b))/((c,d))=((ac+bd)/(c^2+d^2),(bc-ad)/(c^2+d^2)). 
    static divide(z1 , z2){//z1 / z2

        let denom = sqr(z2.a) + sqr(z2.b);

        let div_a = (z1.a * z2.a + z1.b *z2.b)/(denom);

        let div_b = (z1.b * z2.a - z1.a * z2.b)/(denom);

        return new Z(div_a, div_b);
    }

    static conjugate(z){

        return new Z(z.a, -z.b, null, this.abs == 1, this);
    }

    static rotate(z, theta){

        let new_angle = z.angle + theta;

        return new Z.polar(new_angle, z.abs);
    }

    static unit(z){

        let abs_z = Z.abs(z);

        let a =z.a/abs_z
        let b = z.b/abs_z;

        let u = {
            a: a,
            b: b,
            abs: 1,
            unit: null,
            conjugate: {
                a: a,
                b: -b,
                abs: 1,
                unit: null,
                angle: new Angle(Math.atan(-b/a))
            },
            angle: new Angle(Math.atan(b/a)),
        };

        return u;
    }

    static abs(z){

        return sqrt(sqr(z.a) + sqr(z.b))
    }

    static angle(z){

        return new Angle(Math.atan(z.b/z.a));
    }
    
    static polar(r, angle){

        let theta = angle.toRad();

        let a = Math.sin(theta) * r;

        let b = Math.sin(theta) * r;

        return new Z(a, b);
    }
    
    static exponentialForm(z){


    }

    static pow(z, pow){

        console.log(`Z.pow | z: ${z.toString()} | pow: ${pow.toString()}`);

        let z_angle = z.angle.toRad();

        let r = Math.pow(z.abs, pow.a) * Math.pow(Math.E, -pow.b * z_angle);
      
        let new_angle = (pow.a * z_angle) + (pow.b * Math.log(z.abs));

        let exp_a = r * Math.cos(new_angle);

        let exp_b = r * Math.sin(new_angle);

        let exp_z = new Z(exp_a, exp_b);

        Z.round(exp_z, ['a', 'b']);

        return exp_z;
    }

    static round(z, prop_array){

        for(let prop of prop_array){

            let z_prop = Number(z[prop]);

            let min = .00000000001;
    
            let diff_ceiling = Math.ceil(z_prop) - z_prop;
    
            let diff_floor = z_prop - Math.floor(z_prop);
    
            if(diff_ceiling <= min){
    
                z[prop] = Math.ceil(z_prop);
            }
            else if(diff_floor <= min){
    
                z[prop] = Math.floor(z_prop);
            }
        }
    }


    static calculateDistance(z1, z2){

        let d_2 = Math.pow(z1.a - z2.a, 2) + Math.pow(z1.b - z2.b, 2);

        return Math.sqrt(d_2);
    }

    static copy(z){

        let copy_angle = Angle.copy(z.angle);

        let z_copy = new Z(z.a, z.b, copy_angle);

        return z_copy;
    }

    static function(f_expression, z){

        let parser = window.math.parser();

        parser[eval_function](`f(z) = ${f_expression}`);

        let eval_expression = parser[eval_function](`f(${z.a} + ${z.b}i)`);

        return new Z(eval_expression.re, eval_expression.im);
    }

    static parametricFunction(parametric_expression, dependent_var_name, independent_var_values){

        let parser = window.math.parser();

        parser[eval_function](parametric_expression);

        let independent_values = '';

        for(let i in independent_var_values){

            let v = independent_var_values[i];

            independent_values += v;

            if(i < independent_var_values.length - 1){

                independent_values += ','
            }
        }

        let eval_expression = parser[eval_function](`${dependent_var_name}(${independent_values})`);

        return eval_expression
    }

    static random(options){

        options = new defaultOptions(options, {
            min_a: -10, 
            max_a: 10, 
            min_b: -10,
            max_b: 10
        })

        let min_a = options.min_a
        let max_a = options.max_a
        let min_b = options.min_b
        let max_b = options.max_b

        let a = randomRange(min_a, max_a);

        let b = randomRange(min_b, max_b);

        return new Z(a, b);
    }
}

function sqr(n){

    return Math.pow(n,2);
}

function sqrt(n){

    return Math.sqrt(n);
}

function drawComplexFunctionAsVectorTransform(){


}

   //given z -> z

    /*

    f:z -> z
    a+bi -> c+di

    show:
    a -> c
    a -> d
    b -> c
    b -> d


            |
            |
            |
            |
            |
 a -> c     |  a -> d
----------------------------
 b -> c     |  b -> d
            |
            |
            |
            |
            |

            Where each quadrant is an bounded xy plane
            a curve is formed for all (ai, b) - connect each point with
    */

/*
function drawComplexFunctionAsCombination(svg, expression, options = {t: 0, draw_type: 'line'}){

    let math = window.math;

    let algebrite = window.Algebrite;

    let expanded_string = algebrite.expand(expression).toString();

    let compiled_expression = math.compile(expanded_string);

    compiled_expression[eval_function]({a: a, b: b})

    let svg_view_box = getSVGViewBox(svg);

    let x_min = Number(svg_view_box.min_x);

    let x_max = x_min + Number(svg_view_box.width);

    let x_values = math.range(x_min, x_max, dx);

    let y_values = x_values.map(x_value => expr[eval_function]({a: x_value, t: options.t}));

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

            drawLine(svg, x_values._data[i-1], y_values._data[i-1],  x_values._data[i], y_values._data[i], {width: .1, color: 'black'});
        }
    }
    //)(a + bi) expand into complex number

    //convert to x and y
}*/

function drawComplexPlane(options){

    options = new defaultOptions(options, {a_min: -10, a_max: 10, b_min: -10, b_max: 10, 
    listeners: [], append_to_dom: true, height: '500px', width: '100%', marginBottom: '10px'
    });

    let a_min = Number(options.a_min);

    let a_max = Number(options.a_max);

    let b_min = Number(options.b_min)

    let b_max = Number(options.b_max);

    let svg = createXYPlane(a_min, a_max, b_min, b_max, {drawAxes: true, drawGridLines: true, positive_y_axis_up: true, line_width: .1, add_svg_listeners: false, append_to_dom: options.append_to_dom});

    addSVGListeners(svg, {point: false});

    //addComplexSVGPointListener(svg);

    return svg;
}

function complexFunction(z){

    //`z^2 - z + 3(1 + 2i)`
    /* () operations
        let z_1 = Z.pow(z, 2);
        let z_2 = Z.subtract(z, z_1);
        let z_3 = Z.add(new Z(3, 6), z_2);
        return z_3;
    */
}

class ComplexFunctionParameters {

    constructor(options){

        this.post_fix_id = options.post_fix_id;

        this.unique_id = options.unique_id;

        this.a_expression = 't';

        this.b_expression = 't';

        this.t_min = -10;

        this.t_max = 10;

        this.t_delta = .05

        this.t_animated = false;

        this.container = this.createParameterDOM();

        this.graph_functions = options.complex_graph_functions;

       // this.added_event_listeners = false;

        this.addEventListeners();
    }

    createParameterDOM(){

        let parameter_container = document.createElement('div');

        parameter_container.id = this.createId('param-container')

        parameter_container.style.width = '100%';

        parameter_container.style.height = '100%';

        parameter_container.style.display = 'flex';

        parameter_container.style.flexDirection = 'column';

        parameter_container.style.alignItems = 'center';


        let a_expression_container = document.createElement('div');

        a_expression_container.id = this.createId('a-expr-container')

        a_expression_container.style.display = 'flex';

        a_expression_container.style.width = '100%';

        //a_expression_container.style.height = '20px';

        a_expression_container.style.flexDirection = 'row';

        a_expression_container.style.justifyContent = 'flex-start';


        let a_expression_label = document.createElement('label');

        a_expression_label.textContent = 'a(t)';


        let a_expression_input = document.createElement('input')

        a_expression_input.id = this.createId('a-expr-input');

        a_expression_input.style.width = '40%';

        a_expression_input.value = 't';


        a_expression_container.appendChild(a_expression_label);

        a_expression_container.appendChild(a_expression_input);


        let b_expression_container = document.createElement('div');

        b_expression_container.id = this.createId('b-expr-container');

        b_expression_container.style.display = 'flex';

        b_expression_container.style.width = '100%';

        //b_expression_container.style.height = '20px';

        b_expression_container.style.flexDirection = 'row';

        b_expression_container.style.justifyContent = 'flex-start';


        let b_expression_label = document.createElement('label');

        b_expression_label.textContent = 'b(t)';


        let b_expression_input = document.createElement('input')

        b_expression_input.id = this.createId('b-expr-input');

        b_expression_input.style.width = '40%';

        b_expression_input.value = 't';

        b_expression_container.appendChild(b_expression_label);

        b_expression_container.appendChild(b_expression_input);


        let t_container = document.createElement('div');

        t_container.id = this.createId('t-container');

        t_container.style.display = 'flex';

        t_container.style.flexDirection = 'column';

        t_container.style.width = '100%';

        let t_min_max_container = document.createElement('div');

        t_min_max_container.id = this.createId('t-min-max-container');

        t_min_max_container.style.display = 'flex';

        t_min_max_container.style.flexDirection = 'row';

        let t_min_input = document.createElement('input');

        t_min_input.id = this.createId('t-min-input');

        t_min_input.style.width = '20%';

        let t_min_label = document.createElement('label');

        t_min_label.textContent = 't_min'

        t_min_input.value = -10;

        let t_max_label = document.createElement('label');

        t_max_label.textContent = 't_max'

        let t_max_input = document.createElement('input');

        t_max_input.id = this.createId('t-max-input');

        t_max_input.style.width = '20%';

        t_max_input.value = 10;

        t_min_max_container.appendChild(t_min_label);

        t_min_max_container.appendChild(t_min_input);

        t_min_max_container.appendChild(t_max_label);

        t_min_max_container.appendChild(t_max_input);

        t_container.appendChild(t_min_max_container);


        let t_animate_container = document.createElement('div');

        t_animate_container.id = this.createId('t-animate-container');

        t_animate_container.style.width = '100%';

        t_animate_container.style.display = 'flex';

        t_animate_container.style.flexDirection = 'row';

        let t_animate_label = document.createElement('label');

        t_animate_label.textContent = 'animate'

        let t_animate_input = document.createElement("input");

        t_animate_input.id = this.createId('t-animate-input');

        t_animate_input.style.width = '20px';

        t_animate_input.setAttribute("type", "checkbox");
        
        t_animate_container.appendChild(t_animate_label);

        t_animate_container.appendChild(t_animate_input);

        t_container.appendChild(t_animate_container);


        let t_use_parameter_container = document.createElement('div');

        t_use_parameter_container.id = this.createId('t-use-param-container');

        t_use_parameter_container.style.width = '100%';

        t_use_parameter_container.style.display = 'flex';

        t_use_parameter_container.style.flexDirection = 'row';

        let t_use_param_label = document.createElement('label');

        t_use_param_label.textContent = 'use_param';

        let t_use_param_input = document.createElement('input');

        t_use_param_input.id = this.createId('use-param-input');

        t_use_param_input.style.width = '20px';

        t_use_param_input.setAttribute('type', 'checkbox');

        t_use_parameter_container.appendChild(t_use_param_label);

        t_use_parameter_container.appendChild(t_use_param_input);

        t_container.appendChild(t_use_parameter_container);


        parameter_container.appendChild(a_expression_container);

        parameter_container.appendChild(b_expression_container);

        parameter_container.appendChild(t_container);

        let selectors = document.querySelectorAll(`#${this.getID('function-option-parameters-container')}`);

        console.log('selectors: ', selectors);
        
        let selector = selectors[selectors.length - 1];
        
        selector.appendChild(parameter_container);

        return parameter_container;
    }

    addEventListeners(){

        //do i include a reference to the ComplexGraph?
        // if so that will introduce a circular reference and overflow
        // if not how do i access it? 
        //maybe ComplexGraph.getGraph(id)

        console.log('addeventlisteners complexfunctionparams')

        let use_input = this.container.querySelector(`#${this.getID('use-param-input')}`);

        use_input.addEventListener('change', (e) => {

            if(use_input.checked){

                this.graph_functions['input'](this.getInput(), this.unique_id);
            }
        })

        let a_input = this.container.querySelector(`#${this.getID('a-expr-input')}`);

        console.log('a_input: ', a_input);

        a_input.addEventListener('input', (e) => {

            console.log('a_input ', a_input.value);

            this.changeAExpression(a_input.value);
        });

        let b_input =  this.container.querySelector(`#${this.getID('b-expr-input')}`);

        b_input.addEventListener('input', (e) => {

            console.log('b_input ', b_input.value);

            this.changeBExpression(b_input.value);
        });

        let t_min_input =  this.container.querySelector(`#${this.getID('t-min-input')}`);

        t_min_input.addEventListener('input', (e) => {

            console.log('t_min ', t_min_input.value);

            this.changeTMin(t_min_input.value);
        });

        let t_max_input =  this.container.querySelector(`#${this.getID('t-max-input')}`);

        t_max_input.addEventListener('input', (e) => {

            console.log('t_max ', t_max_input.value);

            this.changeTMax(t_max_input.value);
        });
    }

    getInput(){

        let input = [];

        let t = Number(this.t_min);

        let parser = window.math.parser();
        
        parser[eval_function](`a(t) = ${this.a_expression}`);

        parser[eval_function](`b(t) = ${this.b_expression}`);
        
        while(t < Number(this.t_max)){

            t += Number(this.t_delta);

            let a = parser[eval_function](`a(${t})`);

            let b = parser[eval_function](`b(${t})`);

            let z = new Z(a,b);

            input.push(z);
        }

        return input;
    }

    createId(prefix){

        return this.getID(prefix);
    }

    getID(prefix){

        return `${prefix}-${this.post_fix_id}`;
    }

    changeAExpression(new_a_expression){

        this.a_expression = new_a_expression;
    }

    changeBExpression(new_b_expression){

        this.b_expression = new_b_expression;
    }

    changeTMin(t){

        this.t_min = Number(t);
    }

    changeTMax(t){

        this.t_max = Number(t);
    }

    changeTAnimated(bool){

        this.t_animated = bool;
    }
}

class ComplexFunctionOptions {

    constructor(options){

        this.options = options;

        this.post_fix_id = options.post_fix_id;

        this.unique_id = ComplexGraph.randomPostFixId(7);

        options.unique_id = this.unique_id;
       
        this.function_expression = null;

        this.container = this.createFunctionOptionsDOM();

        this.addEventListeners();

        this.function_parameters = [new ComplexFunctionParameters(options)];
    }

    createFunctionOptionsDOM(){

        let container = document.createElement('div');

        container.id = this.createId('function-option-parameters-container');

        container.style.width = '100%';

        container.style.height = '120px';

        container.style.display = 'flex';

        container.style.flexDirection = 'column';

        container.style.position = 'relative'

        let function_options_container = document.createElement('div');

        function_options_container.id = this.createId('function-option-container');

        function_options_container.style.display = 'flex';

        function_options_container.style.flexDirection = 'row';

        function_options_container.style.width = '100%';

        function_options_container.style.height = '20px';

        function_options_container.style.borderBottom = '1px dashed black';

        let function_label = document.createElement('label');

        function_label.textContent = 'f(z)';

        let function_expression_input = document.createElement('input');

        function_expression_input.id = this.createId('function-input');

        function_expression_input.style.width = '40%';

        function_options_container.appendChild(function_label);

        function_options_container.appendChild(function_expression_input);

        container.appendChild(function_options_container);

       document.getElementById(this.getId('function-options-container')).appendChild(container);

       // for(let parameter of this.function_parameters){

           // container.appendChild(parameter.container);
      //  }

        return container;

    }

    addEventListeners(){

        let function_input = this.container.querySelector(`#${this.getId('function-input')}`);

        console.log('addeventlisteners - complex_graph_functions: ', this.options.complex_graph_functions);

        function_input.addEventListener('input', (e) => {

            console.log(`changeFunctionExpression ${this.unique_id}: ${function_input.value}`);

            this.options.complex_graph_functions['changeFunctionExpression'](function_input.value, this.unique_id);
        })
    }

    createId(prefix){

       return this.getId(prefix)
    }

    getId(prefix){

        return `${prefix}-${this.post_fix_id}`;
    }

    addNewParameter(){

        let param = new ComplexFunctionParameters(this.options);

        let container = document.getElementById(this.getId('function-option-parameters-container'));

        container.appendChild(param.container);

        this.function_parameters.push(param);
    }
}

class ComplexGraph {

    constructor(options){

        options = new defaultOptions(options, {mode: 'z-w', append_to_dom: false});
                
        this.random_post_fix_id = ComplexGraph.randomPostFixId(4);

        this.input_plane = drawComplexPlane({append_to_dom: false, height: '50%', width: '50%', marginBottom: '0'});

        let default_height, default_width = '90%';

        this.input_plane.style.height = default_height;

        this.input_plane.style.width = default_width;

        this.input_plane.id = this.randomId('input-plane-')

        this.input_plane.classList.add('complex-graph');

        this.draw_function = false;

        this.time_set_draw_function = Date.now()

        this.function_expressions = {}; //string

        this.points_array = [];

        this.points_array_start_index = 0;

        this.mode = options.mode;

        this.output_plane = drawComplexPlane({append_to_dom: false, height: '50%', widht: '50%', marginBottom: '0'});

        this.output_plane.style.height = default_height;

        this.output_plane.style.width = default_width;

        this.output_plane.id = this.randomId('output-plane-')

        this.output_plane.classList.add('complex-graph')

        this.quadrants = {
            quadrant_1: drawComplexPlane({append_to_dom: false, height: default_height, widht: default_width, marginBottom: '0'}),
            quadrant_2: drawComplexPlane({append_to_dom: false, height: default_height, widht: default_width, marginBottom: '0'}),
            quadrant_3: drawComplexPlane({append_to_dom: false, height: default_height, widht: default_width, marginBottom: '0'}),
            quadrant_4: drawComplexPlane({append_to_dom: false, height: default_height, widht: default_width, marginBottom: '0'})
        }//a1 a2

        for(let quadrant in this.quadrants){

           this.quadrants[quadrant].style.height = default_height;

            this.quadrants[quadrant].style.width = default_width;

            this.quadrants[quadrant].style.padding = '5px';

            this.quadrants[quadrant].id = this.randomId(`${quadrant}-`);

            this.quadrants[quadrant].classList.add('complex-graph');
        }

        this.listener_map = this.getListenerMap();

        this.container = this.createDisplay();

        this.complex_function_options = [this.createNewFunctionOption()];

        this.addEventListeners();

        //this.addChildrenEventListeners();
    }

    createNewFunctionOption(){

        return new ComplexFunctionOptions({
            post_fix_id: this.random_post_fix_id, 
            complex_graph_functions: {
                'input': this.addInput.bind(this),
                'changeFunctionExpression': this.changeFunctionExpression.bind(this)
            }
        }); 
    }

    getListenerMap(){

        let listener_map = [

            {query_selector: `#function-input-${this.random_post_fix_id}`, event: 'input', function: (e) => {

                console.log(`function-input-${e.target.id} input: ${e.target.value}`);

                this.changeFunctionExpression(e.target.value);
            }},
        ]

        return listener_map;
    }

    static getGraph(id){


    }

    createDisplay(){

        let wrapper = document.createElement('div');

        wrapper.style.display = 'flex';

        wrapper.style.flexDirection = 'row';

        wrapper.style.justifyContent = 'center';

        let container = document.createElement('div');

        container.style.display = 'flex';

        container.style.flexDirection = 'column';

        container.style.width = '85%';

        container.style.height = '85vh';

        container.style.margin = '10px'

        //container.style.marignTop = '10px'

        //container.style.marginBottom = '10px';

        //container.style.marginLeft = 'auto';

        let menu_bar = document.createElement('div');

        menu_bar.id = this.randomId('menu-');

        menu_bar.style.display = 'flex';

        menu_bar.style.flexDirection = 'row';

        menu_bar.style.width = '100%';

        menu_bar.style.height = 'fit-content';

        menu_bar.style.maxHeight = '60px';

        menu_bar.style.border = '1px solid black';

        let title = document.createElement('h2');

        title.textContent = 'Complex Graph';

        title.margin_right = '10px';

        let mode = document.createElement('select');

        mode.style.marginLeft = 'auto';

        mode.id = this.randomId('mode-')

        let mode_options = {'z-w': 'Z-W', 'quadrants': 'Quadrants'};
        
        for(let o in mode_options){

            let option = document.createElement('option');

            option.value = mode_options[o];

            option.textContent = mode_options[o];

            if(o == this.mode){

                option.selected = true;
            }

            mode.appendChild(option);
        }

        menu_bar.appendChild(title);

        menu_bar.appendChild(mode);

        let side_bar_graph_container = document.createElement('div');

        side_bar_graph_container.id = this.randomId('sidebar-graph-container-')

        side_bar_graph_container.style.display = 'flex';

        side_bar_graph_container.style.flexDirection = 'row';

        side_bar_graph_container.style.width = '100%';

        side_bar_graph_container.style.height = '100%';

        side_bar_graph_container.style.border = '1px solid black';


        let side_bar = document.createElement('div');

        side_bar.id = this.randomId('sidebar-')

        side_bar.style.display = 'flex';

        side_bar.style.position = 'relative';

        side_bar.style.flexDirection = 'column';

        side_bar.style.width = '20%';

        side_bar.style.border = '1px solid black';


        let function_options_container = document.createElement('div');

        function_options_container.id = this.randomId('function-options-container-');

        function_options_container.style.display = 'flex';

        function_options_container.style.flexDirection = 'column';

        function_options_container.style.position = 'relative';

        function_options_container.style.width = '100%';

        function_options_container.style.height = '95%';

        function_options_container.style.overflowY = 'scroll';

        function_options_container.style.border = '1px solid black';

        side_bar.appendChild(function_options_container);

        //for(let function_option of this.complex_function_options){

           // console.log('function_option: ', function_option);

            //side_bar.appendChild(function_option.container);
       // }

        //side_bar.style.height = '100%';

      


        let add_new_function_options_container = document.createElement('div');

        add_new_function_options_container.style.display = 'flex';

        add_new_function_options_container.style.flexDirection = 'row';

        add_new_function_options_container.style.position = 'relative';

        add_new_function_options_container.style.height = '5%';

        add_new_function_options_container.style.width = '100%';

        add_new_function_options_container.style.border = '1px solid black';


        let add_new_function_img = document.createElement('img');

        add_new_function_img.id = this.randomId('add-function-button-');

        add_new_function_img.src = '../plus_button.svg'

        add_new_function_img.style.height = '20px';

        add_new_function_img.style.width = '20px';

        add_new_function_options_container.appendChild(add_new_function_img);

        side_bar.appendChild(add_new_function_options_container)


        let graph_container = document.createElement('div');

        graph_container.id = this.randomId('graph-container-')

        graph_container.style.display = 'flex';

        graph_container.style.flexDirection = 'column';

        graph_container.style.width = '80%';

        graph_container.style.height = '100%';

        let graph_container_row_1 = document.createElement('div');

        graph_container_row_1.id = this.randomId('graph-container-row-1-');

        graph_container_row_1.style.display = 'flex';

        graph_container_row_1.style.flexDirection = 'row';

        graph_container_row_1.style.width = '100%';

        graph_container_row_1.style.height = '50%';


        let graph_container_row_2 = document.createElement('div');

        graph_container_row_2.id = this.randomId('graph-container-row-2-');

        graph_container_row_2.style.display = 'flex';

        graph_container_row_2.style.flexDirection = 'row';

        graph_container_row_2.style.width = '100%';

        graph_container_row_2.style.height = '50%';


       //graph_container.style.height = '100%';

        graph_container.style.border = '1px solid black';

        graph_container.appendChild(graph_container_row_1);

        graph_container.appendChild(graph_container_row_2);

        /*if(this.mode == 'z-w' && this.input_plane && this.output_plane){

            graph_container_row_1.appendChild(this.input_plane);

            graph_container_row_1.appendChild(this.output_plane);

        }
        else if(this.mode == 'quadrants'){

            graph_container_row_1.appendChild(this.quadrants.quadrant_2);

            graph_container_row_1.appendChild(this.quadrants.quadrant_1);

            graph_container_row_2.appendChild(this.quadrants.quadrant_4);

            graph_container_row_2.appendChild(this.quadrants.quadrant_3)
        }*/

        if(true){

            graph_container_row_1.appendChild(this.input_plane);

            graph_container_row_1.appendChild(this.output_plane);

            if(this.mode != 'z-w'){

                this.output_plane.style.display = 'none';
            }

            graph_container_row_1.appendChild(this.quadrants.quadrant_2);

            graph_container_row_1.appendChild(this.quadrants.quadrant_1);

            graph_container_row_2.appendChild(this.quadrants.quadrant_4);

            graph_container_row_2.appendChild(this.quadrants.quadrant_3);

            for(let quadrant in this.quadrants){

                if(this.mode != 'quadrants'){

                    this.quadrants[quadrant].style.display = 'none';
                }
            }
        }

        side_bar_graph_container.appendChild(side_bar);

        side_bar_graph_container.appendChild(graph_container);

        container.appendChild(menu_bar);

        container.appendChild(side_bar_graph_container);

        container.id = this.randomId('complex-graph-');

        container.classList.add('complex-graph-container');

        wrapper.appendChild(container)

        document.body.appendChild(wrapper);

        return container;
    }

    randomId(prefix){

        let id = prefix + this.random_post_fix_id;

        return id;
    }

    static randomPostFixId(num_chars){

        let id = '';

        let chars = '0123456789abcdefghijklmnopqrstuvwxyz';

        for(let i = 0; i < num_chars; i++){

            let index = Math.floor(Math.random() * chars.length);

            let c = chars[index];

            let upper = Math.random() >= .5;

            if(upper){

                c = c.toUpperCase();
            }

            id += c;
        }

        return id;
    }

    addEventListeners(){

       // addSVGListeners(svg, {point: false, mouse: false});

        let output_svgs = [this.output_plane];

        let svgs = [this.input_plane, this.output_plane];

        for(let quadrant in this.quadrants){

            output_svgs.push(this.quadrants[quadrant]);

            svgs.push(this.quadrants[quadrant]);
        }

        this.output_svgs = output_svgs

        for(let svg of svgs){

            this.addComplexSVGPointListener(svg);
        }

        this.addComplexSVGClickListener(this.input_plane, output_svgs);

        let mode = document.getElementById(`mode-${this.random_post_fix_id}`)
        
        mode.addEventListener('input', (e) => {

            console.log(`mode-input-${e.target.id} input: ${e.target.value}`);

            this.changeGraphMode(e.target.value)
        });

        let add_function_button = document.getElementById(this.randomId('add-function-button-'));

        add_function_button.addEventListener('click', (e) =>{

            let function_option = this.createNewFunctionOption();

            this.complex_function_options.push(function_option);
        })

    }

    addChildrenEventListeners(){

        console.log('this.listener_map: ', this.listener_map);

        for(let listener_mapping of this.listener_map){

            let query_selector = listener_mapping.query_selector;

            let dom = document.querySelector(query_selector);

            dom.addEventListener(listener_mapping.event, listener_mapping.function);
        }
    }

    addFunction(f, id){

        if(id == undefined){

            id = ComplexGraph.randomPostFixId(10);
        }

        this.function_expressions[id] = f;// a + bi -> c + di

        this.function_expression_tree = window.math.parse(this.function_expression);

        //sequence of operations f(z) = [Z.add(z1, z2), Z.multiply(z1, zi), Z.pow(z, z2)
    }

    changeFunctionExpression(f, id){

        console.log(`changeFunctionExpression ${id}: ${f}`);

        this.function_expressions[id] = f;
    }

    changeGraphMode(mode){

        this.mode = mode.toLowerCase();

        let graph_container = this.getGraphContainer();

        let rows = graph_container.querySelectorAll('div[id*=row]');

        let graphs = graph_container.querySelectorAll('.complex-graph');

        for(let graph of graphs){

            if(graph != this.input_plane){

                if(graph.style.display == 'none') {

                    graph.style.display = 'block';
                }
                else {
                    graph.style.display = 'none';
                }
            }
        }

        return;

        for(let row of rows){

            while(row.firstChild){

                row.removeChild(row.firstChild);

                let grids = row.querySelectorAll('svg');

                for(let grid of grids){

                    //grid.style.display = 'none';
                }
            }
        }

        if(this.mode == 'z-w'){

          rows[0].appendChild(this.input_plane);

          rows[0].appendChild(this.output_plane);

        }
        else if(this.mode == 'quadrants'){

            rows[0].appendChild(this.quadrants.quadrant_2);

            rows[0].appendChild(this.quadrants.quadrant_1);

            rows[1].appendChild(this.quadrants.quadrant_4);

            rows[1].appendChild(this.quadrants.quadrant_3);
        }
    }

    getGraphContainer(){

        let selector = this.randomId(`graph-container-`);

        return document.getElementById(selector);
    }

    addParameter(complex_component, expression){

        if(complex_component == 'a'){


        }
        else if(complex_component == 'b'){

        }
    }

    addInput(input, id){

        console.log('addInput: ', input);

        this.points_array_start_index = this.points_array.length;

        let prev_z;

        for(let z_index in input){

            let z = input[z_index];

            this.points_array.push(z);

            if(z_index > 0){

                drawZ(z, this.input_plane, {color: 'black', type: 'vector', a1: z.a, b1: z.b, a2: prev_z.a, b2: prev_z.b});
            }

            prev_z = z;
        }

        this.draw_function = false;

        this.drawFunction({id: id});
    }

    f(z, id){

        let parser = window.math.parser();

       // parser[eval_function]uate(`z = ${name_value.z.a} + ${name_value.z.b}`);

        parser[eval_function](`f(z) = ${this.function_expressions[id]}`);

        let eval_expression = parser[eval_function](`f(${z.a} + ${z.b}i)`);

        console.log('eval_expression: ', eval_expression, ', function_expression: ', this.function_expressions[id]);

        return new Z(eval_expression.re, eval_expression.im);

        return evalComplexExpression(this.function_expression, {z: z});
    }

    interpolatePoints(array){

        let max_distance_between_points = .07;

        let interpolated_array = [];

        for(let i = 1; i < array.length; i++){

            let z1 = array[i - 1];

            let z2 = array[i];

            let d_z = this.calculateDistance(z1, z2);

            if(d_z > max_distance_between_points){

                if(z1.a == z2.a){


                } 
            }
        }
    }

    calculateDistance(z1, z2){

        let d_2 = Math.pow(z1.a - z2.a, 2) + Math.pow(z1.b - z2.b, 2);

        return Math.sqrt(d_2);
    }

    addComplexSVGClickListener(input_svg, output_svgs){
        
        for(let output_svg of output_svgs){

            output_svg.draw_function = false;
        }

        input_svg.addEventListener('click', (e)=>{

            this.draw_function = !this.draw_function;

            let ids = Object.keys(this.function_expressions);

            for(let index in ids){

                let id = ids[index];

                console.log(`drawFunction click id - this.function_expressions[${id}]: ${this.function_expressions[id]}`);

                this.drawFunction({output_svgs: output_svgs, id: id, update_start_index: index == ids.length - 1});
            }
           
        })
    }

    drawFunction(options){

        options = new defaultOptions(options, {output_svgs: this.output_svgs, id: 0, update_start_index: true})

        let output_svgs = options.output_svgs;

        let function_id = options.id;

        let update_start_index = options.update_start_index;

        console.log('output_svgs: ', output_svgs, `, function_expressions: ${getObjectString(this.function_expressions)}`);

        for(let output_svg of output_svgs){

            console.log('output_svg: ', output_svg)

            //output_svg.draw_function = !svg2.draw_function;

            console.log(`click | !draw_function: ${!this.draw_function}, points_array.length > 0 ${this.points_array.length > 0}`)

            if(!this.draw_function && this.points_array.length > 0){

                let f_z_prev;

                let z_prev;

                for(let i = this.points_array_start_index; i < this.points_array.length; i++){

                    let z = this.points_array[i];

                    let f_of_z = this.f(z, function_id);

                    let output_map = this.getOutputMap(output_svg.id);

                    console.log(`output_map ${output_svg.id}: ${getObjectString(output_map)}`);

                    let input_output_map = {'f_z_prev': f_z_prev, 'z_prev': z_prev, 'f_z': f_of_z, 'z': z};

                    let a1, a2, b1, b2;

                    if(i > this.points_array_start_index){

                        a1 = input_output_map[output_map.a1.variable][output_map.a1.property];

                        b1 = input_output_map[output_map.b1.variable][output_map.b1.property];

                        a2 = input_output_map[output_map.a2.variable][output_map.a2.property];

                        b2 = input_output_map[output_map.b2.variable][output_map.b2.property];

                        drawZ(f_of_z, output_svg, {color: 'blue', type: 'vector', a1: a1, b1: b1, a2: a2, b2: b2});
                    }
                    
                    z_prev = z;

                    f_z_prev = f_of_z;
                }
            }
        }

        if(update_start_index) {
            
            this.points_array_start_index = this.points_array.length;
        }
    }

    getOutputMap(svg_id){

        /*
    let svg_to_input_output = {

        'input_plane': {a1: null, b1: null, a2: null, b2: null},
        'output_plane': {a1: {variable: 'f_z_prev', property: 'a'}, b1: {variable: 'f_z_prev', property: 'b'}, a2: {variable: 'f_z', property: 'a'}, b2: {variable: 'f_z', property: 'b'}},
        'quadrant_1': {a1: {variable: 'z_prev', property: 'a'}, b1: {variable: 'f_z_prev', property: 'b'}, a2: {variable: 'z', property: 'a'}, b2: {variable: 'f_z', property: 'b'}},
        'quadrant_2': {a1: {variable: 'z_prev', property: 'a'}, b1: {variable: 'f_z_prev', property: 'a'}, a2: {variable: 'z', property: 'a'}, b2: {variable: 'f_z', property: 'a'}},
        'quadrant_3': {a1: {variable: 'z_prev', property: 'b'}, b1: {variable: 'f_z_prev', property: 'b'}, a2: {variable: 'z', property: 'b'}, b2: {variable: 'f_z', property: 'b'}},
        'quadrant_4': {a1: {variable: 'z_prev', property: 'b'}, b1: {variable: 'f_z_prev', property: 'a'}, a2: {variable: 'z', property: 'b'}, b2: {variable: 'f_z', property: 'a'}}
       }
        */

        let output_map = {}

        output_map[this.randomId('output-plane-')] = {
            a1: {variable: 'f_z_prev', property: 'a'}, 
            b1: {variable: 'f_z_prev', property: 'b'}, 
            a2: {variable: 'f_z', property: 'a'}, 
            b2: {variable: 'f_z', property: 'b'}
        };
        
        output_map[this.randomId('quadrant_1-')] = {
            a1: {variable: 'z_prev', property: 'a'}, 
            b1: {variable: 'f_z_prev', property: 'b'}, 
            a2: {variable: 'z', property: 'a'}, 
            b2: {variable: 'f_z', property: 'b'}
        }

        output_map[this.randomId('quadrant_2-')] = {
            a1: {variable: 'z_prev', property: 'a'}, 
            b1: {variable: 'f_z_prev', property: 'a'}, 
            a2: {variable: 'z', property: 'a'}, 
            b2: {variable: 'f_z', property: 'a'}
        }

        output_map[this.randomId('quadrant_3-')] = {
            a1: {variable: 'z_prev', property: 'b'}, 
            b1: {variable: 'f_z_prev', property: 'b'}, 
            a2: {variable: 'z', property: 'b'}, 
            b2: {variable: 'f_z', property: 'b'}
        }

        output_map[this.randomId('quadrant_4-')] = {
            a1: {variable: 'z_prev', property: 'b'}, 
            b1: {variable: 'f_z_prev', property: 'a'}, 
            a2: {variable: 'z', property: 'b'}, 
            b2: {variable: 'f_z', property: 'a'}
        }

        return output_map[svg_id];
    }

    addComplexMousePosition(svg){

        svg.addEventListener('mouse')
    }

    addComplexSVGPointListener(svg){

        let pt = svg.createSVGPoint();

        svg.addEventListener('mousemove', (e) =>{
        
            let svg_point = transformPointToSVG(svg, pt, e);
        
            //console.log('svg_point: ', svg_point);
        
            svg.dataset.point = JSON.stringify({x: svg_point.x, y: svg_point.y});

            if(this.draw_function){

                let z = new Z(svg_point.x, -svg_point.y)

                this.points_array.push(z);

                if(this.points_array.length > this.points_array_start_index + 1){

                    let prev_z = this.points_array[this.points_array.length - 2];

                    drawZ(z, svg, {color: 'black', type: 'vector', a1: z.a, b1: z.b, a2: prev_z.a, b2: prev_z.b});
                }
               
            }
            
        })
    }
}

function addComplexSvgClickListener(svg){

}

function addComplexSVGPointListener(svg){

    let pt = svg.createSVGPoint();

    svg.addEventListener('mousemove', (e)=>{

      if(!svg.dataset.mouseover){

        return
      }

      let svg_point = transformPointToSVG(svg, pt, e);

      console.log('svg_point: ', svg_point);

      svg.dataset.point = JSON.stringify({x: svg_point.x, y: svg_point.y});

      //svg point is center so everything min x min y width height
      //width decreases by percentage
      //min x is just center -
    })
}

function drawZ(z, svg, options){

    options = new defaultOptions(options, {

        type: 'vector',
        color: 'black',
        a1: 0,
        b1: 0,
        a2: z ? z.a : 0,
        b2: z ? z.b : 0
    })

    let type = options.type;

    let color = options.color;

    let a1 = options.a1;

    let a2 = options.a2;

    let b1 = options.b1;

    let b2 = options.b2

    console.log('drawZ - z: ', z);

    if(!drawZ.type && !options.type){

        drawZ.type = options.type ? options.type : 'vector';
    }
    else if(options.type){

        drawZ.type = options.type;
    }

    //let type = drawZ.type;

    if(z && type == 'vector'){

        console.log(`drawZ: z_null: ${z == null}, x1: ${typeof a1}, x2: ${typeof b1}, y1: ${typeof a2}, y2: ${typeof b2}`)

        let line = drawLine(svg, a1, b1, a2, b2, {width: .1, color: color});

        return line;
    }
    else if(z && type == 'point'){

        console.log(`drawZ: z_null: ${z == null}, cx: ${typeof z.a}, cy: ${typeof z.b}, r: ${typeof .15}`)

        let point = drawPoint(svg, z.a, z.b, .15, {color: color})

        return point;
    }
}

export default {

    Angle, Z, sqr, sqrt, drawZ, drawComplexPlane, ComplexGraph
}

export {

    Angle, Z, sqr, sqrt, drawZ, drawComplexPlane, ComplexGraph
}

/*
let z = new Z(1,1)

let svg = drawComplexPlane()

drawZ(z, svg)

drawZ(z.conjugate, svg)

let x = new Z(3,4);

let y = new Z(-8,3);

drawZ(x, svg);

drawZ(y,svg)

let a = Z.add([x,y])
*/

/*

class w {

    constructor(){

        this._ww = new ww(this.f.bind(this))
    }

    f(a){

        this.a = a;
    }
}

class ww {

    constructor(input){

        this.f = input
        
    }
    updateA(a){

        this.f(a);
    }
}

let w = new w()

w._ww.updateA(1)

*/


