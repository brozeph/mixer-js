# Mixer

This library creates a mix of content based on provided mixing instructions and track details.

## usage 

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
let mixer = new Mixer({
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

### constructor

The constructor for a mixer accepts either a single object [rule](#rule) or an Array of [rule](#rule) objects. When an Array of rule objects are provided, multiple lists of tracks can be mixed together and additional broadcast mixing features, such as dayparting (<https://en.wikipedia.org/wiki/Dayparting>), can be used. To learn more about rules, see [rule](#rule) below in the [models](#models) portion of the documentation. 

```javascript
import { Mixer } from 'mixer';

let rules = [ /* Array of rule objects */ ];

let mixer = new Mixer(rules);
```

### #mix()

Once a `Mixer` instance has been created with one or more [rules](#rule) that contain [tracks](#track), a mix (broadcast) can be generated for a specified [timeperiod](#timeperiod) (an object with fields for `duration` and `startDate`). 

```javascript
import { Mixer } from 'mixer';

let mixer = new Mixer([ /* Array of rule objects */ ]);

let broadcast = mixer.mix({
  duration : 1440, // for the next 24 hours
  startDate : new Date() // starting now
});
```

If no [timeperiod](#timeperiod) object is provided, a default time period is created for a duration of 120 minutes beginning now.

```javascript
// the default timeperiod used if one isn't specified
let timeperiod = {
  duration: 120,
  startDate: new Date()
}
```

## models

### rule 

A rule is effectively a container for one or more `track` objects with additional information that instructs the mixer on how to create the resulting mix. There are numerous fields on the rule that are optional and that have default values that will provided when not implicitly set.

* `dayparts` (Array, optional) ... Provides support for dayparting (<https://en.wikipedia.org/wiki/Dayparting>) in the broadcast mix. See [dayparts](#dayparts) below for additional information - there are shorthand forms for each [daypart](#dayparts) object to simplify usage. 
* `eligibleDates` (optional, Object) ... If a list of tracks should only be included into the mix on a certain range of dates (for example, Christmas music during the Christmas season, etc.), this setting can be used.
* `random` : `true` (Boolean, optional) ... Defines whether tracks should be plucked from the Array of tracks randomly or in sequence order at each loop of rule evaluation.
* `separation` (Object, optional) ... Defines threshholds for separation of content in the resulting broadcast mix (for example, artist separation for when you don't want 5 back-to-back Taylor Swift songs in your mix, or name separation when you don't want multiple back-to-back renditions of Jingle Bells on Christmas).
* `title` : "" (string, optional) ... an optional metadata field that allows one to distinguish one rule object from another
* `tracks` (Array, required) ... an Array containing one or more tracks to include in the mix with the specified rules

```javascript
{
  // optional: specify the days and times when the tracks can 
  // be included... when not provided, all days and times are 
  // eligible
  "dayparts": [{
    "beginOffset": 0,
    "duration": 1440,
    "weekdays": [0, 1, 2, 3, 4, 5, 6]
  }],
  // optional: specify the dates when the tracks can be 
  // included when not provided, all dates are eligibile
  "eligibleDates": {
    "beginDate": new Date("2021-01-01T00:00:00.000Z"),
    "endDate": new Date("2021-12-31T23:59:59.999Z")
  },
  // optional: defines the minimum number of tracks to schedule
  // from this rule before scheduling from another rule when
  // multiple rules are provided to the mixer
  "podding": 1,
  // optional: set to `true` for random, `false` for 
  // sequential... when not provided, `true` is default
  "random": true,
  // optional: when not provided, defaults are as follows (see
  // separation documentation for more detail)
  "separation": {
    "albumDuration": 0,
    "albumTrack": 0,
    "artistDuration": 0,
    "artistTrack": 5,
    "nameDuration": 0,
    "nameTrack": 5,
    "ruleDuration": 0,
    "ruleTrack": 0
  },
  // optional: title to help distinguish multiple rules
  // from eachother 
  "title": "", 
  // required: tracks must be provided
  "tracks": [
    /* list of tracks: see `track` model below */
  ]
}
```

#### dayparts

The `dayparts` property of the [rule](#rule) contains an Array of `daypart` objects for each weekday. If `dayparts` aren't specified within the [rule](#rule), then no dayparting is assumed for the tracks... they can be included into the mix for any time of day, and on any day of the week. Each `daypart` contains the following 3 fields:

* `beginOffset` : `0` (Number, optional) ... In minutes, this is the offset of time from the start of the day (midnight) for the part to begin. When not specified, `0` is used to denote midnight.
* `duration` : `1440` (Number, optional) ... In minutes, this is the duration of the daypart for the specified weekday. When not specified, `1440` (24 hours) is used to cover the entire day.
* `weekdays` : `[0, 1, 2, 3, 4, 5, 6 ]` (Array | Number, optional) ... The day of the week for the part (0 is `Sunday`). When not provided, the entire week is used as a default value.

#### eligibleDates



#### podding

The podding property of the [rule](#rule) enables multiple tracks to be scheduled from the rule before scheduling tracks from another rule when multiple rules are provided to the mixer. If only one rule is provided, this field is ignored. This feature is handy when the desired outcome is to have 20% of the content come from one set of tracks and 80% to come from another. For example, if 2 rules were provided, rule 1 could be configured with a podding value of `2` and the second rule with a podding value of `8` and the resultant mix would have 2 tracks from rule 1 followed by 8 tracks from rule 2 repeating for the duration of the mix (as specified in the [timeperiod](#timeperiod)).

#### separation

The separation property of the [rule](#rule) allows for a mix to be created where number of other tracks or a time duration threshhold must be met before repeating a track, artist or album. Separation can apply to tracks individually or to all tracks for a rule (i.e. other rule separation). Please note that album, artist and name separation span across all rules that are provided. For example, if there are multiple tracks by the same artist name contained within each rule of a multiple rule mix, artist name separation will apply globally across all of the rules for the mix.

* `albumDuration` : 0 (Number, optional) ... Schedule at least the provided duration (in minutes) of content from a different album before adding another track from this album (i.e. with the same name) into the mix
* `albumTrack` : 0 (Number, optional) ... Schedule at least the provided number of tracks from a different album before adding another track from this album (i.e. with the same name) into the mix
* `artistDuration` : 0 (Number, optional) ... Schedule at least the provided duration (in minutes) of content from a different album before adding another track from this artist (i.e. with the same name) into the mix
* `artistTrack` : 5 (Number, optional) ... Schedule at least the provided number of tracks from a different artist before adding another track from this artist (i.e. with the same name) into the mix
* `nameDuration` : 0 (Number, optional) ... Schedule at least the provided duration (in minutes) of content with a different track name before adding another track with this track name into the mix
* `nameTrack` : 5 (Number, optional) ... Schedule at least the provided number of tracks from a different track name before adding another track with this track name into the mix
* `ruleDuration` : 0 (Number, optional) ... Schedule at least the provided duration (in minutes) of content from other rules before scheduling another track from this rule
* `ruleTrack` : 0 (Number, optional) ... Schedule at least the provided number of tracks from a different rule before adding another track from this rule into the mix

#### title

This optional property can be used to distinguish rules from eachother when multiple rules are specified.

#### tracks

This is a required Array of [track](#track) items that will be mixed.

### timeperiod

This object specifies a time period for which a broadcast mix should be generated. This is a simple object that contains two fields, the `startDate` and the `duration` for the period as measured in minutes.

```json
{
  "duration": "1440",
  "startDate": "2021-01-01T00:00:00.000Z"
}
```

### track

This object is modeled directly from the Spotify API response for Tracks (<https://developer.spotify.com/documentation/web-api/reference/tracks/>). A Spotify API response for tracks can be provided directly, but the only required fields are as follows:

* `artists` - can either be an `Array` of Artist objects (as defined in the Spotify API response), or a single string value with the artist's name
* `duration_ms` - necessary for all duration components of the mixing process, including overall mix duration, dayparting and time separation rules
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
  dayparts: [{
    weekdays: [0, 6]
  }],
  random: true,
  tracks: [ /* tracks */ ]
});

// create a rule to play sequentially from a list of tracks every day from noon to 1pm
rules.push({
  dayparts: [{
    beginOffset: 720
    duration: 60
  }],
  random: false,
  tracks: [ /* tracks */ ]
});

// create a rule to play 
rules.push({

})
```