"use strict";
/* @flow */
/*::
import _ from 'lodash'
*/
if (typeof require === 'function') {
    var _ = require('lodash')
}

class State {

    /*::
    graphs:{[key: string]: Graph};
    render:Function;
    lastFunnelStep:number;
    connections:Array<Object>;
    Peer:Function;
    lastState:SharedState;
    */

    constructor(render/*:Function*/, Peer/*:Function*/) {

        this.Peer = Peer
        this.connections = []
        this.initializeP2P(Peer)

        this.lastFunnelStep = 0

        this.initializeGraphs()
        this.graphs['counts'].data['page loads'] += 1

        this.render = render
        this.lastState = this.getSharedState()
        this.onUpdate()

    }

    onUpdate() {
        this.render(this)
        const sharedState = this.getSharedState()
        if(!_.isEqual(sharedState, this.lastState)) {
            const message = JSON.stringify(sharedState)
            this.lastState = sharedState
            this.connections.forEach((conn) => conn.send(message))
        }
    }

    getSharedState()/*:SharedState*/ {
        const pairs = _.pairs(this.graphs).map(args => [args[0], args[1].getSharedState()])
        const graphs = _.zipObject(pairs)
        return {
            graphs: graphs
        }
    }

    initializeP2P() {
        const possibleIdCount = 10
        const myId = Math.floor(Math.random() * possibleIdCount)

        var peer = new this.Peer(myId, {key: 'qdpeahtrzay06bt9'})
        peer.on('connection', (conn) => this.listenForOpen(conn))

        for (var i = 0; i < possibleIdCount; i++) {
            const conn = peer.connect(i)
            this.listenForOpen(conn)
        }
    }

    listenForOpen(conn/*:Listenable*/) {
        conn.on('error', this.onError)
        conn.on('open', () => this.onOpen(conn))
    }

    onError(error/*:Error*/) {
        console.trace(error)
    }

    onOpen(conn/*:Listenable*/) {
        conn.on('data', this.onPeerState.bind(this))
        conn.on('error', this.onError)
        conn.on('close', function() {
            console.log("conn closed")
        })
        this.connections.push(conn)
    }

    onPeerState(raw/*:string*/) {
        const state = JSON.parse(raw)
        const mergeByKey = key => this.graphs[key].merge(state.graphs[key])
        Object.keys(this.graphs).forEach(mergeByKey)
        this.onUpdate()
    }

    initializeGraphs() {
        this.graphs = {
            views: new Graph({
                parent: this,
                title: "View count for each graph",
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
                startingData: {
                    "view graph": 0,
                    "click comment box": 0,
                    "submit": 0,
                },
            }),
            counts: new Graph({
                parent: this,
                title: "Let's count some events",
                startingData: {
                    "page loads": 0,
                    "scrolls": 0,
                    "textbox clicks": 0,
                    "submit": 0,
                },
            }),
            speed: new Graph({
                parent: this,
                title: "Typing speed of each comment, in characters / second",
                startingData: {},
            }),
        }
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
        this.onUpdate()
    }

}

class Graph {

    /*::
    parent:State;
    typing:string;
    comments:Array<string>;
    data:{[key: string]: number};
    title:string;
    visible:bool;
    startedTypingTime:?number;
    */

    constructor(args/*:{parent:State, title:string, startingData:{[key: string]: number}}*/) {
        this.parent = args.parent
        this.typing = ''
        this.data = args.startingData
        this.title = args.title
        this.comments = []
        this.visible = false
        this.startedTypingTime = null
    }

    getSharedState()/*:SharedGraphState*/ {
        return {
            comments: _.clone(this.comments),
            data: _.clone(this.data),
        }
    }

    merge(other/*:Graph*/) {
        this.mergeComments(other)
        this.data = _.merge(this.data, other.data, (left, right) => _.isNumber(left) && _.isNumber(right) ? Math.max(left, right) : undefined)
    }

    mergeComments(other/*:Graph*/) {
        const myComments = _.indexBy(this.comments, (item, index) => index)
        const otherComments = _.indexBy(other.comments, (item, index) => index)
        const asObject = _.merge(myComments, otherComments)
        const asUnsortedArray = _.pairs(asObject)
        const asSortedArray = _.sortBy(asUnsortedArray, args => args[0])
        this.comments = asSortedArray.map(args => args[1])
    }

    getDataAsArray()/*:Array<Bar>*/ {
        return Object.keys(this.data).map(key => ({text: key, value: this.data[key]}))
    }

    onTextFieldChange(event/*:{target: {value: string}}*/) {
        this.typing = event.target.value
        if (this.startedTypingTime === null) {
            this.startedTypingTime = Date.now()
        }
        this.parent.onUpdate()
    }


    onKeyUp(event/*:{which:number}*/) {
        var enterKey = 13;
        if (this.typing !== '' && event.which == enterKey){

            this.parent.updateFunnel('submit')

            this.parent.graphs['counts'].data['submit'] += 1

            // $FlowIssue
            const speed = 1000 * this.typing.length / (Date.now() - this.startedTypingTime)
            const graphs = this.parent.graphs
            const commentsCount = Object.keys(graphs)
                .map(key => graphs[key].comments.length)
                .reduce((left, right) => left + right)
            this.parent.graphs['speed'].data['' + (commentsCount + 1)] =  speed
            this.startedTypingTime = null

            this.comments.push(this.typing)
            this.typing = ''
            this.parent.onUpdate()
        }
    }

    onFocus() {
        this.parent.updateFunnel('click comment box')
        this.parent.graphs['counts'].data['textbox clicks'] += 1
        this.parent.onUpdate()
    }

    onPossibleVisibilityChange(element/*:DOMElement*/, window/*:Window*/) {
        if (didBecomeVisible(this)) {
            const graphs = this.parent.graphs
            const myName = Object.keys(graphs).filter(key => graphs[key] === this)[0]
            graphs['views'].data[myName] += 1
            this.parent.updateFunnel('view graph')
            this.parent.onUpdate()
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
                rect.bottom <= window.innerHeight
            )
        }
    }
}

if(typeof exports === 'object') {
    exports.State = State
    exports.Graph = Graph
}

/*::

declare class SharedState {
    graphs:{[key:string]: SharedGraphState};
}

declare class SharedGraphState {
    comments: Array<string>;
    data:{[key: string]: number};
}

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

declare class Listenable {
    on: (event:string, callback: Function) => void
}

*/
