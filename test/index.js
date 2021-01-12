import { should } from 'chai';
import 'chai/register-should';
import fs, { read } from 'fs';
import Mixer from '../src/mixer';

describe('mixer-js', async () => {
  let 
    mockRules = [],
    playlist1Tracks = [],
    playlist2Tracks = [],
    playlist3Tracks = [];

  function readFile (filePath) {
    return new Promise((resolve, reject) => {
      let
        chunks = [], 
        reader = fs.createReadStream(filePath);

      reader.on('data', (chunk) => chunks.push(chunk));
      reader.on('end', () => {
        try {
          return resolve(JSON.parse(chunks.join('')));
        } catch (ex) {
          ex.message = `unable to parse ${filePath}: ${ex.message}`;
          return reject(ex);
        }
      });
      reader.on('error', reject);
    });
  }

  before(async () => {
    playlist1Tracks = await readFile('./test/tracks-creamy.json');
    playlist2Tracks = await readFile('./test/tracks-diplo-and-friends.json');
    playlist3Tracks = await readFile('./test/tracks-indie-pop.json');
  });
  
  beforeEach(() => {
    mockRules = [{
      name : 'Creamy Playlist',
      tracks : playlist1Tracks
    }, {
      name : 'Diplo and Friends Radio Playlist',
      tracks : playlist2Tracks
    }, {
      name : 'Indie Pop Playlist',
      tracks : playlist3Tracks
    }];
  });

  describe('#init()', async () => {
    it('should require rules', () => {
      (() => {
        let mixer = new Mixer();
      }).should.throw('rules are required');
    });

    it('should require tracks for each rule', () => {
      (() => {
        mockRules[0].tracks = null;
        let mixer = new Mixer(mockRules);
      }).should.throw('tracks are not specified', 'null tracks should throw');

      (() => {
        mockRules[0].tracks = [];
        let mixer = new Mixer(mockRules);
      }).should.throw('tracks are not specified', 'an empty Array of tracks should throw');
    });

    it('should convert a single rules object to an Array', () => {
      let mixer = new Mixer(mockRules[0]);
      mixer.rules.should.be.an('array').with.lengthOf(1);
    });
  });
});