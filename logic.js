"use strict";
/* @flow */

class State {

    /*::graphs:{[key: string]: Graph};*/

    constructor(render/*:Function*/) {
        const curried = () => render(this)

        this.graphs = {
            foo: new Graph(curried),
            bar: new Graph(curried),
            baz: new Graph(curried),
            bazdmeg: new Graph(curried),
        }

        curried()
    }
}

class Graph {

    /*::
    typing:string;
    comments:Array<string>;
    data:Array<{text:string, value:number}>;
    render:Function;
    */

    constructor(render/*:Function*/) {
        this.render = render
        this.typing = ''
        this.data = [
          {text: 'Man', value: 500},
          {text: 'Woman', value: 300}
        ]
        this.comments = [
            'yolo',
            'wizardry'
        ]
    }

    onTextFieldChange(event/*:{target: {value: string}}*/) {
        this.typing = event.target.value
        this.render()
    }


    onKeyUp(event/*:SyntheticKeyboardEvent*/) {
        var enterKey = 13;
        if (event.which == enterKey){
            this.typing = ''
            this.render()
        }
    }

}

if(typeof exports === 'object') {
    exports.State = State
    exports.Graph = Graph
}
