    import {domInterfaceStrings} from './Reserved.js'

    function toString(v, name){

        //console.log('to string name: ', name);
    
        //console.log('to string: v: ', v);
    
        if(typeof(v) == 'object'){
    
            return getObjectString(v, name);
        }
        else if(typeof(v) == 'function'){
    
            return `${name}()`;
        }
        else if(typeof(v) == 'number'){
    
          if(!Number.isInteger(v)){
    
            if(v < 0){
    
              v = Number.parseFloat(v).toPrecision(4);
            }
            else{
        
              v = Number.parseFloat(v).toFixed(2)
            }
          }
        }
    
        return v 
    }

    function getObjectType(obj){

        let obj_type;
  
        if(typeof obj == 'object'){
  
          obj_type = 'object';
  
          if(obj instanceof Set){
            obj_type = 'set'
          }
          if(obj instanceof Array){
  
            obj_type = 'array';
          }
        }
        else if(typeof obj == 'function'){
  
          obj_type ='function'
        }
        else{
  
          obj_type = 'primitive';
        }
  
        return obj_type;
    }

    function DOMToString(node, references){

        return '    ' + node.outerHTML;
    
        if(references.has(node)){
    
            return 'circular ref';
        }
    
        for(let key in node){
    
        }
    
    }

    function getObjectString(obj, name = '', parent = null, level = 0){

        // console.log('name: ', name)
          
          let s = '';
      
          if(obj == null || obj == undefined){
      
              return 'null';
          }
      
          if(isDOM(obj)){
      
              return DOMToString(obj);//' { DOM }\n';
          }
      
          let obj_type = getObjectType(obj);
      
          let originally_set = false;
      
          if(obj_type == 'set'){
      
            originally_set = true;
      
            obj = setToObject(obj);
      
            obj_type = 'object';
          }
      
          //console.log('object_type: ', obj_type, originally_set);
      
          let str_brackets = {
            'object': {'left': '{', 'right': '}'},
            'array': {'left': '[', 'right': ']'},
            'function': {'left': '', 'right': ''},
            'primitive': {'left': '', 'right': ''}
          }
      
          s = str_brackets[obj_type]['left'];
      
          for(let key in obj){
      
              s += getValueString(obj, key, obj_type, originally_set);
          }
      
          s = Object.keys(obj).length > 0 ? s.substring(0, s.length-2) : s;
      
          s += str_brackets[obj_type]['right']
      
          return s;
    }

    function setToObject(set){

        let arr = Array.from(set);
    
        let obj = {};
    
        for(let index in arr){
    
            let v = arr[index];
    
            if(v instanceof Set){
    
              obj[index] = setToObject(v);
            }
            else{
    
              obj[index] = v;
            }
        }
    
        return obj;
    }

    function getObjectName(obj, parent){
    
        for(let key in parent){
    
            if(parent[key] == obj){
    
                return key;
            }
        }
    }

    function getValueString(obj, key, obj_type, originally_set){

        let str = '';
    
        let mid = ''
    
        switch(obj_type){
          case 'object':
            str += originally_set ? '' : key + ": ";
            break;
    
          case 'function':
            str = '(){ code }, ';
            return str;
            
          case 'primitive':
            str = obj + ', ';
            return str;
        }
    
        if(typeof obj[key] == 'object'){
    
            str += getObjectString(obj[key]) + ', '
    
        }
        else if(typeof obj[key] == 'function'){
    
          str += '(){ code }, ';
        }
        else{
    
          str += obj[key] + ', '
        }
    
        return str;
    }

    function getPreTabs(level){

        let tabs = '';
    
        for(let i = 0; i < level; i++){
    
            tabs += '\t';
        }   
    
        return tabs;
    }
    
    function formatPropsAsNumber(obj, props, format = true, fixed = null){

        for(let prop of props){

            if(format) {

                obj[prop] = Number(obj[prop]);
            }

            if(fixed != null){

                obj[prop] = Number(obj[prop].toFixed(fixed));
            }
        }
    }

    function stringToBoolean(s){

        if(s == 'false'){
    
          return false;
        }
    
        else if(s == 'true'){
    
          return true;
        }
    }

    function isDOM(v){

        //console.log('v: ', v)
    
        for(let domInterface of domInterfaceStrings){
          
            if(window[domInterface] && typeof window[domInterface] == 'function' && window[domInterface].prototype != undefined){
            
                if(v instanceof window[domInterface]){
    
                    return true;
                }
            }
        }
    
        return false;
    }

    //x => {'x': x}

    export {
        formatPropsAsNumber, toString, getPreTabs, getObjectType, 
        DOMToString, getObjectString, setToObject, getValueString,
        getObjectName, stringToBoolean, isDOM
    }

    export default {
       formatPropsAsNumber, toString, getPreTabs, getObjectType, 
        DOMToString, getObjectString, setToObject, getValueString,
        getObjectName, stringToBoolean, isDOM
    }