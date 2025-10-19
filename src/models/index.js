/**
 * RPG Engine Models
 * Export all data structures for the RPG engine
 */

const Character = require('./Character');
const Skill = require('./Skill');
const Quest = require('./Quest');
const Item = require('./Item');
const Inventory = require('./Inventory');
const NPC = require('./NPC');

module.exports = {
  Character,
  Skill,
  Quest,
  Item,
  Inventory,
  NPC
};
