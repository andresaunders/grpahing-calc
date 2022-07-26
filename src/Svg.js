
import {defaultOptions} from './DefaultOptions.js';
import {formatPropsAsNumber, getObjectString, stringToBoolean} from './Format.js'
import {drawZ} from './Complex.js'

    let svg_ns = "http://www.w3.org/2000/svg"

    function getSVGViewBox(svg){
    
        let box = svg.getAttribute('viewBox').split(' ');
    
        let view_box = {min_x: box[0], min_y: box[1], width: box[2], height: box[3]};

        console.log('getSVGViewBox ', svg, ', view_box: ', view_box);
    
        formatPropsAsNumber(view_box, ['min_x', 'min_y', 'width', 'height']);
    
        return view_box;
    }

    function updateSVGViewBox(svg, options = {}){

        console.log('updateSVGViewBox, svg: ', svg, ', options: ', options);
      
        let box = svg.getAttribute('viewBox')
        let min_x;
        let min_y;
        let width;
        let height;
      
        if(box){
      
          box = box.split(' ')
      
          min_x = box[0];
      
          min_y = box[1];
      
          width = box[2];
      
          height = box[3];
        }
      
        console.log('box: ', box);
      
        if(options.min_x){
      
          min_x = options.min_x
        }
        if(options.min_y){
      
          min_y = options.min_y
        }
        if(options.width){
      
          width = options.width
        }
        if(options.height){
      
          height = options.height;
        }
      
        if(options.right){
      
        }
      
        let viewbox = `${min_x} ${min_y} ${width} ${height}`;
      
        svg.dataset.view_box = JSON.stringify({min_x: min_x, min_y: min_y, width: width, height: height});
      
        svg.setAttribute('viewBox', viewbox);
    }

    function addSVGZoomListener(svg, options){//{f: zoom: boundary:}

        options = new defaultOptions(options, {zoom_functions: []});

        if(svg.dataset.zoom == undefined) {

            svg.dataset.zoom = 1;
        }
    
        svg.dataset.zoom_point = null;
    
        svg.dataset.time = Date.now();
    
        svg.addEventListener('wheel', (e) => {

          defaultZoomListener(e, svg);

          runZoomFunctions(svg, options.zoom_functions); 
        })
    }

    function defaultZoomListener(e, svg){

      console.log('wheel event');
    
      if(!e.shiftKey || !svg.dataset.mouseover){

        return;
      }

      e.preventDefault();

      let time_between_new_events = 300;

      let current_time = Date.now();

      let svg_point;

      if(current_time - svg.dataset.time > time_between_new_events || !svg.dataset.zoom_point){//new zoom point

        console.log('new svg_zoom_point')

        svg_point = JSON.parse(svg.dataset.point);
      }
      else if(svg.dataset.zoom_point){//same zoom point

        console.log('old svg_zoom_point')

        svg_point = JSON.parse(svg.dataset.zoom_point);
      }

      formatPropsAsNumber(svg_point, ['x', 'y']);

      console.log('svg_zoom_point: ', svg_point.x, ', ', svg_point.y);

      svg.dataset.time = current_time;

      let view_box = JSON.parse(svg.dataset.view_box);

      console.log('zoom_view_box before format: ', getObjectString(view_box))

      formatPropsAsNumber(view_box, ['min_x', 'min_y', 'width', 'height']);

      console.log('zoom_view_box format: ', getObjectString(view_box))

      let factor = e.deltaY > 0 ? .95 : 1.05;

      let delta_x = Math.abs(view_box.width*factor - view_box.width);

      let delta_y = Math.abs(view_box.height*factor - view_box.height);

      console.log(`typeof svg_point.x: ${typeof svg_point.x}, typeof view_box.min_x: ${typeof view_box.min_x}`)

      let dist_zoom_point_x_min = Math.abs(svg_point.x - view_box.min_x);

      let dist_zoom_point_y_min = Math.abs(svg_point.y - view_box.min_y);

      console.log(`dist_zoom_point_x_min: ${dist_zoom_point_x_min}, dist_zoom_point_y_min: ${dist_zoom_point_y_min}`);

      if(factor < 0 && factor - Math.trunc(factor) > .5){

        factor = Math.trunc(factor) + 1;
      }//factor = 1.5 > -> 2

      svg.dataset.zoom *= factor;

      view_box.height *= factor;

      view_box.width *= factor

      view_box.min_x = factor < 1 ? view_box.min_x + delta_x/2 : view_box.min_x - delta_x/2;

      view_box.min_y = factor < 1 ? view_box.min_y + delta_y/2 : view_box.min_y - delta_y/2; //svg_point.y - view_box.height/2;


      //update svg point

      svg_point.x = view_box.min_x + dist_zoom_point_x_min;

      svg_point.y = view_box.min_y + dist_zoom_point_y_min;

      svg.dataset.zoom_point = JSON.stringify({x: svg_point.x, y: svg_point.y});

      console.log('zoom_view_box before fix: ', getObjectString(view_box))

      formatPropsAsNumber(view_box, ['min_x', 'min_y', 'width', 'height'], true, 2);

      console.log('zoom_view_box fix: ', getObjectString(view_box))

      let update_svg_view_box = false;

      if(update_svg_view_box){

        updateSVGViewBox(svg, view_box);
      }
      /*DONT UPDATE SVG VIEWBOX, IT CHANGES WIDTH OF OBJECTS IN GRAPH

      updateSVGViewBox(svg, view_box); 
      */

      //transformComplexPointsOnZoom(svg, Number(svg.dataset.zoom))

      //transformGridLinesOnZoom(svg, Number(svg.dataset.zoom))

      //transformScaledViewBox(svg, svg.dataset.zoom);
     
    }

  

   

  function runZoomFunctions(svg, functions){

    console.log('runZoomFunctions functions: ', functions);

    for(let f of functions){

        f(svg)
    }
  }

  function runTranslateFunctions(svg, functions){

    console.log('runTranslateFunctions functions: ', functions);

    for(let f of functions){

      f(svg);
    }
  }

  function addSVGSliders(svg){

    let x_slider_html = `
      <label for='x-slider'>x</label>
      <input id="x-slider" type="range" max="100" min="0" step=".5" class="svg-control">
    `

    let x_slider = document.createElement('input');

    x_slider.outerHTML = x_slider_html;

    x_slider.addEventListener('change', (e)=>{

      //[0|.............................|MAX]

      //[0.........|.........|.........MAX]

      let svg_view_box = getSVGViewBox(svg);

      let x_window_size;

      //zoom in, window size decreases

      //zoom out, window size increases

      //say width is 100, shift should be 0, say width is 50, shift should be like 5% of width

      let max_x = Number(x_slider.value);

      let min_x

      updateSVGViewBox(svg, {min_x: min_x, max_x: max_x})
      
    })

    svg.appendChild(x_slider);

    let y_slider_html = `
    <label for='y-slider'>x</label>
    <input id="y-slider" type="range" max="100" min="0" step=".5" class="svg-control">
  `

    let y_slider = document.createElement('input');

    y_slider.outerHTML = y_slider_html;

    svg.appendChild(y_slider);

    let z_slider_html = `
    <label for='y-slider'>x</label>
    <input id="y-slider" type="range" max="100" min="0" step=".5" class="svg-control">
  `

    let z_slider = document.createElement('input');

    z_slider.outerHTML = z_slider_html;

    svg.appendChild(z_slider);

  }

    function addSVGListeners(svg, options){

        options = new defaultOptions(options, {zoom_functions: [], update: true, point: true, zoom: true, mouse: true, translate: true})

        console.log(`svglisteners options: ${getObjectString(options)}`);

        if(options.update){

          updateSVGViewBox(svg);
        }

        if(options.point){

          addSVGPointListener(svg);
        }
    
        if(options.zoom){

          console.log('addSVGListeners options.zoom_functions: ', options.zoom_functions);

          addSVGZoomListener(svg, {zoom_functions: options.zoom_functions});
        }
    
        if(options.mouse){

          addSVGMouseListener(svg);
        }
    
        if(options.translate){

          addSVGTranslateListeners(svg, {translate_functions: options.translate_functions});
        }
        //slider for x and y and a zoom
        //addSVGSliders(svg);
    }

    function transformPointToSVG(svg, pt, e){

        pt.x = e.clientX; pt.y = e.clientY;
    
        return pt.matrixTransform(svg.getScreenCTM().inverse());
    }

    function addSVGMouseListener(svg){

        svg.addEventListener('mouseenter', (e)=>{
    
          svg.dataset.mouseover = true;
        })
    
        svg.addEventListener('mouseleave', (e)=>{
    
          svg.dataset.mouseover = false;
        })
    }

    function addSVGTranslateListeners(svg, options){

        svg.dataset.delta_x = 0;
    
        svg.dataset.delta_y = 0;
    
        window.addEventListener('keydown', (e) => {
          
            defaultTranslateListener(e, svg);
        
            runTranslateFunctions(svg, options.translate_functions)
        })
    }

    function defaultTranslateListener(e, svg){

      console.log('translate listener')
    
      let mouseover = stringToBoolean(svg.dataset.mouseover);

      if(!mouseover || !e.shiftKey){

        return;
      }

      console.log('translate listener not return: ', svg, ', svg.dataset.mouseover: ', svg.dataset.mouseover, ', event: ', e, ', e.key: ', e.key);

      e.preventDefault();

      let view_box = getSVGViewBox(svg);

      formatPropsAsNumber(view_box, ['min_x', 'min_y', 'width', 'height']);

      let factor_x;

      let factor_y;

      if(e.key == 'ArrowRight'){

        factor_x = 1;
      }
      else if(e.key == 'ArrowLeft'){

        factor_x = -1;
      }
      else if(e.key == 'ArrowUp'){

        factor_y = -1;
      }
      else if(e.key == 'ArrowDown'){

        factor_y = 1;
      }

      if(factor_x){

        console.log(`factor_x: ${factor_x}, width: ${view_box.width}`)

        let percent_x = .05;

        let delta_x = Number((factor_x * percent_x * view_box.width).toFixed(2));

        svg.dataset.delta_x = delta_x;

        let view_box_update = {min_x: view_box.min_x + delta_x}

        updateSVGViewBox(svg, view_box_update);
      }


      if(factor_y){

        console.log(`factor_y: ${factor_x}, height: ${view_box.height}`)

        let percent_y = .05;

        let delta_y = Number((factor_y * percent_y * view_box.height).toFixed(2));
  
        svg.dataset.delta_y = delta_y;

        let view_box_update = {min_y: view_box.min_y + delta_y}

        updateSVGViewBox(svg, view_box_update);
      }
    }

    function addSVGPointListener(svg){

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

    export {
        getSVGViewBox, updateSVGViewBox, addSVGZoomListener, addSVGSliders, 
        addSVGListeners, transformPointToSVG, addSVGMouseListener, addSVGTranslateListeners,
        addSVGPointListener, svg_ns
    }

    export default {
        getSVGViewBox, updateSVGViewBox, addSVGZoomListener, addSVGSliders, 
        addSVGListeners, transformPointToSVG, addSVGMouseListener, addSVGTranslateListeners,
        addSVGPointListener, svg_ns
    }