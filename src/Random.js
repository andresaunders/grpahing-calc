function shuffleArray(n){

    let shuffled_array = [];

    let a = getArrayFrom1ToN(n);

    for(let i = 0; i < n; i++){

        let r = Math.random();

        let index = Math.floor(r * a.length); 

        shuffled_array.push(a[index]);

        a.splice(index, 1);
    }

    return shuffled_array;
}

function randomIntegerInclusive(min, max) {

    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomRange(min, max) {

    return Math.random() * (max - min + 1) + min;
}

/*

    T1 = m/n * T2

    T1/ T2 = m/n

    T2 =  n/m T1

    
*/
function randomFraction(max_num = 100, max_denom = 100){

    let num = randomIntegerInclusive(1, max_num);

    let denom = randomIntegerInclusive(1, max_denom);

    return {num: num, denom: denom}
}

function getArrayFrom1ToN(n){

    let a = [];

    for(let i = 0; i < n; i++){

        a.push(i+1);
    }

    return a;
}

export default {shuffleArray, getArrayFrom1ToN, randomIntegerInclusive, randomRange, randomFraction}

export {shuffleArray, getArrayFrom1ToN, randomIntegerInclusive, randomRange, randomFraction}