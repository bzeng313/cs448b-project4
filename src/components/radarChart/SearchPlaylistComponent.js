import React from 'react';
import imageNotFound from './image-not-found.png'
import './SearchPlaylistComponent.css'

class SearchPlaylistComponent extends React.Component {
  constructor(props) {
    super(props);

    this.spotifyWebApi = props.spotifyWebApi;

    this.state = {
        playlistsFromSpotify: [],
        searchFromSpotifyQuery: '',
        selectedPlaylist: null
    };

    this.handleSearchFromSpotifyQueryChange = this.handleSearchFromSpotifyQueryChange.bind(this);
    this.handleSearchFromSpotifySubmission = this.handleSearchFromSpotifySubmission.bind(this);
  }

  handleSearchFromSpotifyQueryChange(event) {
    this.setState({ searchFromSpotifyQuery: event.target.value });
  }

  handleSearchFromSpotifySubmission(event) {
      this.setState({ searchFromSpotifyQuery: event.target.value });

      if (event.target.value === '') {
          this.setState({ playlistsFromSpotify: [] });
          return;
      } 
      this.spotifyWebApi.search(
        event.target.value, //search for all results matching top 50
        ['playlist'], //filter results to only playlists
        (err, response) => {
            if (err) {
                console.log(err);
                return;
            }
            this.setState({ playlistsFromSpotify: response.playlists.items });
        }
      )
  }

  renderRadarChartForPlaylist(playlist) {
    this.spotifyWebApi.getPlaylistTracks(
        playlist.id,
        (err, response) => {
            if (err) {
                console.log(err);
                return;
            }

            console.log(response.items)
            let trackIds = response.items.filter((item) => item.track !== null).map( (item) => item.track.id );
            
            this.spotifyWebApi.getAudioFeaturesForTracks(
                trackIds,
                (err, response) => {
                    if (err) {
                        console.log(err);
                        return;
                    }
                    let averagePlaylistData = {
                        acousticness: 0.0,
                        danceability: 0.0,
                        energy: 0.0,
                        instrumentalness: 0.0,
                        liveness: 0.0,
                        speechiness: 0.0,
                        valence: 0.0
                    }

                    let totalTracks = 0; // some tracks in the playlist aren't songs, so we need to keep track of a seperate counter
                    response.audio_features.forEach(
                        (audio_features_for_track) => {
                            if (!audio_features_for_track) return; // if not a song
                            for (const feature in averagePlaylistData) {
                                averagePlaylistData[feature] += audio_features_for_track[feature];
                            }
                            totalTracks += 1;
                        }
                    )
                    let averagePlaylistDataForRadarGraph = [];
                    for (const feature in averagePlaylistData) {
                        averagePlaylistDataForRadarGraph.push({axis: feature, value: averagePlaylistData[feature] /= totalTracks});
                    }
                    this.props.pushSelectedSearchPlaylistData({name: playlist.name, value: averagePlaylistDataForRadarGraph});
                }
            )
        }        
    )
  }

  renderSelection() {
    if (!this.state.selectedPlaylist) return (<div style={{marginBottom: "5px", marginTop: "10px"}} />);

    return (
        <div style={{marginBottom: "5px", marginTop: "10px"}}>
            {"Selected Playlist:  "}
            <span><img width='32' height='32' src={this.state.selectedPlaylist.images.length === 0 ? imageNotFound : this.state.selectedPlaylist.images[0].url} /><span>{"  " + this.state.selectedPlaylist.name}</span></span>
        </div>
    );
  }

  renderSearchResultsPlaylists() {
      if (this.state.playlistsFromSpotify.length === 0) {
          return 'No matches for your search';
      }

      return this.state.playlistsFromSpotify.map((playlist) => {
        return (
            <div>
                <button style={{width:'300px', textAlign:'left'}} type='button' onClick={() => { this.renderRadarChartForPlaylist(playlist); this.setState({ selectedPlaylist: playlist }); } } >
                    <span><img width='32' height='32' src={playlist.images.length === 0 ? imageNotFound : playlist.images[0].url} /><span>{"  " + playlist.name}</span></span>
                </button>
            </div>
        );
      });

  }

  render() {
    return (
        <div>
            {this.renderSelection()}
            <div style={{marginBottom: "10px", marginTop: "5px"}}> 
                <form onSubmit={(event) => event.preventDefault()}>
                    <input placeholder='Search for playlist' type='text' value={this.state.searchFromSpotifyQuery} onChange={this.handleSearchFromSpotifySubmission} />
                </form>
            </div>
            <div class='scroll'>
                {this.renderSearchResultsPlaylists()}
            </div>
        </div>
    );
  }
}

export default SearchPlaylistComponent;

