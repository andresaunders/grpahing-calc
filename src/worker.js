
// eslint-disable-next-line import/no-anonymous-default-export
export default () => {

// eslint-disable-next-line no-restricted-globals
self.onmessage = function(e){

    console.log('message: ', e.data);

    let message = e.data.action;

    if(message == 'calc'){

        let n = Number(e.data.n);

        let v = calc(Number(e.data.n));

        console.log(`
        v: ${v},
        n: ${n}
        `);

        postMessage({action: 'calc-return', value: v})
     }
    }

    function calc(n){

        return n * Math.random();
    }
}


