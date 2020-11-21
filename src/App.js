import React from 'react'
import NavBar from './components/navBar/NavBar.js'
import BoxplotComponent from './components/boxplot/BoxplotComponent.js'
import RadarChartComponent from './components/radarChart/RadarChartComponent.js'
import LineChartComponent from './components/lineChart/LineChartComponent.js'
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
        <h3> Spot Your Music Taste: Visualizing Spotify’s Top Tracks </h3>
        <p> Between blasting “WAP” and “SICKO MODE”, we might look back upon the 2000s and cringe at 
          the inspidity of the millenials. From “Oops...I did it again?” to “Bye bye bye”, the songs 
          from the beginning of the century seem starkly different from those of today. At first 
          glance (or listen?), our generations’ rap tracks, electronic dance music, and pop ballads 
          seem “innovative” and modern. The Backstreet Boys, Britney Spears, and Destiny’s Child, 
          though evoking nostalgia, are like ancient tunes from an old jukebox in comparison. 
          Our group sought to settle the question: Are our generations' music taste different from 
          those tuning in at the turn of the century? Has popular music evolved since the 2000s? 
          And if so, how? 
        </p>

        <p> To answer these questions, we leverage an API exposed by Spotify that provides a “musical 
          footprint” for any of its tracks. Each track is identified by a unique set of 7 audio features, 
          and each of these features is measured as a float from 0 to 1. These values are generated using 
          a proprietary algorithm that Spotify obtained as part of its acquisition of The Music Nest, an 
          AI music startup, in 2014. These features are defined as follows:
          <ul>
            <li>Acousticness - a measure of how lacking a track is of electrical amplification </li>
            <li>Danceability - a measure of how suitable a track is for dancing (e.g., consistent rhythm) </li>
            <li> Energy - a measure of how intense and active a track is (usually fast and noisy) </li>
            <li>Instrumentalness - a measure of how much the track contains no vocals (just like an instrumental track for karaoke) </li>
            <li>Liveness - a measure of how likely an audience is present in the track </li>
            <li>Speechiness - a measure of the dominance of spoken words in the track (rap and podcasts would likely rank higher) </li>
            <li>Valence - a measure of musical positivity in a track (happy and cheerful closer to 1, sad and depressed closer to 0) </li>
          </ul>
        </p>
        <p>In the visualization below, we charted several audio features from the top 50 global hits for 
          each year between 2000 and 2020. To our surprise, none of the audio features have seen significant 
          changes throughout the past twenty years. Contrary to intuition, it seems that the chart-topping 
          tunes of today, at least in aggregate, do not differ from those from the 2000s. Don’t believe us? 
          Check out the visualization below:
        </p>
        <LineChartComponent spotifyWebApi={this.spotifyWebApi} />
        <p> While it might be disappointing to know that we are playing a similar mix of acoustic, danceable, 
        energetic, and instrumental tunes through our AirPods as our parents did in their Toyota Camry radio, 
        perhaps this is a silver lining. If music tastes are consistent across generations, you might just be 
        able to get everyone from your avuncular relatives and your kindergarten-age cousins jamming out to 
        today’s top tracks. Try it (post-COVID) at the next family gathering!
        </p>
        <p> After these findings, our group wondered: are music tastes the same across countries as well? 
          To investigate, we pulled from Spotify the current top 50 songs across 5 countries: United States, 
          France, Mexico, Japan, and South Korea. From K-pop to reggaeton, the multi-lingual music at the 
          reviously global-scale are now plotted according to country:
        </p>
        <BoxplotComponent spotifyWebApi={this.spotifyWebApi} />
        <p> Flipping through the different audio features, we noted some interesting differences. Japan 
          and Korea do not seem to appreciate “speechy” music: songs with a preponderance of spoken words. 
          Does that make it tough for a budding rap artist to make their big break there? Try it out and let 
          us know! South Korea seems to have the most energetic and lively music scene, while France has the 
          most danceable (based on median values). Mexico seems to prefer major key (high valence) music 
          more than the other four countries (again, based on median values). Some music preferences, 
          however, transcend country borders. None of the five countries (at the time of writing) appreciate 
          instrumental music.
        </p>
        <p> One final fun fact. If it’s still 2020 when you’re reading this, you might find some unusually 
          un-danceable songs in the US Top 50. Wonder why? Try hovering over the outliers on the boxplots. 
          You’ll find some Christmas tunes there!
        </p>
        <p> So far, we have explored a macrocosmic approach, exploring music tastes at the country and 
          decade level. Yet, changes in musical taste can also happen (quite starkly!) at the individual 
          level, too. These changes are often encoded in playlists, which users create to self-cluster 
          the music of a particular chapter of their lives. In the visualization below, users can compare 
          any two of their playlists to discover similarities and differences. 
          </p>
        <RadarChartComponent spotifyWebApi={this.spotifyWebApi} />
        <p> By taking the average of each feature for every track in a playlist, we can generate a 7 point 
        fingerprint for that playlist. The visualization above allows users to search for two playlists, 
        plot their fingerprints on a radar chart, and compare how similar the two playlists are to each other. 
        As an example, let us compare the playlists “Classical Essentials” and “Beethoven Relax.” As one might 
        expect, these playlists share similarly shaped fingerprints, sharing the high acousticness, high 
        instrumentallness, and low speechiness common to classical  music. Users may also search for their 
        own playlists if they are logged into their Spotify account. This allows users to discover what features
        they value in music, and as a byproduct, search for playlists similar to their own that they may add 
        to their collection. Try it for yourself and see what interesting things you discover about your musical tastes!
        </p>
      </div>
    );
  }
}

export default App;
