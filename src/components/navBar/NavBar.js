import React from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Icon from '@iconify/react';
import spotifyIcon from '@iconify-icons/mdi/spotify';
import './NavBar.css'

class NavBar extends React.Component {
    constructor(props) {
      super(props);
    }

    login() {
        window.location.href = '/login'
    }

    logout() {
        const spotifyLogoutWindow = window.open("https://www.spotify.com/logout/", 'Spotify Logout', 'width=700,height=500,top=40,left=40')                                                                                                
        setTimeout(() => {
            spotifyLogoutWindow.close();
            window.location.href = "/"
        }, 1000)
    }

    render() {
        return (
            <div>
            <AppBar position='static'>
                <Toolbar>
                    <Icon width={40} icon={spotifyIcon} />
                    <Typography variant='h6' className='title'>
                        CS448B Project 4: Spotify Data Visualization
                    </Typography>
                    <Button onClick={() => this.props.logged_in  ? this.logout() : this.login() } color='inherit'>
                        { this.props.logged_in ? 'Logout' : 'Login' }
                    </Button>
                </Toolbar>
            </AppBar>
            </div>
        );
    }
}

export default NavBar;

