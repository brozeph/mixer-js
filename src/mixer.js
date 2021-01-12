import { assert } from 'console';
import { EventEmitter } from 'events';

function validateRules (rules) {
  rules.forEach((rule, i) => {
    // tracks are required
    if (!rule.tracks || rule.tracks.length === 0) {
      throw new Error(`rule ${i} invalid: tracks are not specified`);
    }
  });

  return rules;
}

class Mixer extends EventEmitter {
  constructor (rules) {
   super();

   if (!rules) {
    throw new Error('rules are required');
   }

   // default rules value to Array
   if (!(rules instanceof Array)) {
     rules = [rules];
   }

   // validate each rule and assign to instance field
   this.rules = validateRules(rules);
  }

  async mix (timeframe) {

  }
}

module.exports = Mixer;