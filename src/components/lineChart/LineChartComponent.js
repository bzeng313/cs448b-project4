import React, { useEffect, useRef, useState } from 'react';
import * as d3 from "d3";

export default function LineChartComponent({
    spotifyWebApi
}) {
    useEffect(() => {
        var margin = {top: 80, right: 100, bottom: 100, left: 50},
        width = 460 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

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
          .style("font-size", 14)
          .text("Dimensions over Time");
        
        // x axis label
        svg.append("text")
          .attr("transform", `translate(${width / 2}, ${height + 35})`)
          .style("text-anchor", "middle")
          .style("font-size", 11)
          .text("Year");            

        // y axis label
        svg.append("text")
          .attr("id", "y-axis-label")
          .attr("transform", "rotate(-90)")
          .attr("y", 0 - margin.left)
          .attr("x", 0 - (height / 2))
          .attr("dy", "1em")
          .style("text-anchor", "middle")
          .style("font-size", 11)
          .text('valence');

        let dimensions = ["valence", "danceability", "acousticness", "energy", "instrumentalness", "liveness", "speechiness"]
        d3.select("#selectButton")
              .selectAll('myOptions')
             	.data(dimensions)
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
    
        calculateTop50Data(spotifyWebApi, 'valence').then((results) => {                
            console.log(results);
            console.log(results.length);

            let line = svg.append('g')
                          .append('path')
                          .datum(results)
                          .attr('d', d3.line()
                          .x(d => x(d['year']))
                          .y(d => y(d['avg']))
                          )
                          .attr('stroke', function(d) {
                              return myColor('acousticness')
                          })
                          .style('stroke-width', 4)
                          .style('fill', 'none')
        // A function that update the chart
        function update(selectedGroup) {
            calculateTop50Data(spotifyWebApi, selectedGroup).then((results) => {                
                d3.selectAll('#y-axis-label').text(selectedGroup);

                line
                .datum(results)
                .transition()
                .duration(1000)
                .attr("d", d3.line()
                          .x(d => x(d['year']))
                          .y(d => y(d['avg']))
                )
                .attr("stroke", function(d){ return myColor(selectedGroup) })
            })
            
          // Give these new data to update line

        }
        // When the button is changed, run the updateChart function
        d3.select("#selectButton").on("change", function(d) {
            // recover the option that has been chosen
            var selectedOption = d3.select(this).property("value")
            // run the updateChart function with this selected option
            update(selectedOption)
        })
        })
    }, [spotifyWebApi])


    return (
        <div>
            <script src="https://d3js.org/d3-scale-chromatic.v1.min.js"></script>
            <div id="my_dataviz"></div>
            <select id="selectButton"></select>
        </div>
    )
}

async function calculateTop50Data(spotifyWebApi, dimension) {
    let dim_across_years = [];

    for (let i = 2000; i <= 2020; i++) {
        await getTop50Tracks(spotifyWebApi, i).then(function(results) {           
            let running_sum = 0
            for (var j = 0; j < results.length; j++) {
                running_sum += results[j][dimension];
            }
            let yearToAvg = {'year': i, 'avg': running_sum / results.length}
            dim_across_years.push(yearToAvg); 
        })
    }
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