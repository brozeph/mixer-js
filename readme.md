# Mixer

Accepts a 

## models

### rule 

A rule is effectively a container for one or more `track` objects with additional information that instructs the mixer on how to create the resulting mix. 

```json
{
  "daytimes": {
    "days": [{
      "day": 0, 
      "begin": 0,
      "duration": 1440
    }, {
      "day": 1, 
      "begin": 0,
      "duration": 1440
    }, {
      "day": 2, 
      "begin": 0,
      "duration": 1440
    }, {
      "day": 3, 
      "begin": 0,
      "duration": 1440
    }, {
      "day": 4, 
      "begin": 0,
      "duration": 1440
    }, {
      "day": 5, 
      "begin": 0,
      "duration": 1440
    }, {
      "day": 6, 
      "begin": 0,
      "duration": 1440
    }],
  },
  "dates": {
    "begin": "",
    "end": ""
  },
  "separation": {
    "album": 1,
    "artist": 5,
    "name": 5
  },
  "title": "",
  "tracks": [

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
