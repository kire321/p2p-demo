/* @flow */
/*::
declare function describe(title:string, cases:any):any
declare function it(title:string, cases:any):any
declare function before(func:any):any
*/

import {State, Graph} from './logic'
var assert = require('chai').assert

describe("State", () => {

    it("has empty text fields by default", () => {
        const state = new State(() => {})
        assert.strictEqual('', state.graphs["foo"].typing)
        assert.strictEqual('', state.graphs["bar"].typing)
        assert.strictEqual('', state.graphs["baz"].typing)
        assert.strictEqual('', state.graphs["bazdmeg"].typing)
    })

    it("does an initial render", (done) => {
        new State((state) => {
            assert.isDefined(state.graphs["foo"])
            done()
        })
    })

    it("renders typing", (done) => {
        var called = false
        const state = new State(() => called ? done() : called = true)
        const graph = state.graphs['foo']
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
        const graph = new Graph(() => {})
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
        const graph = new Graph(done)
        const newText = "lala"
        const event = {
            target: {
                value: newText
            }
        }
        graph.onTextFieldChange(event)
    })
})
