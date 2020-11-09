import React from 'react';
import * as d3 from "d3";
import './ExampleComponent.css';

class ExampleComponent extends React.Component {
  constructor(props) {
    super(props);
    // look at App.js for how these fields were passed to the ExampleComponent
    this.spotifyWebApi = this.props.spotifyWebApi;
    this.width = this.props.width;
    this.height = this.props.height;
  }
  
  /** When the component mounts */
  componentDidMount() {
    this.spotifyWebApi.search(
      "top 50", //search for all results matching top 50
      ["playlist"], //filter results to only playlists
      {limit: 1}, //limits to one result
      (err, response) => {
        if (err) {
          console.log(err);
          return;
        }
        this.spotifyWebApi.getPlaylistTracks(
          response.playlists.items[0].id,
          (err, response) => {
            if (err) {
              console.log(err);
              return;
            }
            let trackIds = response.items.map( (item) => item.track.id );


            this.spotifyWebApi.getAudioFeaturesForTracks(
              trackIds,
              (err, response) => {
                if (err) {
                  console.log(err);
                  return;
                }
                console.log(response);
                let acousticnessAndDanceability = 
                  response.audio_features
                    .map(
                      (audio_feature) => {
                        return {
                          acousticness: audio_feature.acousticness,
                          danceability: audio_feature.danceability
                        }
                      }
                    );
                console.log(acousticnessAndDanceability);
                

                // BELOW IS COPIED CODE FROM https://www.d3-graph-gallery.com/graph/scatter_basic.html for how to make a scatter plot
                // set the dimensions and margins of the graph
                var margin = {top: 10, right: 30, bottom: 30, left: 60},
                width = this.width - margin.left - margin.right,
                height = this.height - margin.top - margin.bottom;

                // append the svg object to the body of the page
                var svg = d3.select(this.node)
                .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform",
                      "translate(" + margin.left + "," + margin.top + ")");

                // Add X axis
                var x = d3.scaleLinear()
                .domain([0, 1])
                .range([ 0, width ]);
                svg.append("g")
                .attr("transform", "translate(0," + height + ")")
                .call(d3.axisBottom(x));

                // Add Y axis
                var y = d3.scaleLinear()
                .domain([0, 1])
                .range([ height, 0]);
                svg.append("g")
                .call(d3.axisLeft(y));

                // Add dots
                svg.append('g')
                .selectAll("dot")
                .data(acousticnessAndDanceability)
                .enter()
                .append("circle")
                  .attr("cx", function (d) { return x(d.acousticness); } )
                  .attr("cy", function (d) { return y(d.danceability); } )
                  .attr("r", 5)
                  .style("fill", "#69b3a2")
              }
            )
          }
        )
      }
    )



        
  }

  render() {
    return (
      <svg ref={(node) => this.node = node} width={this.width} height={this.height} />
    );
  }
}

export default ExampleComponent;

