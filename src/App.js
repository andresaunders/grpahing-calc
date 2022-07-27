import logo from './logo.svg';
import './App.css';
import Complex from './Complex'
import { create, all } from 'mathjs'
import {defaultOptions} from './DefaultOptions'
import WorkerBuilder from './worker_builder'
import Worker from './worker.js'


function App() {

  const config = { }
  const math = create(all, config)

  if(!math.parser.eval){

    math.parser.eval = math.parser.evaluate
  }

  window.defaultOptions = defaultOptions


  function addObjectPropertiesToGlobal(array_obj){

    for(let obj of array_obj){

      addPropertiesGlobal(obj);
    }
  }

  function addObjectToGlobal(obj, name){

    window[name] = obj;
  }

  function addPropertiesGlobal(import_obj){

    for(let prop in import_obj){

     console.log('prop_name: ', prop)

     window[prop] = import_obj[prop];
    }
  }

  addObjectPropertiesToGlobal([Complex]);

  addObjectToGlobal(math, 'math');

  if(!window.complex_graph){

    let graph = new Complex.ComplexGraph()

    window.complex_graph = graph;
  }

  let myWorker;

  function messageWorker(message_object){

    console.log('messageWorker: ', message_object)

    if(typeof(Worker) == undefined){

      return;
    }

    if(!myWorker){

      myWorker = new WorkerBuilder(Worker);

      myWorker.addEventListener('message', (e)=> {

        console.log(`message from worker: `, e.data);

        let message = e.data.action;

        if(message == 'calc-return'){

          let result = document.querySelector('#calc-result');
          
          if(result) result.textContent = e.data.value;
        }
      })
    }

    myWorker.postMessage(message_object);


  }

  let display_worker_test = false;

  return (
    <div className="App">
      {display_worker_test  &&
      <div style={{display: 'flex', flex_direction: 'row', justifyContent: 'center'}} id='test-worker'>
        <button onClick={()=>{ messageWorker({action: 'calc', n: 1})}}>Calc</button>
        <div style={{width: '100px', border: '1px solid black'}} id='calc-result'>Result</div>
      </div>
}
    </div>
  );
}

export default App;
