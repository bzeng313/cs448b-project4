import React from 'react';
import * as d3 from "d3";
import './Scatterplot.css';

class Scatterplot extends React.Component {
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

            let idToPopularity = {};
            for (var i in response.items) {
              let track = response.items[i].track;
              idToPopularity[track.id] = track.popularity;
            }
            let trackIds = Object.keys(idToPopularity);

            this.spotifyWebApi.getAudioFeaturesForTracks(
              trackIds,
              (err, response) => {
                if (err) {
                  console.log(err);
                  return;
                }
                console.log(response);
                let audioFeatures = 
                  response.audio_features
                    .map(
                      (audio_feature) => {
                        return {
                          acousticness: audio_feature.acousticness,
                          danceability: audio_feature.danceability,
                          // energy: audio_feature.energy,
                          // instrumentalness: audio_feature.instrumentalness,
                          // liveness: audio_feature.liveness,
                          // loudness: audio_feature.loudness,
                          // speechiness: audio_feature.speechiness,
                          // valence: audio_feature.valence,
                          // tempo: audio_feature.tempo,
                          popularity: idToPopularity[audio_feature.id],
                        }
                      }
                    );
                console.log(audioFeatures);
                
                // REFERENCE: https://www.d3-graph-gallery.com/graph/scatter_basic.html
                // set the dimensions and margins of the graph
                var margin = {top: 50, right: 50, bottom: 50, left: 50},
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

                this.drawScatterplot(svg, width, height, audioFeatures);
                this.drawScatterplotLabels(svg, width, height, margin);
              }
            )
          }
        )
      }
    )   
  }
  
  // REFERENCE: https://www.d3-graph-gallery.com/graph/scatter_basic.html
  drawScatterplot(svg, width, height, audioFeatures) {
    // Add X axis
    var x = d3.scaleLinear()
    .domain([0, 1])
    .range([ 0, width ]);
    svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));

    // Add Y axis
    var y = d3.scaleLinear()
    .domain([50, 100])
    .range([ height, 0]);
    svg.append("g")
    .call(d3.axisLeft(y));

    // Add dots
    svg.append('g')
    .selectAll("dot")
    .data(audioFeatures)
    .enter()
    .append("circle")
      .attr("cx", function (d) { return x(d.acousticness); } )
      .attr("cy", function (d) { return y(d.popularity); } )
      .attr("r", 5)
      .style("fill", "#69b3a2")
    .on('mouseover', function (event, d) {
      svg.append('text')
        .attr('class', 'ptLabel')
        .attr('x', x(d.acousticness))
        .attr('y', y(d.popularity))
        .text('test'); 
      })
    .on('mouseout', function(event, d) {
        svg.selectAll('.ptLabel').remove()
      });
  }

  // REFERENCE: https://observablehq.com/@stanfordvis/lets-make-a-scatterplot
  drawScatterplotLabels(svg, width, height, margin) {
    // Add title
    svg.append("text")
    .attr("transform", `translate(${width/2}, ${-margin.top/2})`)
    .style("text-anchor", "middle")
    .style("font-size", 14)
    .text("Scatterplot"); 
    
    // Add X label
    svg.append("text")
    .attr("transform", `translate(${width/2}, ${height + 35})`)
    .style("text-anchor", "middle")
    .style("font-size", 14)
    .text("x axis");

    // Add Y axis label
    svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.bottom)
    .attr("x",0 - (height / 2))
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .style("font-size", 14)
    .text("popularity"); 
  }

  render() {
    return (
      <svg ref={(node) => this.node = node} width={this.width} height={this.height} />
    );
  }
}

export default Scatterplot;