import { EventEmitter } from 'events';

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

   // assign property
   this.rules = rules;
  }

  async mix (timeframe) {

  }
}

module.exports = Mixer;