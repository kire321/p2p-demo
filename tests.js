/* @flow */
/*::
declare function describe(title:string, cases:any):any
declare function it(title:string, cases:any):any
declare function before(func:any):any
*/

import {State, Graph} from './logic'
var assert = require('chai').assert
const getDefaultGraphArgs = () => ({
    render: () => {},
    title: 'laTitle',
    axisTitle: 'laAxis',
    startingData: [],
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
        var called = false
        const state = new State(() => called ? done() : called = true)
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
        const params = Object.assign(getDefaultGraphArgs(), {render: done})
        const graph = new Graph(params)
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
