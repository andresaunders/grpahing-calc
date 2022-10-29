
  function addStyle(node, style_object){

    if(!node){

        return;
    }

    for(let key in style_object){

        if(key == 'classList'){

            for(let c of style_object.classList){

                node.classList.add(c);
            }
        }
        else if(node.style){

            node.style[key]  = style_object[key];
        }    
    }
}