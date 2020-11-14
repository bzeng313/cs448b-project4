import React from 'react';
import RadarChart from './radarChart.js'
import SearchPlaylistComponent from './SearchPlaylistComponent.js'
import './RadarChartComponent.css'

class RadarChartComponent extends React.Component {
  constructor(props) {
    super(props);

    this.spotifyWebApi = props.spotifyWebApi;

    this.state = {
        selectedSearchPlaylistData1: null,
        selectedSearchPlaylistData2: null
    };
  }

  componentDidMount() {
      this.componentDidUpdate(); //call once so radar chart is rendered first
  }

  componentDidUpdate() {
    var margin = {top: 100, right: 100, bottom: 100, left: 100},
    width = Math.min(700, window.innerWidth - 10) - margin.left - margin.right,
    height = Math.min(width, window.innerHeight - margin.top - margin.bottom - 20);

    var data = [];
    var playlistNames = [];
    if (this.state.selectedSearchPlaylistData1) {
        playlistNames.push(this.state.selectedSearchPlaylistData1.name);
        data.push(this.state.selectedSearchPlaylistData1.value);
    }
    if (this.state.selectedSearchPlaylistData2) {
        playlistNames.push(this.state.selectedSearchPlaylistData2.name);
        data.push(this.state.selectedSearchPlaylistData2.value);
    }
    if (data.length == 0) {
        data = [[]]
    }

    var radarChartOptions = {
        w: 400,
        h: 400,
        margin: margin,
        maxValue: 1,
        levels: 10
    };

    RadarChart("#radarChart", data, playlistNames, radarChartOptions);
  }

  render() {
    return (
        <div>
            <div id='radarChart'>
            </div>
            <div class='row' style={{backgroundColor: '#F8F8F8'}}>
                <div class="col-sm-6">
                    <SearchPlaylistComponent spotifyWebApi={this.spotifyWebApi} pushSelectedSearchPlaylistData={(data) => this.setState({selectedSearchPlaylistData1: data})}/>
                </div>
                <div class="col-sm-6">
                    <SearchPlaylistComponent spotifyWebApi={this.spotifyWebApi} pushSelectedSearchPlaylistData={(data) => this.setState({selectedSearchPlaylistData2: data})}/>
                </div>
            </div>
        </div>
    );
  }
}

export default RadarChartComponent;

