import {defaultOptions} from "./DefaultOptions";
import { Z } from "./Complex";
import {getObjectString, getValueString} from './Format'

/*
class ExpressionTree {

    constructor(expression_string){// (a + 2 - 4 * 1) + (4) * (1 + 3 - (1 + 7) )

        this.root = null;

        this.expression_string = expression_string;

        this.operators = {
            '(': {read: 'LR', precedence: 0},
            '^': {read: 'LR', precedence: 1},
            '*': {read: 'LR', precedence: 2},
            '/': {read: 'LR', precedence: 2},
            '+': {read: 'LR', precedence: 3},
            '-': {read: 'LR', precedence: 3},
        }
    }
}

class ExpressionNode {

    constructor(node_string){

        this.data;
        this.left;
        this.right
    }
}*/

function testEvalComplexFunction(){

    let z = new Z(1,1);

let expression = 'z^2 + z - (1 + 3*i)'

let tree = window.math.parse(expression);

let e = evalComplexExpression(expression, {z: z});
}


function evalComplexExpression(expression_string, name_value){

    name_value = new defaultOptions(name_value, {i: new Z(0, 1), z: new Z(1,0), e: new Z(Math.E, 0), pi: new Z(Math.PI, 0)});

    let expression_tree = window.math.parse(expression_string);

    let js_expression = ''

    let operator_to_function = {'+': 'add', '-': 'subtract', '*': 'multiply', '/': 'divide', '^': 'pow'}

    let eval_expression = eval_z(expression_tree, name_value, false);


    return eval_expression;

}

function eval_z(node, name_value, as_string){

    if(isSymbolOrNumberOrParenthesis(node)){

        if(isSymbol(node)){

            return name_value[node.name];
        }

        if(isNumber(node)){

            return new Z(Number(node.value), 0);
        }

        if(isParenthesis(node)){

            let par_eval = eval_z(node.content, name_value, as_string);

            console.log(`par_eval: ${getObjectString(par_eval)}`);

            return par_eval;
        }
    }

    if(node.args){

        let left, right;
        
        if(node.args.length > 0) left = node.args[0];

        if(node.args.length > 1) right = node.args[1];

        if(left == null || right == null){

            return;
        }

        if(as_string){

            return `Z.${node.fn}(${eval_z(left, name_value, as_string)}, ${eval_z(right, name_value, as_string)})`;
        }

        let left_eval = eval_z(left, name_value, as_string);

        let right_eval = eval_z(right, name_value, as_string);

        let left_eval_str = typeof left_eval == 'object' ? (left_eval instanceof Z ? left_eval.toString() : getObjectString(left_eval) ): left_eval;

        let right_eval_str = typeof right_eval == 'object' ? (right_eval instanceof Z ? right_eval.toString() : getObjectString(right_eval) ): right_eval; 

        console.log(`Function: ${node.fn} | left_eval: ${left_eval_str} | right_eval: ${right_eval_str}`);

       return Z[node.fn](left_eval, right_eval);
        //let eval_z = Z[node.fn](left_eval, right_eval);

       // console.log(`eval_z: ${eval_z instanceof Z ? eval_z.toString() : getObjectString(eval_z)}`);

       // return eval_z;
    }

    return null;
}

function isSymbolOrNumberOrParenthesis(node){

    return isSymbol(node) || isNumber(node) || isParenthesis(node);
}

function isParenthesis(node){

    return node.type == 'ParenthesisNode';
}

function isSymbol(node){

    return node.type == 'SymbolNode';
}

function isNumber(node){

    return node.type == 'ConstantNode';
}

export default {

    evalComplexExpression, eval_z
}

export {

    evalComplexExpression, eval_z
}