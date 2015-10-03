"use strict";
/* @flow */


class State {

    /*::
    graphs:{[key: string]: Graph};
    render:Function;
    */

    constructor(render/*:Function*/) {
        this.graphs = {
            views: new Graph({
                parent: this,
                title: "How viewed is each graph",
                axisTitle: "views",
                startingData: {
                    "views": 0,
                    "funnel": 0,
                    "counts": 0,
                    "speed": 0,
                },
            }),
            funnel: new Graph({
                parent: this,
                title: "A funnel",
                axisTitle: "occurances of each event",
                startingData: {
                    "view graph": 0,
                    "click comment box": 0,
                    "submit": 0,
                },
            }),
            counts: new Graph({
                parent: this,
                title: "Let's count some events",
                axisTitle: "occurances of each event",
                startingData: {
                    "page loads": 0,
                    "scrolls": 0,
                    "select comment box": 0,
                    "comment submission": 0,
                },
            }),
            speed: new Graph({
                parent: this,
                title: "Typing speed",
                axisTitle: "characters in comment / seconds spent editing",
                startingData: {},
            }),
        }

        this.render = () => render(this)
        this.render()
    }
}

class Graph {

    /*::
    parent:State;
    typing:string;
    comments:Array<string>;
    data:{[key: string]: number};
    title:string;
    axisTitle:string;
    visible:bool;
    */

    constructor(args/*:{parent:State, title:string, axisTitle:string, startingData:{[key: string]: number}}*/) {
        this.parent = args.parent
        this.typing = ''
        this.data = args.startingData
        this.title = args.title
        this.axisTitle = args.axisTitle
        this.comments = []
        this.visible = false
    }

    getDataAsArray()/*:Array<Bar>*/ {
        return Object.keys(this.data).map(key => ({text: key, value: this.data[key]}))
    }

    onTextFieldChange(event/*:{target: {value: string}}*/) {
        this.typing = event.target.value
        this.parent.render()
    }


    onKeyUp(event/*:{which:number}*/) {
        var enterKey = 13;
        if (event.which == enterKey){
            this.comments.push(this.typing)
            this.typing = ''
            this.parent.render()
        }
    }


    onPossibleVisibilityChange(element/*:DOMElement*/, window/*:Window*/) {
        if (this.didBecomeVisible(element, window)) {
            const graphs = this.parent.graphs
            const myName = Object.keys(graphs).filter(key => graphs[key] === this)[0]
            graphs['views'].data[myName] += 1
            this.parent.render()
        }
    }

    didBecomeVisible(element/*:DOMElement*/, window/*:Window*/)/*:bool*/ {
        const newVisibility = this.isElementVisible(element, window)
        const becameVisible = (!this.visible) && newVisibility
        this.visible = newVisibility
        return becameVisible
    }

    isElementVisible(element/*:DOMElement*/, window/*:Window*/)/*:bool*/ {
        var rect = element.getBoundingClientRect()

        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= window.innerHeight &&
            rect.right <= window.innerWidth
        )
    }
}

if(typeof exports === 'object') {
    exports.State = State
    exports.Graph = Graph
}

/*::

declare class Bar {
    text:string;
    value:number;
}

declare class DOMElement {
    getBoundingClientRect: () => Rectangle
}

declare class Rectangle {
    top:number,
    left:number,
    right:number,
    bottom:number
}

declare class Window {
    innerHeight: number,
    innerWidth: number,
}

*/
