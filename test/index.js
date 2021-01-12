import 'chai/register-should';
import fs, { read } from 'fs';
import Mixer from '../src/mixer';

describe('mixer-js', async () => {
  let 
    mockRules = [{
      tracks : []
    }],
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

  });

  describe('#init()', async () => {
    it('should require rules', () => {
      (() => {
        let mixer = new Mixer();
      }).should.throw('rules are required');
    });

    it('should convert a single rules object to an Array', () => {
      let mixer = new Mixer(mockRules);
    });
  });
});