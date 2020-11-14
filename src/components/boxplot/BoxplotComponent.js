import React from 'react';
import * as d3 from "d3";
import { nest } from 'd3-collection';
import './BoxplotComponent.css';

const COMPONENT_WIDTH = 700;
const COMPONENT_HEIGHT = 500;

class BoxplotComponent extends React.Component {
  constructor(props) {
    super(props);
    this.spotifyWebApi = this.props.spotifyWebApi;
    this.margin = { top: 50, right: 10, bottom: 60, left: 50 };
    this.width = COMPONENT_WIDTH - this.margin.left - this.margin.right;
    this.height = COMPONENT_HEIGHT - this.margin.top - this.margin.bottom;
    this.data = [];
    this.countries = ["United States", "France", "Mexico", "Japan", "South Korea"];
  }

  async getTop50Tracks(country) {
    const searchResults = await this.spotifyWebApi.search(
      country + " Top 50", //search for all results matching top 50
      ["playlist"], //filter results to only playlists
      { limit: 1 })


    const playlistTracks = await this.spotifyWebApi.getPlaylistTracks(
      searchResults.playlists.items[0].id,
    );

    let trackIds = playlistTracks.items.map((item) => item.track.id);

    const audioFeatures = await this.spotifyWebApi.getAudioFeaturesForTracks(
      trackIds,
    );

    return audioFeatures.audio_features
      .map(
        (audio_feature) => {
          return {
            acousticness: audio_feature.acousticness,
            danceability: audio_feature.danceability,
            country
          }
        }
      );
  }

  /** When the component mounts */
  componentDidMount() {
    Promise.all(this.countries.map((country) => {
      return this.getTop50Tracks(country);
    })).then(
      (data) => {
        let flatData = data.flatMap((x) => x);

        // REFERENCE: https://www.d3-graph-gallery.com/graph/boxplot_show_individual_points.html
        // Compute quartiles, median, inter quantile range min and max --> these info are then used to draw the box.
        let sumstat = nest()
          .key(function (d) { return d.country; })
          .rollup(function (d) {
            let q1 = d3.quantile(d.map(function (t) { return t.acousticness; }).sort(d3.ascending), .25)
            let median = d3.quantile(d.map(function (t) { return t.acousticness; }).sort(d3.ascending), .5)
            let q3 = d3.quantile(d.map(function (t) { return t.acousticness; }).sort(d3.ascending), .75)
            let interQuantileRange = q3 - q1
            let min = q1 - 1.5 * interQuantileRange
            let max = q3 + 1.5 * interQuantileRange
            console.log(d)
            console.log(min, max, q1, q3, median, interQuantileRange)
            return ({ q1: q1, median: median, q3: q3, interQuantileRange: interQuantileRange, min: min, max: max })
          })
          .entries(flatData)

        // Append the svg object to the body of the page
        var svg = d3.select(this.node)
          .append("svg")
          .attr("width", this.width + this.margin.left + this.margin.right)
          .attr("height", this.height + this.margin.top + this.margin.bottom)
          .append("g")
          .attr("transform",
            "translate(" + this.margin.left + "," + this.margin.top + ")")
        
        this.drawLabels(svg);

        // Show the X scale
        var x = d3.scaleBand()
          .range([0, this.width])
          .domain(this.countries)
          .paddingInner(1)
          .paddingOuter(.5)
        svg.append("g")
          .attr("transform", "translate(0," + this.height + ")")
          .call(d3.axisBottom(x))

        // Show the Y scale
        var y = d3.scaleLinear()
          .domain([-1.0, 2.0])
          .range([this.height, 0])
        svg.append("g").call(d3.axisLeft(y))

        // Show the main vertical line
        svg
          .selectAll("vertLines")
          .data(sumstat)
          .enter()
          .append("line")
          .attr("x1", function (d) { return (x(d.key)) })
          .attr("x2", function (d) { return (x(d.key)) })
          .attr("y1", function (d) { return (y(d.value.min)) })
          .attr("y2", function (d) { return (y(d.value.max)) })
          .attr("stroke", "black")
          .style("width", 40)

        // rectangle for the main box
        var boxWidth = 100
        svg
          .selectAll("boxes")
          .data(sumstat)
          .enter()
          .append("rect")
          .attr("x", function (d) { return (x(d.key) - boxWidth / 2) })
          .attr("y", function (d) { return (y(d.value.q3)) })
          .attr("height", function (d) { return (y(d.value.q1) - y(d.value.q3)) })
          .attr("width", boxWidth)
          .attr("stroke", "black")
          .style("fill", "#69b3a2")

        // Show the median
        svg
          .selectAll("medianLines")
          .data(sumstat)
          .enter()
          .append("line")
          .attr("x1", function (d) { return (x(d.key) - boxWidth / 2) })
          .attr("x2", function (d) { return (x(d.key) + boxWidth / 2) })
          .attr("y1", function (d) { return (y(d.value.median)) })
          .attr("y2", function (d) { return (y(d.value.median)) })
          .attr("stroke", "black")
          .style("width", 80)

        // Add individual points with jitter
        var jitterWidth = 50
        svg
          .selectAll("indPoints")
          .data(flatData)
          .enter()
          .append("circle")
          .attr("cx", function (d) { return (x(d.country) - jitterWidth / 2 + Math.random() * jitterWidth) })
          .attr("cy", function (d) { return (y(d.acousticness)) })
          .attr("r", 4)
          .style("fill", "white")
          .attr("stroke", "black")
        // REFERENCE END
      }
    ).catch((e) => {
      console.error(e);
    })
  }

  // REFERENCE: https://observablehq.com/@stanfordvis/lets-make-a-scatterplot
  drawLabels(svg) {
    // Add title
    svg.append("text")
    .attr("transform", `translate(${this.width/2}, ${-this.margin.top/2})`)
    .style("text-anchor", "middle")
    .style("font-size", 14)
    .text("Boxplot"); 

    // Add X label
    svg.append("text")
    .attr("transform", `translate(${this.width/2}, ${this.height + 35})`)
    .style("text-anchor", "middle")
    .style("font-size", 11)
    .text("Top 50 Most Played Tracks by Country");

    // Add Y axis label
    svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - this.margin.left)
    .attr("x",0 - (this.height / 2))
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .style("font-size", 11)
    .text("feature"); 
  }

  render() {
    return (
      <div>
        <svg ref={(node) => this.node = node} width={COMPONENT_WIDTH} height={COMPONENT_HEIGHT} />
      </div>
    );
  }
}

export default BoxplotComponent;

