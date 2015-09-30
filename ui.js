/* @flow */
/*::

import React from 'react'

declare var BarChart:ReactClass

*/

const data = {
  "foo": {
      "data": [
        {text: 'Man', value: 500},
        {text: 'Woman', value: 300}
      ],
      "comments": [
          'yolo',
          'wizardry'
      ],
  },
  "bar": {
      "data": [
        {text: 'Man', value: 500},
        {text: 'Woman', value: 300}
      ],
      "comments": [
          'yolo',
          'wizardry'
      ],
  },
  "baz": {
      "data": [
        {text: 'Man', value: 500},
        {text: 'Woman', value: 300}
      ],
      "comments": [
          'yolo',
          'wizardry'
      ],
  },
};

const margin = {top: 20, right: 20, bottom: 30, left: 40};

const Row = React.createClass({

    getInitialState() {
        return {value: ''}
    },

    onChange(event) {
        this.setState({value: event.target.value})
    },

    onKeyUp(event) {
        var enterKey = 13;
        if (event.which == enterKey){
            this.setState({'value': ''})
        }
    },

    render() {
        const key = this.props.title
        return (
            <div className="row">
                <div className="col-md-4" />
                <div className="panel panel-default col-md-4">
                    <div className="panel-heading">
                        <h3 className="panel-title">{key}</h3>
                    </div>
                    <div className="panel-body">
                        <BarChart
                            width={300}
                            height={300}
                            margin={margin}
                            data={data[key].data}
                            />
                        <ul className="list-group">
                            {
                                data[key].comments.map((comment, index) =>
                                    <li className="list-group-item" key={index}>{comment}</li>
                                )
                            }
                        </ul>
                        <input
                            className="form-control"
                            type="text"
                            value={this.state.value}
                            placeholder="Add a comment..."
                            onKeyUp={this.onKeyUp}
                            onChange={this.onChange}
                            />
                    </div>
                </div>
            </div>
        )
    }
})

const Example = React.createClass({
  render() {
    return (
        <div className="container-fluid">
        {
            Object.keys(data).map(key =>
                (<Row title={key} key={key}/>)
            )
        }
        </div>
    );
  }
});
React.render(
  <Example />,
  document.getElementById('content')
);
