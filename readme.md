# Mixer

This library creates a mix of content based on provided mixing instructions and track details.

## usage 

### #mix()

```javascript
import { Mixer } from 'mixer';
import { Request } from 'reqlib'; // https://npmjs.com/package/reqlib
import url from 'url';

let
  authRequestOptions = url.parse('https://accounts.spotify.com/api/token'),
  clientId = '<Spotify client_id>', // https://developer.spotify.com
  playlistRequestOptions = url.parse('https://api.spotify.com/v1/playlists/6AvLNaeJ7qeF1Ur1kNoiXT/tracks'),
  playlistTrackItems,
  req = new Request(),
  secret = '<Spotify client secret>',
  token;

// create a Spotify API bearer token for subsequent requests
authRequestOptions.headers = {
  'Authorization': ['Basic', Buffer.from([clientId, secret].join(':')).toString('base64')].join(' '),
  'Content-Type': 'application/x-www-form-urlencoded'
};
token = await req.post(authRequestOptions, 'grant_type=client_credentials');

// grab tracks from the Spotify API for a playlist
playlistRequestOptions.headers = {
  'Authorization': ['Bearer', token['access_token']].join(' ')
};
playlistRequestOptions.query = {
  fields : 'items(track(album(name),artists(name),id,name,duration_ms,external_ids,external_urls))',
  market : 'US'
};
playlistTrackItems = await req.get(playlistRequestOptions);

// create the Mixer
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
  // the tracks to include in the mix (from the Spotify playlist)
  tracks: plistData.items
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
let mix = mixer.mix({
  duration: 240, // 4 hours
  startDate: new Date()
});

console.log(mix);
```

## models

### rule 

A rule is effectively a container for one or more `track` objects with additional information that instructs the mixer on how to create the resulting mix. 

```javascript
{
  // optional: specify the days and times when the tracks can 
  // be included... when not provided, all days and times are 
  // eligible
  "eligibleDates": {
    "days": [{
      "day": 0, 
      "beginOffset": 0,
      "duration": 1440
    }, {
      "day": 1, 
      "beginOffset": 0,
      "duration": 1440
    }, {
      "day": 2, 
      "beginOffset": 0,
      "duration": 1440
    }, {
      "day": 3, 
      "beginOffset": 0,
      "duration": 1440
    }, {
      "day": 4, 
      "beginOffset": 0,
      "duration": 1440
    }, {
      "day": 5, 
      "beginOffset": 0,
      "duration": 1440
    }, {
      "day": 6, 
      "beginOffset": 0,
      "duration": 1440
    }],
  },
  // optional: specify the dates when the tracks can be 
  // included when not provided, all dates are eligibile
  "eligibleDates": {
    "beginDate": new Date("2021-01-01T00:00:00.000Z"),
    "endDate": new Date("2021-12-31T23:59:59.999Z")
  },
  // optional: set to `true` for random, `false` for 
  // sequential... when not provided, `true` is default
  "random": true,
  "separation": {
    "album": 1,
    "artist": 5,
    "name": 5
  },
  "title": "", // optional title to separate 
  "tracks": [
    /* list of tracks: see `track` model below */
  ]
}
```

### track

This object is modeled directly from the Spotify API response for Tracks (<https://developer.spotify.com/documentation/web-api/reference/tracks/>). A Spotify API response for tracks can be provided directly, but the only requirements are as follows:

* `artists` - can either be an `Array` of Artist objects (as defined in the Spotify API response), or a single string value with the artist's name
* `duration_ms` - is required for day part and time separation rules
* `name` - the name of the track

If more meta data or fields are provided for the track object, they are not modified or removed by the mixer (__note: if the track objects are large, and there are many tracks provided, the mixer will consume more memory in the process__).

An example `track` object (__note: `external_ids`, `external_urls` and `id` fields provided only to demonstrate the track came from the Spotify API response, and they are not required__):

```json
{
  "album": {
    "name": "Cut To The Feeling"
  },
  "artists": [{
    "name": "Carly Rae Jepsen"
  }],
  "duration_ms": 207959,
  "external_ids": {
    "isrc": "USUM71703861"
  },
  "external_urls": {
    "spotify": "https://open.spotify.com/track/11dFghVXANMlKmJXsNCbNl"
  },
  "id": "11dFghVXANMlKmJXsNCbNl",
  "name": "Cut To The Feeling"
}
```

## examples

### multiple rules together

```javascript
import { Mixer } from 'mixer';

let
  mix,
  rules = [];

// create a rule to play randomly from a list of tracks all day Saturday and Sunday
rules.push({
  daytimes: [{
    day: [0, 6]
  }],
  random: true,
  tracks: [{

  }]
});

// create a rule to play sequentially from a list of tracks every day from noon to 1pm
rules.push({
  daytimes: [{
    day: [0, 1, 2, 3, 4, 5, 6],
    beginOffset: 720
    duration: 60
  }],
  random: false,
  tracks: [{
    
  }]
});

// create a rule to play 
rules.push({

})
```