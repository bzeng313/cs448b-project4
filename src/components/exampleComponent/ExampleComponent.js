import React from 'react';
import './ExampleComponent.css';

class ExampleComponent extends React.Component {
  constructor(props) {
    super(props);
    this.spotifyWebApi = this.props.spotifyWebApi;
  }
  
  componentDidMount() {
    this.spotifyWebApi.search(
      "top 50",
      ["playlist"],
      {limit: 3}, function (err, response) {
        if (err) {
          console.log(err);
          return;
        }
        console.log(response);
      }
    )
  }

  render() {
    return (
      <div>
        Add in d3 datavisualization here...
      </div>
    );
  }
}

export default ExampleComponent;

