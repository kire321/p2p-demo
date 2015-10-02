"use strict";
/* @flow */
/*::

import React from 'react'
import {State} from './logic'

declare var BarChart:ReactClass
declare class Object {}
*/

const margin = {top: 20, right: 20, bottom: 30, left: 40};

const Row = React.createClass({

    propTypes: {
        graph: React.PropTypes.shape({
            typing: React.PropTypes.string.isRequired
        }).isRequired
    },

    render() {
        const graph = this.props.graph
        return (
            <div className="row">
                <div className="col-md-4" />
                <div className="panel panel-default col-md-4">
                    <div className="panel-heading">
                        <h3 className="panel-title">Chart title</h3>
                    </div>
                    <div className="panel-body">
                        <BarChart
                            width={300}
                            height={300}
                            margin={margin}
                            data={graph.data}
                            />
                        <ul className="list-group">
                            {
                                graph.comments.map((comment, index) =>
                                    <li className="list-group-item" key={index}>{comment}</li>
                                )
                            }
                        </ul>
                        <input
                            className="form-control"
                            type="text"
                            value={graph.typing}
                            placeholder="Add a comment..."
                            onKeyUp={graph.onKeyUp.bind(graph)}
                            onChange={graph.onTextFieldChange.bind(graph)}
                            />
                    </div>
                </div>
            </div>
        )
    }
})

const Root = React.createClass({
    propTypes: {
        state: React.PropTypes.shape({
            graphs: React.PropTypes.object.isRequired
        }).isRequired
    },
  render() {
    return (
        <div className="container-fluid">
        {
            Object.keys(this.props.state.graphs).map(key =>
                (<Row graph={this.props.state.graphs[key]} key={key}/>)
            )
        }
        </div>
    );
  }
});
new State((state) => {
    React.render(
      <Root state={state}/>,
      document.getElementById('content')
    );
})
