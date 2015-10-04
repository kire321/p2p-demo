/* @flow */
/*::
declare function describe(title:string, cases:any):any
declare function it(title:string, cases:any):any
declare function before(func:any):any
*/

import {State, Graph} from './logic'
var assert = require('chai').assert

const getDefaultGraphArgs = () => ({
    parent: new State(() => {}),
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

const getDefaultState = ({done, rendersToSkip}/*:{done:Function, rendersToSkip:number}*/)/*:State*/ => {
    var calls = 0
    return new State((newState) => calls === rendersToSkip ? done(null, newState) : calls += 1)
}

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
    pushEnter(graph)
}

describe("funnel", () => {
    it("when I view a graph, an incremented view count is rendered", (done) => {
        const graph = getDefaultState({done: checkIncrementation, rendersToSkip: 1}).graphs['counts']
        view(graph)
        function checkIncrementation(error, newState) {
            assert.strictEqual(newState.graphs['funnel'].data['view graph'], 1)
            done()
        }
    })

    it("Given I viewed a graph, when I view a graph, the click count is not incremented", () => {
        const state = new State(() => {})
        const graph = state.graphs['counts']
        view(graph)
        scrollAwayFrom(graph)
        view(graph)
        assert.strictEqual(state.graphs['funnel'].data['view graph'], 1)
    })

    it("Given I viewed a graph, when I click a text box, an incremented click count is rendered", (done) => {
        const graph = getDefaultState({done: checkIncrementation, rendersToSkip: 2}).graphs['counts']
        view(graph)
        clickCommentBox(graph)
        function checkIncrementation(error, newState) {
            assert.strictEqual(newState.graphs['funnel'].data['click comment box'], 1)
            done()
        }
    })

    it("Given I viewed a graph and clicked a text box, when I press enter, an incremented submit count is rendered", (done) => {
        const graph = getDefaultState({done: checkIncrementation, rendersToSkip: 4}).graphs['counts']
        view(graph)
        clickCommentBox(graph)
        submitComment(graph)
        function checkIncrementation(error, newState) {
            assert.strictEqual(newState.graphs['funnel'].data['submit'], 1)
            done()
        }
    })

    it("Given I viewed, clicked, submitted, and clicked, when I submit, the entire funnel has occured once", () => {
        const state = new State(() => {})
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

describe("State", () => {

    it("has empty text fields by default", () => {
        const state = new State(() => {})
        assert.strictEqual('', state.graphs["views"].typing)
    })


    it("does an initial render", (done) => {
        new State((state) => {
            assert.isDefined(state.graphs["views"])
            done()
        })
    })

    it("renders typing", (done) => {
        const graph = getDefaultState({done, rendersToSkip: 1}).graphs['views']
        typeComment(graph)
    })
})

describe("onPossibleVisibilityChange", () => {
    it("renders its incremented view count if the graph became visible", (done) => {
        const graph = getDefaultState({done: checkIncrementation, rendersToSkip: 1}).graphs['counts']
        view(graph)
        function checkIncrementation(error, newState) {
            assert.strictEqual(1, newState.graphs['views'].data['counts'])
            done()
        }
    })

    it("doesn't increment the view count if the graph if offscreen", () => {
        const state = new State(() => {})
        const graph = state.graphs['counts']
        scrollAwayFrom(graph)
        assert.strictEqual(0, state.graphs['views'].data['counts'])
    })

    it("doesn't increment the view count if the graph was already visible", () => {
        const state = new State(() => {})
        const graph = state.graphs['counts']
        view(graph)
        view(graph)
        assert.strictEqual(1, state.graphs['views'].data['counts'])
    })
})

describe("getDataAsArray", () => {
    it("works", () => {
        const state = new State(() => {})
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
        const graph = getDefaultState({done, rendersToSkip: 1}).graphs['counts']
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
})
