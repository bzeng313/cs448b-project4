import React from 'react'
import NavBar from './components/navBar/NavBar.js'
import BoxplotComponent from './components/boxplot/BoxplotComponent.js'
import RadarChartComponent from './components/radarChart/RadarChartComponent.js'
import SpotifyWebApi from 'spotify-web-api-js';
import './App.css';

class App extends React.Component {
  /**
   * 
   * @param {*} props 
   */
  constructor(props) {
    super(props);
    const params = this.getHashParams();
    const access_token = params.access_token;
    this.spotifyWebApi = new SpotifyWebApi();
    if (access_token) {
      this.spotifyWebApi.setAccessToken(access_token);
    }
    this.logged_in = access_token ? true : false;
    
  }

  /**
   * Code taken from 
   * https://github.com/jonnyk20/spotify-node-react-starter-kit/blob/master/client/src/App.js
   */
  getHashParams() {
    var hashParams = {};
    var e, r = /([^&;=]+)=?([^&;]*)/g,
        q = window.location.hash.substring(1);
    e = r.exec(q)
    while (e) {
       hashParams[e[1]] = decodeURIComponent(e[2]);
       e = r.exec(q);
    }
    return hashParams;
  }

  render() {
    return (
      <div className="App">
        <NavBar logged_in={this.logged_in}/>
        <BoxplotComponent spotifyWebApi={this.spotifyWebApi} />
        <RadarChartComponent spotifyWebApi={this.spotifyWebApi} />
      </div>
    );
  }
}

export default App;
