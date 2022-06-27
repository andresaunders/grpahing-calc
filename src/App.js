import logo from './logo.svg';
import './App.css';
import Complex from './Complex'
import { create, all } from 'mathjs'

function App() {

  const config = { }
  const math = create(all, config)

  if(!math.parser.eval){

    math.parser.eval = math.parser.evaluate
  }


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

  let graph = new Complex.ComplexGraph()

  return (
    <div className="App">
    </div>
  );
}

export default App;
