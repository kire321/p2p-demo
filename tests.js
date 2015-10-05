/* @flow */
/*::
declare function describe(title:string, cases:any):any
declare function it(title:string, cases:any):any
declare function before(func:any):any
*/

import {State, Graph} from './logic'
var assert = require('chai').assert

const doNothingConnection = {'on': () => {}}
const getDoNothingPeer = () => () => ({
    on: () => {},
    connect: () => doNothingConnection,
})
const getMinimalState = () => new State(() => {}, getDoNothingPeer())

const getDefaultGraphArgs = () => ({
    parent: getMinimalState(),
    title: 'laTitle',
    axisTitle: 'laAxis',
    startingData: {},
})

const getDefaultDOMElement = () => ({
    getBoundingClientRect: () => ({
        top:0,
        left:0,
        right:1,
        bottom:1,
    })
})

const getStateWithRenderCallback = ({done, rendersToSkip}/*:{done:Function, rendersToSkip:number}*/)/*:State*/ => {
    var calls = 0
    const callback = (newState) => calls === rendersToSkip ? done(null, newState) : calls += 1
    return new State(callback, getDoNothingPeer())
}

// $FlowIssue
const view = (graph/*:Graph*/) => graph.onPossibleVisibilityChange(getDefaultDOMElement(), {innerHeight: 1, innerWidth: 1})
const scrollAwayFrom = (graph/*:Graph*/) => graph.onPossibleVisibilityChange(getDefaultDOMElement(), {innerHeight: 0, innerWidth: 0})

const defaultComment = "lala"
const typeComment = (graph/*:Graph*/) => {
    const event = {
        target: {
            value: 'lala'
        }
    }
    graph.onTextFieldChange(event)
}

const pushEnter = (graph/*:Graph*/) => graph.onKeyUp({which: 13})
const clickCommentBox = (graph/*:Graph*/) => graph.onFocus()

const submitComment = (graph/*:Graph*/) => {
    typeComment(graph)
    //  $FlowIssue
    graph.startedTypingTime -= 1000
    pushEnter(graph)
}

describe("funnel", () => {
    it("when I view a graph, an incremented view count is rendered", (done) => {
        const graph = getStateWithRenderCallback({done: checkIncrementation, rendersToSkip: 1}).graphs['counts']
        view(graph)
        function checkIncrementation(error, newState) {
            assert.strictEqual(newState.graphs['funnel'].data['view graph'], 1)
            done()
        }
    })

    it("Given I viewed a graph, when I view a graph, the click count is not incremented", () => {
        const state = getMinimalState()
        const graph = state.graphs['counts']
        view(graph)
        scrollAwayFrom(graph)
        view(graph)
        assert.strictEqual(state.graphs['funnel'].data['view graph'], 1)
    })

    it("Given I viewed a graph, when I click a text box, an incremented click count is rendered", (done) => {
        const graph = getStateWithRenderCallback({done: checkIncrementation, rendersToSkip: 2}).graphs['counts']
        view(graph)
        clickCommentBox(graph)
        function checkIncrementation(error, newState) {
            assert.strictEqual(newState.graphs['funnel'].data['click comment box'], 1)
            done()
        }
    })

    it("Given I viewed a graph and clicked a text box, when I press enter, an incremented submit count is rendered", (done) => {
        const graph = getStateWithRenderCallback({done: checkIncrementation, rendersToSkip: 4}).graphs['counts']
        view(graph)
        clickCommentBox(graph)
        submitComment(graph)
        function checkIncrementation(error, newState) {
            assert.strictEqual(newState.graphs['funnel'].data['submit'], 1)
            done()
        }
    })

    it("Given I viewed, clicked, submitted, and clicked, when I submit, the entire funnel has occured once", () => {
        const state = getMinimalState()
        const graph = state.graphs['counts']
        view(graph)
        clickCommentBox(graph)
        submitComment(graph)
        clickCommentBox(graph)
        submitComment(graph)
        assert.strictEqual(state.graphs['funnel'].data['view graph'], 1)
        assert.strictEqual(state.graphs['funnel'].data['click comment box'], 1)
        assert.strictEqual(state.graphs['funnel'].data['submit'], 1)
    })
})

describe("raw counts", () => {
    it("counts page loads", () => {
        const state = getMinimalState()
        assert.strictEqual(state.graphs['counts'].data['page loads'], 1)
    })

    it("counts scrolls", (done) => {
        const state = getStateWithRenderCallback({done: checkIncrementation, rendersToSkip: 1})
        state.onScroll()
        function checkIncrementation(error, newState) {
            assert.strictEqual(newState.graphs['counts'].data['scrolls'], 1)
            done()
        }
    })

    it("counts comment box selections", () => {
        const state = getMinimalState()
        clickCommentBox(state.graphs['views'])
        assert.strictEqual(state.graphs['counts'].data['textbox clicks'], 1)
    })

    it("counts submits", () => {
        const state = getMinimalState()
        submitComment(state.graphs['views'])
        assert.strictEqual(state.graphs['counts'].data['submit'], 1)
    })
})

describe("State", () => {

    it("has empty text fields by default", () => {
        const state = getMinimalState()
        assert.strictEqual('', state.graphs["views"].typing)
    })


    it("does an initial render", (done) => {
        new State((state) => {
            assert.isDefined(state.graphs["views"])
            done()
        }, getDoNothingPeer())
    })

    it("renders typing", (done) => {
        const graph = getStateWithRenderCallback({done, rendersToSkip: 1}).graphs['views']
        typeComment(graph)
    })
})

describe("onPossibleVisibilityChange", () => {
    it("renders its incremented view count if the graph became visible", (done) => {
        const graph = getStateWithRenderCallback({done: checkIncrementation, rendersToSkip: 1}).graphs['counts']
        view(graph)
        function checkIncrementation(error, newState) {
            assert.strictEqual(1, newState.graphs['views'].data['counts'])
            done()
        }
    })

    it("doesn't increment the view count if the graph if offscreen", () => {
        const state = getMinimalState()
        const graph = state.graphs['counts']
        scrollAwayFrom(graph)
        assert.strictEqual(0, state.graphs['views'].data['counts'])
    })

    it("doesn't increment the view count if the graph was already visible", () => {
        const state = getMinimalState()
        const graph = state.graphs['counts']
        view(graph)
        view(graph)
        assert.strictEqual(1, state.graphs['views'].data['counts'])
    })
})

describe("getDataAsArray", () => {
    it("works", () => {
        const state = getMinimalState()
        const views = state.graphs['views']
        const expected = [
            {text: "views", value: 0},
            {text: "funnel", value: 0},
            {text: "counts", value: 0},
            {text: "speed", value: 0},
        ]
        assert.deepEqual(expected, views.getDataAsArray())
    })
})


describe("Graph", () => {
    it("stores typing", () => {
        const graph = new Graph(getDefaultGraphArgs())
        typeComment(graph)
        assert.strictEqual(defaultComment, graph.typing)
    })

    it("renders typing", (done) => {
        const graph = getStateWithRenderCallback({done, rendersToSkip: 1}).graphs['counts']
        typeComment(graph)
    })

    it("when I push enter, the text becomes blank and the comment is added to the list", () => {
        const graph = new Graph(getDefaultGraphArgs())
        submitComment(graph)
        assert.strictEqual('', graph.typing)
        assert.deepEqual(graph.comments, [defaultComment])
    })

    it("Given the comment field is empty, When I push enter nothing happens", () => {
        const graph = new Graph(getDefaultGraphArgs())
        pushEnter(graph)
        assert.deepEqual(graph.comments, [])
    })

    it("graphs typing speed", () => {
        const state = getMinimalState()
        const graph = state.graphs['counts']
        submitComment(graph)
        var speed = state.graphs['speed'].data['1']
        assert.isTrue(speed > 0)
    })
})

const sendMessageToState = (message, state) => state.onOpen({'on': (event, callback) => event === 'data' ? callback(message) : undefined})
const doStuffThatUpdatesGraphs = state => {
    const graph = state.graphs['views']
    view(graph)
    clickCommentBox(graph)
    submitComment(graph)
}
const checkGraphs = state => {
    assert.strictEqual(state.graphs['views'].data['views'], 1)
    assert.strictEqual(state.graphs['funnel'].data['submit'], 1)
    assert.strictEqual(state.graphs['counts'].data['textbox clicks'], 1)
    assert.isTrue(state.graphs['speed'].data['1'] > 0)
}

describe("P2P", () => {
    it("new inbound connections are added to the connection pool", () => {
        const conn = {'on': (event, callback) => event === 'open' ? callback() : null}
        const Peer = () => ({
            on: (event, callback) => event === 'connection' ? callback(conn) : null,
            connect: () => doNothingConnection,
        })
        const state = new State(() => {}, Peer)
        assert.strictEqual(state.connections.length, 1)
    })

    it("successful outbound connections are added to the connection pool", () => {
        const conn = {'on': (event, callback) => event === 'open' ? callback() : null}
        const Peer = () => ({
            on: () => {},
            connect: id => id === 5 ? conn : doNothingConnection,
        })
        const state = new State(() => {}, Peer)
        assert.strictEqual(state.connections.length, 1)
    })

    it("when I add a comment, that comment is sent to all peers", (done) => {
        const state = getMinimalState()
        state.connections = [{ send: state => doAssertions(state) }]
        submitComment(state.graphs['views'])
        function doAssertions(raw) {
            const newState = JSON.parse(raw)
            assert.deepEqual(newState.graphs['views'].comments, ['lala'])
            done()
        }
    })

    it("when my machine receives a comment, that comment is rendered", (done) => {
        const state = getStateWithRenderCallback({done: doAssertions, rendersToSkip: 1})
        const stateWithNewComment = getMinimalState()
        submitComment(stateWithNewComment.graphs['views'])
        const message = JSON.stringify(stateWithNewComment.getSharedState())
        sendMessageToState(message, state)
        function doAssertions(error, newState) {
            assert.deepEqual(newState.graphs['views'].comments, ['lala'])
            done()
        }
    })

    it("doesn't loop infinitely", () => {
        const senderState = getMinimalState()
        const receiverState = getMinimalState()
        senderState.connections = [{ send: message => sendMessageToState(message, receiverState)} ]
        receiverState.connections = [{ send: message => sendMessageToState(message, senderState)} ]
        submitComment(senderState.graphs['views'])
    })

    it("when I do stuff on the page, the updated graphs are sent to all peers", (done) => {
        const state = getMinimalState()
        var calls = 0
        state.connections = [{ send: state => calls === 2 ? doAssertions(state) : calls ++}]
        doStuffThatUpdatesGraphs(state)
        function doAssertions(raw) {
            const newState = JSON.parse(raw)
            checkGraphs(newState)
            done()
        }
    })

    it("when my machine receives graph updates, those updates are merged into the state", () => {
        const state = getMinimalState()
        const stateWithUpdatedGraphs = getMinimalState()
        doStuffThatUpdatesGraphs(stateWithUpdatedGraphs)
        const message = JSON.stringify(stateWithUpdatedGraphs.getSharedState())
        sendMessageToState(message, state)
        checkGraphs(state)
    })

})
