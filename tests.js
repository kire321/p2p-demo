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

const getDefaultState = (done) => {
    var called = false
    return new State((newState) => called ? done(null, newState) : called = true)
}

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
        const state = getDefaultState(done)
        const graph = state.graphs['views']
        const newText = "lala"
        const event = {
            target: {
                value: newText
            }
        }
        graph.onTextFieldChange(event)
    })
})

describe("onPossibleVisibilityChange", () => {
    it("renders its incremented view count if the graph became visible", (done) => {
        var called = false
        const state = new State((newState) => called ? checkIncrementation(newState) : called = true)
        const graph = state.graphs['counts']
        graph.onPossibleVisibilityChange(getDefaultDOMElement(), {innerHeight: 1, innerWidth: 1})
        function checkIncrementation(newState) {
            assert.strictEqual(1, newState.graphs['views'].data['counts'])
            done()
        }
    })

    it("doesn't increment the view count if the graph if offscreen", () => {
        const state = new State(() => {})
        const graph = state.graphs['counts']
        graph.onPossibleVisibilityChange(getDefaultDOMElement(), {innerHeight: 0, innerWidth: 0})
        assert.strictEqual(0, state.graphs['views'].data['counts'])
    })

    it("doesn't increment the view count if the graph was already visible", () => {
        const state = new State(() => {})
        const graph = state.graphs['counts']
        graph.onPossibleVisibilityChange(getDefaultDOMElement(), {innerHeight: 1, innerWidth: 1})
        graph.onPossibleVisibilityChange(getDefaultDOMElement(), {innerHeight: 1, innerWidth: 1})
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
        const newText = "lala"
        const event = {
            target: {
                value: newText
            }
        }
        graph.onTextFieldChange(event)
        assert.strictEqual(newText, graph.typing)
    })

    it("renders typing", (done) => {
        const state = getDefaultState(done)
        const graph = state.graphs['counts']
        const newText = "lala"
        const event = {
            target: {
                value: newText
            }
        }
        graph.onTextFieldChange(event)
    })

    it("when I push enter, the text becomes blank and the comment is added to the list", () => {
        const graph = new Graph(getDefaultGraphArgs())
        const newText = "lala"
        const event = {
            target: {
                value: newText
            }
        }
        graph.onTextFieldChange(event)
        graph.onKeyUp({which: 13})
        assert.strictEqual('', graph.typing)
        assert.deepEqual(graph.comments, [newText])
    })
})
