import 'chai/register-should';
import Mixer from '../src/mixer';

describe('mixer-js', async () => {
  const 
    mockRules = [{
      tracks : []
    }],
    mockTracks = [];
  
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