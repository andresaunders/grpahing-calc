
class defaultOptions {

    constructor(options, default_options_object){

        for(let key in default_options_object){

            if(options && options.hasOwnProperty(key)){

                this[key] = options[key];
            }
            else{

                this[key] = default_options_object[key];
            }
        }

        for(let key in options){

            if(!this.hasOwnProperty(key)){

                this[key] = options[key];
            }
        }
    }
}

export default {
    defaultOptions
}

export  {
    defaultOptions
}
