"use strict";
/* @flow */


class State {

    /*::
    graphs:{[key: string]: Graph};
    render:Function;
    lastFunnelStep:number;
    */

    constructor(render/*:Function*/) {

        this.lastFunnelStep = 0

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

        this.graphs['counts'].data['page loads'] += 1
        this.render = () => render(this)
        this.render()
    }

    updateFunnel(event/*:string*/) {
        const order = {
            'view graph': 1,
            'click comment box': 2,
            'submit': 3,
        }
        const currentStep = order[event]
        if (currentStep === this.lastFunnelStep + 1) {
            this.graphs['funnel'].data[event] += 1
            this.lastFunnelStep = currentStep
        }
        if (this.lastFunnelStep === 3) {
            this.lastFunnelStep = 0
        }
    }

    onScroll() {
        this.graphs['counts'].data['scrolls'] += 1
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
        if (this.typing !== '' && event.which == enterKey){
            this.comments.push(this.typing)
            this.typing = ''
            this.parent.updateFunnel('submit')
            this.parent.graphs['counts'].data['comment submission'] += 1            
            this.parent.render()
        }
    }

    onFocus() {
        this.parent.updateFunnel('click comment box')
        this.parent.graphs['counts'].data['select comment box'] += 1
        this.parent.render()
    }

    onPossibleVisibilityChange(element/*:DOMElement*/, window/*:Window*/) {
        if (didBecomeVisible(this)) {
            const graphs = this.parent.graphs
            const myName = Object.keys(graphs).filter(key => graphs[key] === this)[0]
            graphs['views'].data[myName] += 1
            this.parent.updateFunnel('view graph')
            this.parent.render()
        }

        function didBecomeVisible(self)/*:bool*/ {
            const newVisibility = isElementVisible(element, window)
            const becameVisible = (!self.visible) && newVisibility
            self.visible = newVisibility
            return becameVisible
        }

        function isElementVisible()/*:bool*/ {
            var rect = element.getBoundingClientRect()

            return (
                rect.top >= 0 &&
                rect.left >= 0 &&
                rect.bottom <= window.innerHeight &&
                rect.right <= window.innerWidth
            )
        }
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
