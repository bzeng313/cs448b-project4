import React, { useEffect, useRef, useState } from 'react';
import * as d3 from "d3";
import dimData from './dims_over_time_complete.csv'
import { get } from 'request';

export default function LineChartComponent({
    spotifyWebApi
}) {
    useEffect(() => {
        var margin = {top: 80, right: 100, bottom: 100, left: 50},
        width = 860 - margin.left - margin.right,
        height = 800 - margin.top - margin.bottom;

        let svg = d3.select("#my_dataviz")
          .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
          .append("g")
            .attr("transform",
                  "translate(" + margin.left + "," + margin.top + ")");

        svg.append("text")
          .attr("transform", `translate(${width / 2}, ${-margin.top / 3})`)
          .style("text-anchor", "middle")
          .style("font-size", 20)
          .text("Change in Audio Features from 2000-2020");
        
        // x axis label
        svg.append("text")
          .attr("transform", `translate(${width / 2}, ${height + 35})`)
          .style("text-anchor", "middle")
          .style("font-size", 16)
          .text("Year");            

        // y axis label
        svg.append("text")
          .attr("id", "y-axis-label-andrew")
          .attr("transform", "rotate(-90)")
          .attr("y", 0 - margin.left)
          .attr("x", 0 - (height / 2))
          .attr("dy", "1em")
          .style("text-anchor", "middle")
          .style("font-size", 16)
          .text('mean valence');
          
        svg.append("text")
          .attr('id', 'loading')
          .attr("transform", `translate(${width / 2}, ${height + 65})`)
          .style("text-anchor", "middle")
          .style("font-size", 16)
          .text("Loading...")   
          .attr('opacity', 1);

        let dimensions = ["valence", "danceability", "acousticness", "energy", "instrumentalness", "liveness", "speechiness"]
        d3.select("#selectButton")
              .selectAll('myOptions')
             	.data(dimensions)
              .enter()
            	.append('option')
              .text(function (d) { return d; }) // text showed in the menu
              .attr("value", function (d) { return d; }) // corresponding value returned by the button
        
        let schema = ["mean", "range"]
        d3.select("#schemaButton")
              .selectAll('myOptions')
             	.data(schema)
              .enter()
            	.append('option')
              .text(function (d) { return d; }) // text showed in the menu
              .attr("value", function (d) { return d; }) // corresponding value returned by the button
      
        // A color scale: one color for each group
        let myColor = d3.scaleOrdinal()
          .domain(dimensions)
          .range(d3.schemeSet2);

        // Add X axis --> it is a date format
        let x = d3.scaleLinear()
          .domain([2000, 2020])
          .range([ 0, width ])
        svg.append("g")
          .attr("transform", "translate(0," + height + ")")
          .call(d3.axisBottom(x).tickFormat(d3.format("d")));

        // Add Y axis
        var y = d3.scaleLinear()
          .domain( [0, 1])
          .range([ height, 0 ]);
        svg.append("g")
          .call(d3.axisLeft(y));

        async function getData() {
                    let res = [];
                    await d3.csv(dimData, function(data) { res.push(data) });
                    return res;
        }
        let line;

            getData().then((result) => {
              line = svg.append('g')
                            .append('path')
                            .datum(result)
                            .attr('d', d3.line()
                            .x(d => x(d['year']))
                            .y(d => y(d['avg_danc']))
                            )
                            .attr('stroke', function(d) {
                                return myColor('valence')
                            })
                            .style('stroke-width', 4)
                            .style('fill', 'none')
                  d3.selectAll('#loading').attr('opacity', 0)
            });
        // A function that update the chart
        function updateDimension() {

                let mapDimToAvg = {'valence': 'avg_val',
                               'danceability': 'avg_danc',
                               'acousticness': 'avg_acou',
                               'energy': 'avg_ene',
                               'instrumentalness': 'avg_inst',
                               'liveness': 'avg_live',
                               'speechiness': 'avg_spe'};
                let mapDimToRng = {'valence': 'rng_val',
                               'danceability': 'rng_danc',
                               'acousticness': 'rng_acou',
                               'energy': 'rng_ene',
                               'instrumentalness': 'rng_inst',
                               'liveness': 'rng_live',
                               'speechiness': 'rng_spe'};
                 
                var selectedDim = d3.select('#selectButton').property("value")
                var schema = d3.select('#schemaButton').property("value")


                d3.selectAll('#y-axis-label-andrew').text(schema + " " + selectedDim);
                
                let useDict;
                if (schema === 'mean') {
                  useDict = mapDimToAvg;

                } else {
                  useDict = mapDimToRng;
                }

                getData().then((result) => {
                line
                .datum(result)
                .transition()
                .duration(1000)
                .attr("d", d3.line()
                          .x(d => x(d['year']))
                          .y(d => y(d[useDict[selectedDim]]))
                )
                .attr("stroke", function(d){ return myColor(selectedDim) })

                })
        }

        // When the button is changed, run the updateChart function
        d3.select("#selectButton").on("change", function(d) {
            updateDimension();
        })

        d3.select("#schemaButton").on("change", function(d) {
            // mean, range

            // line.attr('stroke-opacity', 0);
            // run the updateChart function with this selected option
            updateDimension();
        })
    }, [spotifyWebApi])


    return (
        <div>
            <script src="https://d3js.org/d3-scale-chromatic.v1.min.js"></script>
            <div id="my_dataviz"></div>
            <select id="selectButton"></select>
            <select id="schemaButton"></select>
        </div>
    )
}

async function calculateTop50Data(spotifyWebApi, dimension) {
    let dim_across_years = [];
    let collector_array = [];
    for (let i = 2000; i <= 2020; i++) {
        await getTop50Tracks(spotifyWebApi, i).then(function(results) {           
            let running_sum = 0
            let max_dim = 0
            let min_dim = 2
            for (var j = 0; j < results.length; j++) {
                if (results[j][dimension] > max_dim) {
                  max_dim = results[j][dimension]
                }
                if (results[j][dimension] < min_dim) {
                  min_dim = results[j][dimension]
                }
                running_sum += results[j][dimension];
            }
            let yearToAvg = {'year': i, 'avg': running_sum / results.length, 'rng': max_dim - min_dim}
            collector_array.push(max_dim - min_dim);
            dim_across_years.push(yearToAvg); 
        })
    }
    console.log(collector_array);
    return dim_across_years;
}

async function getTop50Tracks(spotifyWebApi, year) {
    console.log('calling for top hits of ' + year.toString());
  const searchResults = await spotifyWebApi.search(
    "Top Hits of " + year.toString(),
    ["playlist"], //filter results to only playlists
    { limit: 1 })

  const playlist = await spotifyWebApi.getPlaylistTracks(
    searchResults.playlists.items[0].id,
  );

  let trackIds = playlist.items.map((item) => item.track.id);
  const audioFeatures = await spotifyWebApi.getAudioFeaturesForTracks(
    trackIds,
  );

  return audioFeatures.audio_features.map(
    (audio_feature) => {
      return {
        ...audio_feature,
      }
    }
  );;
}