"use strict";
/* @flow */
/*::

declare class Bar {
    text:string;
    value:number;
}

*/

class State {

    /*::graphs:{[key: string]: Graph};*/

    constructor(render/*:Function*/) {
        const curried = () => render(this)

        this.graphs = {
            views: new Graph({
                render: curried,
                title: "How viewed is each graph",
                axisTitle: "views",
                startingData: [
                    {text: "views", value: 0},
                    {text: "funnel", value: 0},
                    {text: "counts", value: 0},
                    {text: "speed", value: 0},
                ],
            }),
            funnel: new Graph({
                render: curried,
                title: "A funnel",
                axisTitle: "occurances of each event",
                startingData: [
                    {text: "view graph", value: 0},
                    {text: "cick comment box", value: 0},
                    {text: "submit", value: 0},
                ],
            }),
            counts: new Graph({
                render: curried,
                title: "Let's count some events",
                axisTitle: "occurances of each event",
                startingData: [
                    {text: "page loads", value: 0},
                    {text: "scrolls", value: 0},
                    {text: "select comment box", value: 0},
                    {text: "comment submission", value: 0},
                ],
            }),
            speed: new Graph({
                render: curried,
                title: "Typing speed",
                axisTitle: "characters in comment / seconds spent editing",
                startingData: [],
            }),
        }

        curried()
    }
}

class Graph {

    /*::
    typing:string;
    comments:Array<string>;
    data:Array<Bar>;
    render:Function;
    title:string;
    axisTitle:string;
    */

    constructor(args/*:{render:Function, title:string, axisTitle:string, startingData:Array<Bar>}*/) {
        this.render = args.render
        this.typing = ''
        this.data = args.startingData
        this.title = args.title
        this.axisTitle = args.axisTitle
        this.comments = []
    }

    onTextFieldChange(event/*:{target: {value: string}}*/) {
        this.typing = event.target.value
        this.render()
    }


    onKeyUp(event/*:{which:number}*/) {
        var enterKey = 13;
        if (event.which == enterKey){
            this.comments.push(this.typing)
            this.typing = ''
            this.render()
        }
    }

}

if(typeof exports === 'object') {
    exports.State = State
    exports.Graph = Graph
}
