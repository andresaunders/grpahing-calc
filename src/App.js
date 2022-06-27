import logo from './logo.svg';
import './App.css';
import Complex from './Complex'

function App() {


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

  let graph = new Complex.ComplexGraph();

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
