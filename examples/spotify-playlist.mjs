import { Mixer } from '../dist/index.js'
import { Request } from 'reqlib'; // https://npmjs.com/package/reqlib
import url from 'url';

let
  authData,
  authOpt = url.parse('https://accounts.spotify.com/api/token'),
  clientId = process.env['SPOTIFY_CLIENT_ID'], // https://developer.spotify.com
  plistData,
  plistOpt = url.parse('https://api.spotify.com/v1/playlists/6AvLNaeJ7qeF1Ur1kNoiXT/tracks'),
  req = new Request(),
  secret = process.env['SPOTIFY_CLIENT_SECRET'];

// create a Spotify API bearer token for subsequent requests
authOpt.headers = {
  'Authorization': ['Basic', Buffer.from([clientId, secret].join(':')).toString('base64')].join(' '),
  'Content-Type': 'application/x-www-form-urlencoded'
};
authData = await req.post(authOpt, 'grant_type=client_credentials');

// grab tracks from the Spotify API for a playlist
plistOpt.headers = {
  'Authorization': ['Bearer', authData['access_token']].join(' ')
};
plistOpt.query = {
  fields : 'items(track(album(name),artists(name),id,name,duration_ms,external_ids,external_urls))',
  market : 'US'
};
plistData = await req.get(plistOpt);

// create a mixer
const mixer = new Mixer({
  // randomize the tracks
  random: true,
  // separate tracks so that artists and tracks with the 
  // same name aren't repeated for at 5 occurrences within 
  // any mix generated
  separation: {
    artist: 5,
    name: 5
  },
  // the tracks to include in the mix
  tracks: [plistData.items]
});

// capture errors... (scenarios where the mix is not completed)
mixer.on('error', (err) => {
  console.error('error encountered: ', err.message);
});

// capture warnings... (rules broken in order to complete the mix)
mixer.on('warning', (message) => {
  console.log('warning encountered: ', warning);
});

// create a 4 hour mix starting now
const mix = mixer.mix({
  duration: 240, // 4 hours
  startDate: new Date()
});