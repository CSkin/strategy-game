/* jshint loopfunc: true */

var mapImage = { backgroundImage: "url('maps/level2.png')" };

var mapPlan = [
  ' - - - - - - - - - - - - - - - - ',
  ' - - - - - - - - - - - - - - - - ',
  ' - - - - - - - - - - - - - - - - ',
  ' - - - - - - - - - - - - - - - - ',
  ' - - - - - - - - - - - - - - - - ',
  ' - - - - - - - - - - - - - - - - ',
  ' - - - - S b a a a a a a - - - - ',
  ' - - - - b s s p p s s a - - - - ',
  ' - - - - a s s p p s s b - - - - ',
  ' - - - - a a a a a a b S - - - - ',
  ' - - - - - - - - - - - - - - - - ',
  ' - - - - - - - - - - - - - - - - ',
  ' - - - - - - - - - - - - - - - - ',
  ' - - - - - - - - - - - - - - - - ',
  ' - - - - - - - - - - - - - - - - ',
  ' - - - - - - - - - - - - - - - - ',
];

var topoPlan = [
  ' 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 ',
  ' 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 ',
  ' 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 ',
  ' 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 ',
  ' 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 ',
  ' 1 1 1 1 1 1 1 2 2 1 1 1 1 1 1 1 ',
  ' 1 1 1 1 1 1 2 3 3 2 1 1 1 1 1 1 ',
  ' 1 1 1 1 1 0 0 4 4 0 0 1 1 1 1 1 ',
  ' 1 1 1 1 1 0 0 4 4 0 0 1 1 1 1 1 ',
  ' 1 1 1 1 1 1 2 3 3 2 1 1 1 1 1 1 ',
  ' 1 1 1 1 1 1 1 2 2 1 1 1 1 1 1 1 ',
  ' 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 ',
  ' 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 ',
  ' 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 ',
  ' 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 ',
  ' 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 ',
];

class Terrain {
  constructor(type, cost, cover, effects, height, shape) {
    this.type = type;
    this.name = capitalize(type);
    this.cost = cost;
    this.cover = cover;
    this.effects = effects;
    if (height) {
      this.height = height;
      this.shape = shape;
    } else {
      this.height = 0;
      this.shape = null;
    }
    this.facing = null;
    this.elevation = null;
  }
}

class Barren extends Terrain {
  constructor() {
    super('barren', 99, 0, null);
  }
}

class Ground extends Terrain {
  constructor() {
    super('ground', 1, 0, null);
  }
}

class Sand extends Terrain {
  constructor() {
    super('sand', 2, 0, null);
  }
}

class Grass extends Terrain {
  constructor() {
    super('grass', 1, 0, null);
  }
}

class Brush extends Terrain {
  constructor() {
    super('brush', 2, 1, null, 1, 'circle');
  }
}

class Boulder extends Terrain {
  constructor() {
    super('boulder', 99, 0, null, 2, 'circle');
  }
}

class Log extends Terrain {
  constructor() {
    super('log', 1, 2, null);
  }
}

class Plateau extends Terrain {
  constructor() {
    super('plateau', 1, 0, null);
  }
}

class Silversword extends Terrain {
  constructor() {
    super('silversword', 2, 0, { restoreHealth: 1 }, 1, 'circle');
  }
}

class Space {
  constructor(posY, posX, terrain) {
    this.posY = posY;
    this.posX = posX;
    this.terrain = terrain;
    this.unit = null;
    this.unit2 = null;
    this.moves = null;
    this.path = null;
    this.distance = null;
    this.items = [];
  }
  get posZ() { return (this.terrain.elevation + this.terrain.height) / 2 }
}

class Item {
  constructor(index, id, icon, name, descrip, effects, footprint, slot) {
    this.index = index;
    this.id = id;
    this.sprite = 'sprites/' + id.replace(/\d/, '') + '.png';
    this.icon = 'sprites/' + icon + '-icon.png';
    this.name = name;
    this.descrip = descrip;
    this.effects = effects;
    this.footprint = footprint;
    if (footprint.length === 1) {
      this.sprites = [this.sprite];
    } else {
      var n, sprites = [];
      for (n = 0; n < footprint.length; n++) {
        sprites.push('sprites/' + id.replace(/\d/, '') + footprint[n] + '.png');
      }
      this.sprites = sprites;
    }
    if (!slot) { slot = 0 }
    this.slots = footprint.map( toe => toe + slot );
  }
}

class Weapon extends Item {
  constructor(index, id, icon, name, descrip, effects, footprint, slot) {
    super(index, id, icon, name, descrip, effects, footprint, slot);
    this.itemType = 'weapon';
    this.equipped = false;
    this.usable = false;
  }
}

class Melee extends Weapon {
  constructor(index, id, icon, name, descrip, power, effects, footprint, slot) {
    super(index, id, icon, name, descrip, effects, footprint, slot);
    this.type = 'melee';
    this.power = power;
    this.range = [1, 1];
  }
}

class Throwing extends Weapon {
  constructor(index, id, icon, name, descrip, power, range, effects, footprint, slot) {
    super(index, id, icon, name, descrip, effects, footprint, slot);
    this.type = 'throwing';
    this.power = power;
    this.range = [1, range];
  }
}

class Ranged extends Weapon {
  constructor(index, id, icon, name, descrip, power, range, effects, footprint, slot) {
    super(index, id, icon, name, descrip, effects, footprint, slot);
    this.type = 'ranged';
    this.power = power;
    this.range = [2, range];
  }
}

class Clothing extends Item {
  constructor(index, id, icon, name, descrip, armor, effects, footprint, slot) {
    super(index, id, icon, name, descrip, effects, footprint, slot);
    this.itemType = 'clothing';
    this.armor = armor;
    this.usable = false;
  }
}

class Accessory extends Item {
  constructor(index, id, icon, name, descrip, usable, effects, footprint, slot) {
    super(index, id, icon, name, descrip, effects, footprint, slot);
    this.itemType = 'accessory';
    this.usable = usable;
  }
}

class Unarmed extends Melee {
  constructor() {
    super(1, 'unarmed', 'fist', '--', '--', 0, null, [0]);
  }
}

class Stick extends Melee {
  constructor(id, slot) {
    super(2, id, 'club', 'Heavy Stick', 'An unusually heavy stick.', 2, null, [0, 2]);
  }
}

class Stones extends Throwing {
  constructor(id, slot) {
    super(3, id, 'stones', 'Stones', 'The original projectile weapon.', 1, 1, null, [0]);
  }
}

class Slingshot extends Ranged {
  constructor(id, slot) {
    super(4, id, 'bow', 'Slingshot', 'Packs a sting, fits in a pocket.', 1, 3, null, [0]);
  }
}

class ShortBow extends Ranged {
  constructor(id, slot) {
    super(5, id, 'bow', 'Short Bow', 'This compact bow is powerful for its size.', 2, 4, null, [0, 2]);
  }
}

class Tunic extends Clothing {
  constructor(id, slot) {
    super(6, id, 'shirt', 'Tunic', 'Comfy and easy to wear.', 1, null, [0]);
  }
}

class Boots extends Clothing {
  constructor(id, slot) {
    super(7, id, 'footwear', 'Boots', "Made for walking.", 0, { movement: 1 }, [0]);
  }
}

class Salve extends Accessory {
  constructor(id, slot) {
    super(8, id, 'salve', 'Salve', 'Heals most any wound.', true, { restoreHealth: 2 }, [0]);
  }
}

var stick1 = new Stick('stick1'),
    stones1 = new Stones('stones1'),
    stones2 = new Stones('stones2'),
    slingshot1 = new Slingshot('slingshot1'),
    shortbow1 = new ShortBow('shortbow1'),
    tunic1 = new Tunic('tunic1'),
    boots1 = new Boots('boots1'),
    salve1 = new Salve('salve1');

var itemPlan = [
  {
    posY: 9,
    posX: 4,
    items: [stick1, stones1, slingshot1, shortbow1, tunic1, boots1, salve1]
  }
];

class Unit {
  constructor(id, faction, name, strength, melee, throwing, ranged, agility, toughness, movement, items, posY, posX, friendly, control, behavior) {
    // basic info
    this.id = id;
    this.faction = faction;
    this.sprite = 'sprites/' + id.replace(/\d/, '') + '.png';
    this.name = name;
    // core attributes
    this.hp = 3;
    this.strength = strength;
    this.melee = melee;
    this.throwing = throwing;
    this.ranged = ranged;
    this.agility = agility;
    this.toughness = toughness;
    this.movement = movement;
    // items
    this.items = items;
    if (items.length && items[0].itemType === 'weapon') { this.items[0].equipped = true; }
    // inner workings
    this.impaired = [];
    this.movesUsed = 0;
    this.attacksPerTurn = 1;
    this.attacksUsed = 0;
    this.posY = posY;
    this.posX = posX;
    this.moving = null;
    this.path = null;
    this.friendly = friendly;
    this.control = control;
    if (behavior) { this.behavior = behavior }
    // methods
    this.getFx = function (attr) {
      return this.items
        .filter( i => i.effects && i.effects.hasOwnProperty(attr) && !i.usable )
        .reduce( (a, b) => a + b.effects[attr] , 0 );
    };
    this.getImp = function (attr) {
      var attr1 = attr, attr2 = attr;
      if (attr === 'melee' || attr === 'throwing' || attr === 'ranged') { attr1 = 'skill' }
      return Math.floor(this.impaired
        .map(function(i){ if (i === attr1) { return this[attr2] / 2 } else { return 0 } }, this)
        .reduce( (a, b) => a - b , 0 ));
    };
    this.resetActionPoints = function () {
      this.movesUsed = 0;
      this.attacksUsed = 0;
    };
    this.findItemIndex = function (id) {
      return this.items.indexOf(this.items.filter( i => i.id === id )[0]);
    };
    this.equipWeapon = function (id) {
      for (var item of this.items) {
        if (item.itemType === 'weapon') { item.equipped = false }
      }
      this.items[this.findItemIndex(id)].equipped = true;
    };
    this.useItem = function (id) {
      var item = this.items.splice(this.findItemIndex(id), 1)[0];
      for (var effect in item.effects) {
        switch (typeof(this[effect])) {
          case 'number': this[effect] += item.effects[effect]; break;
          case 'function': this[effect](item.effects[effect]); break;
        }
      }
    };
    this.sustainDamage = function (damage) {
      while (damage > 0) {
        if (this.hp > 0) {
          this.hp--;
          var attributes = ['strength', 'skill', 'agility', 'toughness', 'movement'];
          this.impaired.push(shuffle(attributes).pop());
        }
        damage--;
      }
    };
    this.restoreHealth = function (hp) {
      while (hp > 0) {
        if (this.hp < 3) {
          this.hp++;
          this.impaired.shift();
        }
        hp--;
      }
    };
  }
  // hp-derived
  get condition() {
    switch (this.hp) {
      case 3: return 'Healthy';
      case 2: return 'Wounded';
      case 1: return 'Critical';
      case 0: return 'Defeated';
    }
  }
  // strength-derived
  get strMod() { return this.getFx('strength') + this.getImp('strength') }
  get strSum() { return this.strength + this.strMod }
  // melee-derived
  get mleMod() { return this.getFx('melee') + this.getImp('melee') }
  get mleSum() { return this.melee + this.mleMod }
  // throwing-derived
  get thrMod() { return this.getFx('throwing') + this.getImp('throwing') }
  get thrSum() { return this.throwing + this.thrMod }
  // ranged-derived
  get rngMod() { return this.getFx('ranged') + this.getImp('ranged') }
  get rngSum() { return this.ranged + this.rngMod }
  // agility-derived
  get agiMod() { return this.getFx('agility') + this.getImp('agility') }
  get agiSum() { return this.agility + this.agiMod }
  // toughness-derived
  get tghMod() { return this.getFx('toughness') + this.getImp('toughness') }
  get tghSum() { return this.toughness + this.tghMod }
  // movement-derived
  get movMod() { return this.getFx('movement') + this.getImp('movement') }
  get movesLeft() { return this.movement + this.movMod - this.movesUsed }
  // item-derived
  get weapons() { return this.items.filter( i => i.itemType === 'weapon' ) }
  get clothing() { return this.items.filter( i => i.itemType === 'clothing' ) }
  get accessories() { return this.items.filter( i => i.itemType === 'accessory' ) }
  get equipped() {
    var equipped = this.weapons.filter( w => w.equipped === true );
    if (equipped.length) { return equipped[0] }
    else { return new Unarmed() }
  }
  get skill() { return this[this.equipped.type] }
  get range() {
    if (this.equipped.type === 'throwing') { return [1, Math.floor(this.strSum / this.equipped.range[1])]}
    else { return this.equipped.range }
  }
  get armor() { return this.clothing.reduce( (a, b) => a + b.armor , 0) }
  // skill-derived
  get sklMod() { return this.getFx(this.equipped.type) + this.getImp(this.equipped.type) }
  get sklSum() { return this.skill + this.sklMod }
  // attack-derived
  get attacksLeft() { return this.attacksPerTurn - this.attacksUsed }
}

var player0 = new Unit('player0', 'Player', 'Player Unit', 2, 2, 2, 2, 2, 3, 5, [], 9, 4, true, 'player'),
    enemy0  = new Unit('enemy0', 'Enemy', 'Enemy Unit', 3, 2, 2, 2, 2, 2, 5, [stones2], 6, 11, false, 'ai', 'sentry');

var unitPlan = [
  {
    faction: 'Player',
    control: 'player',
    units: [ player0, ]
  }, {
    faction: 'Enemy',
    control: 'ai',
    units: [ enemy0 ]
  }
];

class DialogEvent {
  constructor(unit, message, alignLeft) {
    this.eventType = 'dialog';
    this.subject = unit.name;
    this.portrait = 'sprites/' + unit.id.replace(/\d/, '') + '-portrait.png';
    this.faction = unit.faction;
    this.message = message;
    this.alignLeft = alignLeft;
  }
}

class CombatEvent {
  constructor(unit, target, damage, activeTurn, counter) {
    this.eventType = 'combat';
    this.subject = unit.name;
    this.subjectIcon = 'sprites/' + unit.id.replace(/\d/, '') + '-icon.png';
    if (!counter) { this.verb = 'attacked' } else { this.verb = 'countered' }
    this.verbIcon = unit.equipped.icon;
    this.object = target.name;
    this.objectIcon = 'sprites/' + target.id.replace(/\d/, '') + '-icon.png';
    switch (damage) {
      case 0: this.result = 'Attack missed.'; break;
      case 1: this.result = 'Attack hit.'; break;
      case 2: this.result = 'Critical hit!'; break;
    }
    this.activeTurn = activeTurn;
  }
}

class ConditionEvent {
  constructor(unit, activeTurn) {
    this.eventType = 'condition';
    this.subject = unit.name;
    this.subjectIcon = 'sprites/' + unit.id.replace(/\d/, '') + '-icon.png';
    if (unit.hp > 0) { this.verb = 'is' } else { this.verb = 'was' }
    this.object = unit.condition.toLowerCase();
    if (this.object === 'wounded' || this.object === 'critical') {
      this.result = capitalize(unit.impaired[unit.impaired.length - 1]) + ' -50%';
    }
    this.activeTurn = activeTurn;
  }
}

class ItemEvent {
  constructor(unit, verb, item, activeTurn) {
    this.eventType = 'item';
    this.subject = unit.name;
    this.subjectIcon = 'sprites/' + unit.id.replace(/\d/, '') + '-icon.png';
    this.verb = verb;
    this.object = item.name;
    this.objectIcon = item.icon;
    this.activeTurn = activeTurn;
  }
}

var openingDialog = [
  {
    unit: player0,
    message: "Ready..."
  },
  {
    unit: enemy0,
    message: "Set..."
  },
  {
    unit: player0,
    message: "Go!"
  }
];

class Shadow {
  constructor(dist, hAng1, hAng2, vAng) {
    this.dist = dist;
    this.hAng1 = hAng1;
    this.hAng2 = hAng2;
    this.vAng = vAng;
  }
}

function loadMap (mapPlan) {
  var y, x, row, string, mapData = [];
  for (y = 0; y < mapPlan.length; y++) {
    row = [];
    string = mapPlan[y].replace(/\s/g, '');
    for (x = 0; x < string.length; x++) {
      switch (string[x]) {
        case '-': row.push(new Space(y, x, new Barren())); break;
        case 's': row.push(new Space(y, x, new Sand())); break;
        case 'a': row.push(new Space(y, x, new Grass())); break;
        case 'b': row.push(new Space(y, x, new Brush())); break;
        case 'B': row.push(new Space(y, x, new Boulder())); break;
        case 'l': row.push(new Space(y, x, new Log())); break;
        case 'p': row.push(new Space(y, x, new Plateau())); break;
        case 'S': row.push(new Space(y, x, new Silversword())); break;
      }
    }
    mapData.push(row);
  }
  return mapData;
}

function loadFacings (mapData) {
  var y, x;
  for (y = 0; y < 16; y++) {
    for (x = 0; x < 16; x++) {
      if (mapData[y][x].terrain.type === 'log') {
        if      (mapData[y][x + 1].terrain.type === 'log') { mapData[y][x].terrain.facing = 'East' }
        else if (mapData[y + 1][x].terrain.type === 'log') { mapData[y][x].terrain.facing = 'South' }
        else if (mapData[y][x - 1].terrain.type === 'log') { mapData[y][x].terrain.facing = 'West' }
        else if (mapData[y - 1][x].terrain.type === 'log') { mapData[y][x].terrain.facing = 'North' }
      }
    }
  }
  return mapData;
}

function normalizeTopo (topoPlan) {
  var str, arr, num, normal, y, x,
      tally = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      newPlan = [];
  for (str of topoPlan) {
    arr = str.substring(1, str.length - 1).split(' ');
    arr = arr.map( s => Number(s) );
    for (num of arr) { tally[num]++ }
    newPlan.push(arr);
  }
  normal = tally.indexOf(Math.max(...tally));
  newPlan = newPlan.map( y => y.map( x => x - normal ) );
  return newPlan;
}

function loadTopography (mapData, topoPlan) {
  var y, x;
  for (y = 0; y < mapData.length; y++) {
    for (x = 0; x < mapData[y].length; x++) {
      mapData[y][x].terrain.elevation = topoPlan[y][x];
    }
  }
  return mapData;
}

function loadItems (mapData, itemPlan) {
  for (var space of itemPlan) {
    mapData[space.posY][space.posX].items = space.items;
  }
  return mapData;
}

function loadUnits (mapData, unitPlan) {
  for (var faction of unitPlan) {
    for (var unit of faction.units) {
      mapData[unit.posY][unit.posX].unit = unit;
    }
  }
  return mapData;
}

function loadLevel () {
  return  loadUnits(
            loadItems(
              loadTopography(
                loadFacings(
                  loadMap(mapPlan)
                )
              , normalizeTopo(topoPlan))
            , itemPlan)
          , unitPlan);
}

function loadFactions () {
  var obj, factions = [];
  for (obj of unitPlan) {
    factions.push(obj.faction);
  }
  return factions;
}

function shuffle (array) {
  var i, j, temp;
  for (i = array.length - 1; i > 0; i--) {
    j = Math.floor(Math.random() * (i + 1));
    temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
  return array;
}

function capitalize (string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

$( document ).ready( function () {

var GroundIcon = {
  template: `
    <transition name='fade'>
      <img class='space terrain' :style='imgStyle' :src='imgSrc'>
    </transition>
  `,
  props: ['itemType', 'transform'],
  computed: {
    imgStyle: function () {
      return { '-webkit-transform': this.transform }
    },
    imgSrc: function () {
      return 'sprites/ground-' + this.itemType + '.png';
    }
  }
};

var Terrain = {
  // To use terrain sprites instead of map image, add :class='terrain.type' to parent div.
  template: `
    <div class='space terrain'>
      <ground-icon v-if="itemsOfType(weapon).length" :itemType='weapon' :transform='transform'></ground-icon>
      <ground-icon v-if="itemsOfType(clothing).length" :itemType='clothing' :transform='transform'></ground-icon>
      <ground-icon v-if="itemsOfType(accessory).length" :itemType='accessory' :transform='transform'></ground-icon>
      <transition name='fade'>
        <img v-show='imgShow' class='space terrain' :src='imgSrc'>
      </transition>
    </div>
  `,
  props: ['terrain', 'items', 'topoView'],
  data: function () {
    var scaleX = Math.sign(Math.random() - 0.5),
        rotate = [0, 0.25, 0.5, 0.75][Math.floor(Math.random() * 4)];
    return {
      weapon: 'weapon',
      clothing: 'clothing',
      accessory: 'accessory',
      transform: 'scaleX(' + scaleX + ') rotate(' + rotate + 'turn)'
    };
  },
  computed: {
    imgShow: function () {
      return this.terrain.type !== 'barren' && this.topoView;
    },
    imgSrc: function () {
      return 'sprites/elevation' + this.terrain.elevation + '.png';
    }
  },
  methods: {
    itemsOfType: function (type) {
      return this.items.filter( i => i.itemType === type);
    }
  },
  components: {
    'ground-icon': GroundIcon
  }
};

var Highlight = {
  template: `
    <transition name='fade'>
      <div v-if='space.path || space.distance' class='space highlight' :class='classes'></div>
    </transition>
  `,
  props: ['space'],
  computed: {
    classes: function () {
      var unit = this.space.unit,
          path = this.space.path,
          distance = this.space.distance;
      return {
        movable: path,
        attackable: distance && (!unit || unit.friendly === Game.active.unit.friendly),
        targeted: distance && unit && unit.friendly !== Game.active.unit.friendly
      };
    }
  }
};

var Unit = {
  template: `
    <transition :name='dynamicTransition' @after-enter='moveHandler'>
      <img v-if='unit' :id='unit.id' class='space unit' :src='unit.sprite' :title='unit.name'>
    </transition>
  `,
  props: ['unit'],
  computed: {
    dynamicTransition: function () {
      if (this.unit) {
        if (this.unit.moving) {
          switch (this.unit.moving) {
            case 'east': return 'moveEast';
            case 'south': return 'moveSouth';
            case 'west': return 'moveWest';
            case 'north': return 'moveNorth';
          }
        } else if (this.unit.condition === 'Defeated') {
          return 'sayGoodbye';
        }
      }
    }
  },
  methods: {
    moveHandler: function () {
      var unit = this.unit;
      if (unit.path) {
        Game.moveUnit(unit.posY, unit.posX);
      }
      else {
        Game.map[unit.posY][unit.posX].unit.moving = null;
        Game.action = null;
      }
    }
  }
};

var Space = {
  template: `
    <div class='space' @click='clickHandler'>
      <terrain :terrain='space.terrain' :items='space.items' :topo-view='topoView'></terrain>
      <highlight :space='space'></highlight>
      <unit :unit='space.unit'></unit>
      <unit :unit='space.unit2'></unit>
    </div>
  `,
  props: ['space', 'topoView'],
  methods: {
    clickHandler: function () {
      var y = this.space.posY,
          x = this.space.posX,
          unit = this.space.unit,
          path = this.space.path;
      if (Game.control === 'player') {
        switch (Game.action) {
          case 'waiting':
            break;
          case 'moving':
            if (path) { Game.moveUnit(Game.active.posY, Game.active.posX, path) }
            else {
              $( '#btn-cancel' ).trigger( 'click' );
              this.selectSpace(y, x);
            }
            break;
          case 'attacking':
            if (this.space.distance && unit && !unit.friendly) {
              if (!Game.target || unit !== Game.target.unit) {
                Game.hideAttackRange(y, x);
                Game.targetUnit(y, x);
              } else {
                $( '#btn-confatk' ).trigger( 'click' );
              }
            }
            else {
              $( '#btn-cancel' ).trigger( 'click' );
              this.selectSpace(y, x);
            }
            break;
          case 'equipping':
            $( '#btn-cancel' ).trigger( 'click' );
            this.selectSpace(y, x);
            break;
          default:
            this.selectSpace(y, x);
            break;
        }
      }
    },
    selectSpace: function (y, x) {
      Game.active = Game.map[y][x];
      Game.target = null;
    }
  },
  components: {
    'terrain': Terrain,
    'highlight': Highlight,
    'unit': Unit
  }
};

var Row = {
  template: `
    <div class='row'>
      <space v-for='(space, index) in row' :key='index' :space='space' :topo-view='topoView'></space>
    </div>
  `,
  props: ['row', 'topoView'],
  components: {
    'space': Space
  }
};

var ItemInfo = {
  template: `
    <div class='item-info'>
      <p>
        <b>{{ item.name }}</b>
        <template v-if="type === 'weapon'">
          <span>{{ capitalize(item.type) }}</span>
          <span>Power: <b>{{ item.power }}</b></span>
          <span v-if="item.type !== 'melee'">Range: <b>{{ range }}</b></span>
        </template>
        <template v-if="type === 'clothing'">
          <span v-if='item.armor > 0'>Armor: <b>{{ item.armor }}</b></span>
        </template>
        <span v-for='effect in effects'>{{ effect }}</span>
      </p>
      <p>{{ item.descrip }}</p>
    </div>
  `,
  props: ['type', 'item'],
  computed: {
    effects: function () {
      if (this.item && this.item.effects) {
        var sign, effects = [];
        for (var [attribute, effect] of Object.entries(this.item.effects)) {
          if (attribute === 'restoreHealth') { effects.push('Restore HP'); }
          else {
            if (effect > 0) { sign = '+' } else { sign = '-' }
            effects.push(capitalize(attribute) + ' ' + sign + effect);
          }
        }
        return effects;
      }
    },
    range: function () {
      if (this.item.type === 'throwing') {
        if (this.item.range[1] === 1) { return 'Str' }
        else { return 'Str/' + this.item.range[1] }
      }
      else { return this.item.range[1] }
    }
  },
  methods: {
    capitalize: function (string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
    }
  }
};

var GroundItem = {
  template: `
    <div class='ground-item'>
      <img :id="item.id" class='item ground' :class='[item.itemType, item.id]' :src='item.sprite' :title='item.name'>
      <item-info :type='item.itemType' :item='item'></item-info>
    </div>
  `,
  props: ['item'],
  components: {
    'item-info': ItemInfo
  }
};

var GroundPanel = {
  template: `
    <transition name='fade'>
      <div v-if='items.length > 0' id='ground-panel'>
        <ground-item v-for='item in items' :item='item' :key='item.id'></ground-item>
      </div>
    </transition>
  `,
  props: ['items'],
  components: {
    'ground-item': GroundItem
  }
};

var TerrainInfo = {
  template: `
    <div class='ui terrain-info'>
      <p class='heading'><img class='icon' :src='imgSrc'>{{ terrain.name }}</p>
      <div class='flex'>
        <div class='columns'>
          <p v-if='terrain.cost < 99'>Move cost: <b>{{ terrain.cost }}</b></p><p v-else>Impassable</p>
          <p v-if='terrain.elevation !== 0'>Elevation: <b>{{ terrain.elevation }}</b></p>
        </div>
        <div class='columns'>
          <p v-if='terrain.cover > 0'>Cover: <b>{{ terrain.cover }}</b></p>
          <p v-if='terrain.facing'>Facing: <b>{{ terrain.facing }}</b></p>
        </div>
      </div>
    </div>
  `,
  props: ['terrain'],
  computed: {
    imgSrc: function () {
      return 'sprites/' + this.terrain.type + '.png';
    }
  }
};

var Modifier = {
  template: `
    <transition name='fade'>
      <b v-if='mod !== 0' :style='modColor'><span v-if='mod > 0'>+</span>{{ mod }}</b>
    </transition>
  `,
  props: ['mod'],
  computed: {
    modColor: function () {
      if (this.mod > 0) { return { color: '#00aaff' } } else
      if (this.mod < 0) { return { color: '#aa00ff' } }
    }
  }
};

var UnitInfo = {
  template: `
    <div class='ui unit-info'>
      <p class='heading'><img class='icon' :src='imgSrc'>{{ unit.name }}</p>
      <p>Condition: <b :class='unit.condition.toLowerCase()'>{{ unit.condition }}</b></p>
      <div class='flex'>
        <div class='col60'>
          <p>Strength: <b>{{ unit.strength }}</b> <modifier :mod='unit.strMod'></modifier></p>
          <p>Skill: <b>{{ unit.skill }}</b> <modifier :mod='unit.sklMod'></modifier></p>
          <p>Agility: <b>{{ unit.agility }}</b> <modifier :mod='unit.agiMod'></modifier></p>
          <p>Toughness: <b>{{ unit.toughness }}</b> <modifier :mod='unit.tghMod'></modifier></p>
          <p>Movement: <b>{{ unit.movement }}</b> <modifier :mod='unit.movMod'></modifier></p>
        </div>
        <div class='col40'>
          <p>Equipped:
            <img v-if="unit.equipped.id !== 'unarmed'" class='icon' :src='unit.equipped.icon'>
            <b>{{ unit.equipped.name }}</b>
          </p>
        </div>
      </div>
    </div>
  `,
  props: ['unit'],
  computed: {
    imgSrc: function () {
      return 'sprites/' + this.unit.faction.toLowerCase() + '-icon.png';
    }
  },
  components: {
    'modifier': Modifier
  }
};

var UnitActions = {
  template: `
    <div class='ui'>
      <p class='heading'><img class='icon' src='sprites/actions-icon.png'>Actions</p>
      <div id='action-buttons'>
        <div id='move-holder' class='btn-holder'>
          <img v-if="action !== 'moving' && unit.movesLeft > 0" id='btn-move' class='button' src='sprites/btn-move.png' title='Move (M)' @click='beginMove'>
        </div>
        <div id='attack-holder' class='btn-holder'>
          <img v-if="action !== 'attacking' && unit.attacksLeft > 0" id='btn-attack' class='button' src='sprites/btn-attack.png' title='Attack (A)' @click='beginAttack'>
        </div>
        <div id='equip-holder' class='btn-holder'>
          <img v-if="action !== 'equipping'" id='btn-equip' class='button' src='sprites/btn-equip.png' title='Equip (E)' @click='beginEquip'>
        </div>
        <div id='cancel-holder' class='btn-holder'>
          <img v-if='action' id='btn-cancel' class='button' src='sprites/btn-cancel.png' title='Cancel (C)' @click='cancelAction'>
        </div>
      </div>
    </div>
  `,
  props: ['action', 'unit'],
  methods: {
    beginMove: function () {
      if (this.action) { this.cancelAction() }
      var unit = Game.active.unit;
      Game.target = null;
      Game.action = 'moving';
      Game.showMoveRange(unit.posY, unit.posX, unit.movesLeft, '');
      Game.preventCollision();
    },
    beginAttack: function () {
      if (this.action) { this.cancelAction() }
      Game.target = null;
      Game.action = 'attacking';
      Game.showAttackRange();
    },
    beginEquip: function () {
      if (this.action) { this.cancelAction() }
      Game.action = 'equipping';
      Vue.nextTick(function(){
        Game.makeEquipItemsDraggable('.equip');
        Game.makeGroundItemsDraggable('.ground');
      });
    },
    cancelAction: function () {
      switch (this.action) {
        case 'moving': Game.cancelMove(); break;
        case 'attacking': Game.cancelAttack(); break;
        case 'equipping': Game.cancelEquip(); break;
      }
    }
  }
};

var TargetActions = {
  template: `
    <div class='ui'>
      <p class='heading'><img class='icon' src='sprites/actions-icon.png'>Actions</p>
      <div id='confatk-holder' class='btn-holder'>
        <img v-if='btnEnabled' id='btn-confatk' class='button' src='sprites/btn-confatk.png' title='Confirm Attack (A)' @click='confirmAttack'>
      </div>
    </div>
  `,
  data: function () {
    return { btnEnabled: true }
  },
  methods: {
    confirmAttack: function () {
      this.btnEnabled = false;
      Game.attackUnit();
    }
  }
};

var CombatInfo = {
  template: `
    <div class='ui'>
      <p class='heading'><img class='icon' src='sprites/combat-icon.png'>Combat</p>
      <div class='flex'>
        <div class='columns'>
          <template v-if="type === 'active'">
            <p>Attack: <b>{{ combat.activeAtk }}</b></p>
            <p v-if='combat.canCounter'>Defense: <b>{{ combat.activeDef }}</b></p>
          </template>
          <template v-else-if="type === 'target'">
            <p v-if='combat.canCounter'>Attack: <b>{{ combat.targetAtk }}</b></p>
            <p>Defense: <b>{{ combat.targetDef }}</b></p>
          </template>
        </div>
        <div class='columns flex'>
          <template v-if="type === 'active'"><p>Hit:</p><p class='bold' :style='gradient'><span class='big'>{{ combat.activeHit }}</span>%</p></template>
          <template v-else-if="type === 'target' && combat.canCounter"><p>Hit:</p><p class='bold':style='gradient'><span class='big'>{{ combat.targetHit }}</span>%</p></template>
        </div>
      </div>
    </div>
  `,
  props: ['type', 'combat'],
  computed: {
    gradient: function () {
      var hit;
      if      (this.type === 'active') { hit = this.combat.activeHit }
      else if (this.type === 'target') { hit = this.combat.targetHit }
      if (hit < 10) { return { color: '#bf0000' } }
      else if (hit < 20) { return { color: '#d01b00' } }
      else if (hit < 30) { return { color: '#e13600' } }
      else if (hit < 40) { return { color: '#f25100' } }
      else if (hit < 50) { return { color: '#ea6a00' } }
      else if (hit < 60) { return { color: '#e28300' } }
      else if (hit < 70) { return { color: '#da9c00' } }
      else if (hit < 80) { return { color: '#97a406' } }
      else if (hit < 90) { return { color: '#55ab0c' } }
      else { return { color: '#12b312' } }
    }
  }
};

var ItemSlot = {
  template: `
    <div :id='type + n' class='item-slot' :style='slotBackground' @click='showInfo($event)'>
      <img v-if='item' :id="item.id + '-' + n" class='item equip' :class='[type, item.id, { usable: item.usable }]' :src='imgSrc' :title='item.name'>
      <transition name='fade'>
        <div v-if="item && itemtip === type + n" id='item-tip'>
          <item-info :type='type' :item='item'></item-info>
        </div>
      </transition>
    </div>
  `,
  props: ['type', 'n', 'item', 'itemtip'],
  computed: {
    slotBackground: function () {
      var imgUrl = "url('sprites/" + this.type + "-slot.png')";
      return { backgroundImage: imgUrl }
    },
    imgSrc: function () {
      if (this.item) {
        return this.item.sprites[this.item.slots.indexOf(this.n)];
      }
    }
  },
  methods: {
    showInfo: function (event) {
      if (event.target.tagName !== 'DIV') {
        if (!this.itemtip) {
          Game.itemtip = this.type + this.n;
        } else {
          Game.itemtip = null;
        }
      }
    }
  },
  components: {
    'item-info': ItemInfo
  }
};

var ItemHolder = {
  template: `
    <div class='item-holder'>
      <img :src="'sprites/' + type + '-card.png'">
      <div class='slot-container' :style='borderColor'>
        <item-slot v-for='n in 6' :type='type' :n='n - 1' :item='itemData[n - 1]' :itemtip='itemtip' :key='n - 1'></item-slot>
      </div>
    </div>
  `,
  props: ['type', 'items', 'itemtip'],
  computed: {
    borderColor: function () {
      switch (this.type) {
        case 'weapon': return { border: '1px solid #800000' }
        case 'clothing': return { border: '1px solid #000099' }
        case 'accessory': return { border: '1px solid #005900' }
      }
    },
    itemData: function () {
      var itemData = [null, null, null, null, null, null];
      for (item of this.items) {
        for (slot of item.slots) {
          itemData[slot] = item;
        }
      }
      return itemData;
    }
  },
  components: {
    'item-slot': ItemSlot
  }
};

var UnitItems = {
  template: `
    <div class='ui'>
      <p class='heading'><img class='icon' src='sprites/equipment-icon.png'>Equipment</p>
      <div class='equipment'>
        <item-holder type='weapon' :items='unit.weapons' :itemtip='itemtip'></item-holder>
        <item-holder type='clothing' :items='unit.clothing' :itemtip='itemtip'></item-holder>
        <item-holder type='accessory' :items='unit.accessories' :itemtip='itemtip'></item-holder>
      </div>
    </div>
  `,
  props: ['unit', 'itemtip'],
  components: {
    'item-holder': ItemHolder
  }
};

var SidePanel = {
  template: `
    <div>
      <transition name='fade'>
        <div v-if='space && space.terrain'>
          <terrain-info :terrain='space.terrain'></terrain-info>
        </div>
      </transition>
      <transition :name='dynamicTransition'>
        <div v-if='space && space.unit'>
          <unit-info :unit='space.unit'></unit-info>
          <unit-items v-if="side === 'left' && action === 'equipping'" :unit='space.unit' :itemtip='itemtip'></unit-items>
          <template v-if="side === 'left'">
            <combat-info v-if="combat && action === 'attacking'" type='active' :combat='combat'></combat-info>
            <unit-actions v-if="control === 'player' && space.unit.control === 'player'" :action='action' :unit='space.unit'></unit-actions>
          </template>
          <template v-else-if="side === 'right' && action === 'attacking'">
            <combat-info v-if='combat' type='target' :combat='combat'></combat-info>
            <target-actions v-if="control === 'player' && space"></target-actions>
          </template>
        </div>
      </transition>
    </div>
  `,
  props: ['side', 'space', 'action', 'combat', 'itemtip', 'control'],
  computed: {
    dynamicTransition: function () {
      if (this.space && this.space.unit && this.space.unit.condition === 'Defeated') { return 'sayGoodbye' }
      else { return 'fade' }
    }
  },
  components: {
    'terrain-info': TerrainInfo,
    'unit-info': UnitInfo,
    'combat-info': CombatInfo,
    'unit-actions': UnitActions,
    'target-actions': TargetActions,
    'unit-items': UnitItems
  }
};

var EventDialog = {
  template: `
    <transition name='fade-long'>
      <div class='event dialog'>
        <div class='content' :class='alignment'>
          <img v-if='event.alignLeft' class='portrait' :src='event.portrait' :title='event.subject'>
          <div class='message' :style='messageColor'>{{ event.message }}</div>
          <img v-if='!event.alignLeft' class='portrait' :src='event.portrait' :title='event.subject'>
        </div>
      </div>
    </transition>
  `,
  props: ['event'],
  computed: {
    alignment: function () {
      if (this.event.alignLeft) { return 'align-left' } else { return 'align-right' }
    },
    messageColor: function () {
      switch (this.event.faction) {
        case 'Player': return { background: '#f2d791' };
        case 'Enemy': return { background: '#7acca4' };
      }
    }
  }
}

var EventAction = {
  template: `
    <transition name='fade-long'>
      <div class='event action'>
        <div class='content' :style='contentStyle'>
          <img class='icon' :src='event.subjectIcon'>
          <span class='bold sa'>{{ event.subject }}</span>
          <img v-if='event.verbIcon' class='icon' :src='event.verbIcon'>
          <span class='sa'>{{ event.verb }}</span>
          <img v-if='event.objectIcon' class='icon' :src='event.objectIcon'>
          <span class='bold' :class='objectClass'>{{ event.object }}</span><span class='sa'>.</span>
          <span v-if='event.result' :class='resultClass'>{{ event.result }}</span>
        </div>
      </div>
    </transition>
  `,
  props: ['event'],
  computed: {
    contentStyle: function () {
      switch (this.event.activeTurn) {
        case 'Player': return { background: '#f9ebc8' };
        case 'Enemy': return { background: '#bde6d2' };
      }
    },
    objectClass: function () {
      var type = this.event.eventType,
          cond = this.event.object;
      return {
        healthy: type === 'condition' && cond === 'healthy',
        wounded: type === 'condition' && cond === 'wounded',
        critical: type === 'condition' && cond === 'critical',
        defeated: type === 'condition' && cond === 'defeated',
      }
    },
    resultClass: function () {
      var type = this.event.eventType,
          result = this.event.result;
      return {
        red: type === 'combat' && result === 'Critical hit!',
        debuff: type === 'condition'
      }
    }
  }
}

var EventSwitcher = {
  template: `
    <component :is='eventType' :event='event'></component>
  `,
  props: ['event'],
  computed: {
    eventType: function () {
      if (this.event.eventType === 'dialog') { return 'dialog-event' }
      else { return 'action-event' }
    }
  },
  components: {
    'dialog-event': EventDialog,
    'action-event': EventAction
  }
};

var EventLog = {
  template:`
    <div id='event-log'>
      <event-switcher v-for='(event, index) in events' :event='event' :key='index'></event-switcher>
    </div>
  `,
  props: ['events'],
  components: {
    'event-switcher': EventSwitcher
  }
};

var TopoControl = {
  template: `
    <div class='ui flex center'>
      <span class='sa'>Elevation View:</span>
      <div id='tgl-topoview' class='tgl-switch' :title='title' @click='toggleTopoView'>
        <div class='tgl-holder' :class='tglOn' :title='title'>
          <div class='tgl-slider' :class='tglOn' :title='title'>
            <span class='tgl-text' :class='tglOn' :title='title'>On</span>
            <div class='tgl-handle' :title='title'></div>
            <span class='tgl-text' :class='tglOn' :title='title'>Off</span>
          </div>
        </div>
      </div>
    </div>
  `,
  props: ['topoView'],
  data: function () {
    return {
      title: 'Toggle Elevation View (V)'
    }
  },
  computed: {
    tglOn: function () {
      return { 'tgl-on': this.topoView }
    }
  },
  methods: {
    toggleTopoView: function () {
      Game.topoView = !Game.topoView;
    }
  }
};

var StatusPanel = {
  template: `
    <div class='ui'>
      <p>Turn: <b>{{ turn }}</b></p>
      <p>Faction: <b>{{ faction }}</b></p>
      <p>Units: <b>{{ units }}</b></p>
      <div v-if="control === 'player'" id='end-holder'>
        <img v-if='!action' id='btn-end' class='button' src='sprites/btn-end.png' title='End Turn' @click='endTurn'>
      </div>
    </div>
  `,
  props: ['turn', 'faction', 'control', 'units', 'action'],
  methods: {
    endTurn: function () {
      Game.endTurn();
    }
  }
};

var TurnBanner = {
  template: `
    <transition name='banner' @after-enter='bannerIn' @after-leave='bannerOut'>
      <div id='banner-back' class='banner' :style='bannerBack'>
        <div id='banner-fore' class='banner' :style='bannerFore'>
          <div id='banner-text' class='banner'>{{ faction.toUpperCase() }} TURN</div>
        </div>
      </div>
    </transition>
  `,
  props: ['faction'],
  computed: {
    bannerBack: function () {
      var r, g, b, transp, opaque;
      switch (this.faction) {
        case 'Player': r = 140; g = 104; b = 21;  break;
        case 'Enemy':  r = 0;   g = 63;  b = 31;  break;
      }
      transp = 'rgba(' + r + ', ' + g + ', ' + b + ', 0)';
      opaque = 'rgba(' + r + ', ' + g + ', ' + b + ', 1)';
      return { background: 'linear-gradient(to left,'+transp+','+opaque+','+opaque+','+opaque+','+transp+')' }
    },
    bannerFore: function () {
      var r, g, b, transp, opaque;
      switch (this.faction) {
        case 'Player': r = 218; g = 165; b = 32;  break;
        case 'Enemy':  r = 0;   g = 140; b = 70;  break;
      }
      transp = 'rgba(' + r + ', ' + g + ', ' + b + ', 0)';
      opaque = 'rgba(' + r + ', ' + g + ', ' + b + ', 1)';
      return { background: 'linear-gradient(to left,'+transp+','+opaque+','+opaque+','+opaque+','+transp+')' }
    }
  },
  methods: {
    bannerIn: function () {
      Game.banner = false;
    },
    bannerOut: function () {
      Game.action = null;
    }
  }
};

// VUE INSTANCE STARTS HERE VUE INSTANCE STARTS HERE VUE INSTANCE STARTS HERE VUE INSTANCE STARTS HERE

var Game = new Vue ({
  el:'#game',
  data: {
    mapImage: mapImage,
    map: loadLevel(),
    factions: loadFactions(),
    turn: 1,
    factionIndex: 0,
    unitIndex: 0,
    banner: false,
    action: 'waiting',
    active: null,
    target: null,
    itemtip: null,
    events: [],
    dialog: openingDialog,
    scrolled: false,
    shadows: null,
    topoView: false,
    itemActions: {
      canEquip: false,
      canUse: false,
      canDrop: false
    }
  },
  computed: {
    faction: function () {
      return this.factions[this.factionIndex];
    },
    control: function () {
      return unitPlan.filter( f => f.faction === this.faction )[0].control;
    },
    units: function () {
      return shuffle(this.getUnits(this.faction));
    },
    distance: function () {
      if (this.target) {
        return Math.abs(this.active.posY - this.target.posY) + Math.abs(this.active.posX - this.target.posX);
      }
    },
    combat: function () {
      if (this.active && this.target && this.active.unit && this.target.unit) {
        return {
          activeAtk: this.calculateAttack(this.active),
          activeDef: this.calculateDefense(this.active, this.target),
          targetAtk: this.calculateAttack(this.target),
          targetDef: this.calculateDefense(this.target, this.active),
          get activeHit() { return Math.round(this.activeAtk / (this.activeAtk + this.targetDef) * 100) },
          get targetHit() { return Math.round(this.targetAtk / (this.targetAtk + this.activeDef) * 100) },
          get activeCrt() { return Game.active.unit.sklSum },
          get targetCrt() { return Game.target.unit.sklSum },
          canCounter: this.checkRange(this.distance, this.target.unit.range)
        }
      }
    }
  },
  watch: {
    events: function () {
      Vue.nextTick(function(){ Game.scrollEventLog() });
    }
  },
  methods: {
    showMoveRange: function (y, x, moves, path) {
      var origin = this.map[y][x],
          east = this.map[y][Math.min(x + 1, 15)], eastMoves = moves - east.terrain.cost, eastPath = path + 'e',
          sout = this.map[Math.min(y + 1, 15)][x], soutMoves = moves - sout.terrain.cost, soutPath = path + 's',
          west = this.map[y][Math.max(x - 1, 0)],  westMoves = moves - west.terrain.cost, westPath = path + 'w',
          nort = this.map[Math.max(y - 1, 0)][x],  nortMoves = moves - nort.terrain.cost, nortPath = path + 'n',
          explore = [],
          goEast = function () { Game.showMoveRange(y, Math.min(x + 1, 15), eastMoves, eastPath) },
          goSout = function () { Game.showMoveRange(Math.min(y + 1, 15), x, soutMoves, soutPath) },
          goWest = function () { Game.showMoveRange(y, Math.max(x - 1, 0),  westMoves, westPath) },
          goNort = function () { Game.showMoveRange(Math.max(y - 1, 0), x,  nortMoves, nortPath) };
      if (!origin.moves) { origin.moves = moves }
      if (this.canMove(origin, east, moves)) { east.moves = eastMoves; east.path = eastPath; explore.push(goEast) }
      if (this.canMove(origin, sout, moves)) { sout.moves = soutMoves; sout.path = soutPath; explore.push(goSout) }
      if (this.canMove(origin, west, moves)) { west.moves = westMoves; west.path = westPath; explore.push(goWest) }
      if (this.canMove(origin, nort, moves)) { nort.moves = nortMoves; nort.path = nortPath; explore.push(goNort) }
      shuffle(explore).forEach( function (f) { f(); } );
    },
    canMove: function (from, to, moves) {
      return Math.abs(from.terrain.elevation - to.terrain.elevation) <= 1
          && to.terrain.cost <= moves
          && (!to.moves || moves - to.terrain.cost > to.moves)
          && (to.unit === null || to.unit.friendly)
    },
    preventCollision: function () {
      for (u of this.getUnits(this.faction)) {
        this.map[u.posY][u.posX].moves = null;
        this.map[u.posY][u.posX].path = null;
      }
    },
    cancelMove: function () {
      this.hideMoveRange();
      this.action = null;
    },
    hideMoveRange: function () {
      var y, x,
          posY = this.active.unit.posY,
          posX = this.active.unit.posX,
          moves = this.active.unit.movesLeft;
      for (y = Math.max(posY - moves, 0); y <= Math.min(posY + moves, 15); y++) {
        for (x = Math.max(posX - moves, 0); x <= Math.min(posX + moves, 15); x++) {
          this.map[y][x].moves = null;
          this.map[y][x].path = null;
        }
      }
    },
    moveUnit: function (y, x, path) {
      var from = this.map[y][x], unit,
          moveData = { y: y, x: x, moving: null, changePos: null },
          to, unitData;
      if (path) {
        this.hideMoveRange();
        this.map[y][x].unit.path = path;
      }
      if (from.unit2) { unit = from.unit2 } else { unit = from.unit }
      switch (unit.path[0]) {
        case 'e':
          moveData.x = x + 1;
          moveData.moving = 'east';
          moveData.changePos = function () { unitData.posX += 1 };
          break;
        case 's':
          moveData.y = y + 1;
          moveData.moving = 'south';
          moveData.changePos = function () { unitData.posY += 1 };
          break;
        case 'w':
          moveData.x = x - 1;
          moveData.moving = 'west';
          moveData.changePos = function () { unitData.posX -= 1 };
          break;
        case 'n':
          moveData.y = y - 1;
          moveData.moving = 'north';
          moveData.changePos = function () { unitData.posY -= 1 };
          break;
      }
      to = this.map[moveData.y][moveData.x];
      if (from.unit2) { unitData = from.unit2; from.unit2 = null; }
      else { unitData = from.unit; from.unit = null; }
      unitData.path = unitData.path.substr(1);
      unitData.moving = moveData.moving;
      unitData.movesUsed += to.terrain.cost;
      moveData.changePos();
      if (!to.unit) { to.unit = unitData } else { to.unit2 = unitData }
      this.active = to;
    },
    showAttackRange: function () {
      var unit = this.active.unit,
          inRange = this.findSpacesInRange(unit.posY, unit.posX, unit.range);
      this.shadows = [new Shadow(0, -Math.PI, Math.PI, Math.atan2(-0.75, 0.5))];
      for (var r = 1; r <= unit.range[1]; r++) {
        inRange.filter( s => s.dist === r ).forEach( function (s) {
          var y = s.posY, x = s.posX, d = s.dist,
              space = Game.map[y][x], terrain = space.terrain;
          Game.castSquareShadow(y, x, d, terrain.elevation / 2);
          if (terrain.height > 0) {
            switch (terrain.shape) {
              case 'square': Game.castSquareShadow(y, x, d, space.posZ); break;
              case 'circle': Game.castCircularShadow(y, x, d, space.posZ); break;
            }
          }
          Game.findLineOfSight(y, x, d);
        });
      }
    },
    findSpacesInRange: function (posY, posX, range) {
      var y, x, distance, inRange = [];
      for (y = Math.max(posY - range[1], 0); y <= Math.min(posY + range[1], 15); y++) {
        for (x = Math.max(posX - range[1], 0); x <= Math.min(posX + range[1], 15); x++) {
          distance = Math.abs(y - posY) + Math.abs(x - posX);
          if (distance > 0 && distance <= range[1]) { inRange.push({ posY: y, posX: x, dist: distance}) }
        }
      }
      return inRange;
    },
    castSquareShadow: function (y, x, d, z) {
      var aY = this.active.posY, yDist = y - aY,
          aX = this.active.posX, xDist = x - aX,
          edges = this.findSquareShadowEdges(y, x),
          hDist = Math.sqrt(yDist * yDist + xDist * xDist),
          vDist = z - (this.active.terrain.elevation / 2 + 0.75),
          hAng1, hAng2, vAng;
      if      (vDist > 0) { hDist -= 0.5; d -= 1 }
      else if (vDist < 0) { hDist += 0.5 }
      hAng1 = Math.atan2(edges[1].Y - aY, edges[1].X - aX);
      hAng2 = Math.atan2(edges[2].Y - aY, edges[2].X - aX);
      vAng = Math.atan2(vDist, hDist);
      this.shadows.push(new Shadow(d, hAng1, hAng2, vAng));
    },
    findSquareShadowEdges: function (y, x) {
      var e1, e2,
          aY = this.active.posY,
          aX = this.active.posX,
          a = { Y: y - 0.5, X: x - 0.5 }, // top left corner
          b = { Y: y - 0.5, X: x + 0.5 }, // top right corner
          c = { Y: y + 0.5, X: x - 0.5 }, // bottom left corner
          d = { Y: y + 0.5, X: x + 0.5 }; // bottom right corner
      if (y < aY) {
        if (x < aX)      { e1 = c; e2 = b; }
        else if (x > aX) { e1 = a; e2 = d; }
        else             { e1 = c; e2 = d; }
      }
      else if (y > aY) {
        if (x < aX)      { e1 = d; e2 = a; }
        else if (x > aX) { e1 = b; e2 = c; }
        else             { e1 = b; e2 = a; }
      }
      else {
        if (x < aX) { e1 = d; e2 = b; }
        else        { e1 = a; e2 = c; }
      }
      return { 1: e1, 2: e2 };
    },
    castCircularShadow: function (y, x, d, z) {
      var yDist = y - this.active.posY,
          xDist = x - this.active.posX,
          hDist = Math.sqrt(yDist * yDist + xDist * xDist),
          hAng = Math.atan2(yDist, xDist),
          hWidth = Math.asin(0.5 / hDist),
          vDist = z - (this.active.terrain.elevation / 2 + 0.75),
          hAng1, hAng2, vAng;
      if      (vDist > 0) { hDist -= 0.5; d -= 1 }
      else if (vDist < 0) { hDist += 0.5 }
      hAng1 = hAng - hWidth; if (hAng1 < -Math.PI) { hAng1 += Math.PI * 2 }
      hAng2 = hAng + hWidth; if (hAng2 > Math.PI) { hAng2 -= Math.PI * 2 }
      vAng = Math.atan2(vDist, hDist);
      this.shadows.push(new Shadow(d, hAng1, hAng2, vAng));
    },
    findLineOfSight: function (y, x, d) {
      var from = this.active, to = this.map[y][x],
          yDist = y - from.posY, xDist = x - from.posX,
          hDist = Math.sqrt(yDist * yDist + xDist * xDist),
          vDist = to.terrain.elevation / 2 - from.terrain.elevation / 2,
          hAng = Math.atan2(yDist, xDist),
          vAng = Math.atan2(vDist, hDist),
          shadows = this.shadows.filter( function (s) {
            if (s.hAng1 < 0 || s.hAng2 > 0) {
              return s.dist < d && hAng > s.hAng1 && hAng < s.hAng2 && vAng < s.vAng;
            } else {
              return s.dist < d && (hAng > s.hAng1 || hAng < s.hAng2) && vAng < s.vAng;
            }
          });
      if (shadows.length === 0 && this.canAttack(from, to, from.unit.range)) {
        this.map[y][x].distance = Math.abs(yDist) + Math.abs(xDist);
      }
    },
    canAttack: function (from, to, range) {
      var hDiff = Math.abs(to.posY - from.posY) + Math.abs(to.posX - from.posX),
          vDiff = to.terrain.elevation - from.terrain.elevation;
      if (range[1] <= 1) {
        return hDiff >= range[0] && hDiff <= range[1] && Math.abs(vDiff) <= range[1];
      } else {
        return hDiff >= range[0] && hDiff <= range[1] && vDiff <= range[1];
      }
    },
    cancelAttack: function () {
      this.hideAttackRange();
      this.action = null;
      this.target = null;
      this.shadows = null;
    },
    hideAttackRange: function (targetY, targetX) {
      var y, x, distance, targetDistance,
          posY = this.active.unit.posY,
          posX = this.active.unit.posX,
          range = this.active.unit.range;
      if (targetY && targetX) { targetDistance = this.map[targetY][targetX].distance }
      for (y = Math.max(posY - range[1], 0); y <= Math.min(posY + range[1], 15); y++) {
        for (x = Math.max(posX - range[1], 0); x <= Math.min(posX + range[1], 15); x++) {
          this.map[y][x].distance = null;
        }
      }
      if (targetY && targetX) { this.map[targetY][targetX].distance = targetDistance }
    },
    targetUnit: function (y, x) {
      var target = this.map[y][x];
      if (!this.checkRange(target.distance, target.unit.range)) {
        for (var weapon of target.unit.weapons) {
          if (Game.checkRange(target.distance, weapon.range)) {
            this.map[y][x].unit.equipWeapon(weapon.id);
            break;
          }
        }
      }
      this.target = this.map[y][x];
    },
    calculateAttack: function (atkSpace) {
      // attack = strength + skill + power - distance
      var attacker = atkSpace.unit,
          attackType = attacker.equipped.type,
          attack = 0;
      if (attackType === 'melee' || attackType === 'throwing') { attack += attacker.strSum }
      attack += attacker.sklSum + attacker.equipped.power - (this.distance - 1);
      return attack;
    },
    calculateDefense: function (defSpace, atkSpace) {
      // defense = agility + toughness + armor + cover + elevation
      var defender = defSpace.unit,
          attacker = atkSpace.unit,
          attackType = attacker.equipped.type,
          cover = defSpace.terrain.cover,
          facing = defSpace.terrain.facing,
          defense = 0;
      if (attackType === 'melee' || attackType === 'throwing') { defense += defender.agiSum }
      defense += defender.tghSum + defender.armor;
      if (!facing) { defense += cover }
      else {
        switch (facing) {
          case 'East':  if (attacker.posX > defender.posX) { defense += cover } break;
          case 'South': if (attacker.posY > defender.posY) { defense += cover } break;
          case 'West':  if (attacker.posX < defender.posX) { defense += cover } break;
          case 'North': if (attacker.posY < defender.posY) { defense += cover } break;
        }
      }
      defense += Math.max(defSpace.terrain.elevation - atkSpace.terrain.elevation, 0);
      return defense;
    },
    checkRange: function (distance, range) {
      if (distance >= range[0] && distance <= range[1]) { return true }
    },
    attackUnit: function (counter) {
      var attacker, defender, hitChance, crtChance, damage = 0;
      if (!counter) {
        this.map[this.target.posY][this.target.posX].distance = null;
        attacker = this.active.unit;
        defender = this.target.unit;
        hitChance = this.combat.activeHit;
        crtChance = this.combat.activeCrt;
      } else {
        attacker = this.target.unit;
        defender = this.active.unit;
        hitChance = this.combat.targetHit;
        crtChance = this.combat.targetCrt;
      }
      if (Math.random()*100 <= hitChance) {
        damage += 1;
        if (Math.random()*100 <= crtChance) {
          damage += 1;
        }
      }
      this.animateCombat(attacker, defender, damage);
      window.setTimeout(function(){
        Game.events.push(new CombatEvent(attacker, defender, damage, Game.faction, counter));
        if (damage > 0) {
          Game.dealDamage(defender.posY, defender.posX, damage);
          Game.events.push(new ConditionEvent(defender, Game.faction));
        }
      }, 250);
      window.setTimeout(function(){
        if (!counter && Game.combat.canCounter && defender.hp > 0) {
          Game.attackUnit(true);
        } else {
          Game.endAttack();
        }
      }, 500);
    },
    animateCombat: function (attacker, defender, damage) {
      var spacesY, spacesX, pixelsY, pixelsX, evadeSprite, attack, hit, miss;
      spacesY = defender.posY - attacker.posY;
      spacesX = defender.posX - attacker.posX;
      pixelsY = Math.round(16 * Math.sin(Math.atan2(spacesY, spacesX)));
      pixelsX = Math.round(16 * Math.cos(Math.atan2(spacesY, spacesX)));
      evadeSprite = "url('" + defender.sprite.slice(0, -4) + "-evade.png')";
      attack = {
        zIndex: [ 70, 70 ],
        top: [0, (pixelsY + 'px'), 0 ],
        left: [0, (pixelsX + 'px'), 0 ],
        easing: 'ease-in-out'
      };
      hit = {
        top: [0, (pixelsY / 3 + 'px'), 0 ],
        left: [0, (pixelsX / 3 + 'px'), 0 ],
        boxSizing: ['border-box', 'border-box'],
        backgroundImage: ["url('sprites/attack-hit.png')", "url('sprites/attack-hit.png')"],
        paddingLeft: ['32px', '32px'],
        easing: 'ease-in-out'
      };
      miss = {
        boxSizing: ['border-box', 'border-box'],
        backgroundImage: [evadeSprite, evadeSprite],
        paddingLeft: ['32px', '32px'],
        easing: 'ease-in-out'
      };
      document.getElementById(attacker.id).animate(attack, 500);
      if (damage > 0) {
        window.setTimeout(function(){ document.getElementById(defender.id).animate(hit, 250) }, 250);
      } else {
        window.setTimeout(function(){ document.getElementById(defender.id).animate(miss, 350) }, 150);
      }
    },
    dealDamage: function (y, x, damage) {
      this.map[y][x].unit.sustainDamage(damage);
      Vue.nextTick(function(){
        if (Game.map[y][x].unit.hp === 0) {
          window.setTimeout(function(){ Game.sayGoodbye(y, x) }, 500);
        }
      });
    },
    sayGoodbye: function (y, x) {
      var space = this.map[y][x];
      while (space.unit.items.length) {
        space.items.push(space.unit.items.shift());
      }
      space.items.sort(this.compareItems);
      this.map[y][x].unit = null;
    },
    endAttack: function () {
      var unit = this.active.unit;
      if (unit) { this.map[unit.posY][unit.posX].unit.attacksUsed += 1 }
      this.action = null;
      this.shadows = null;
    },
    makeEquipItemsDraggable: function (draggables) {
      $( draggables ).toArray().forEach( function (item) {
        var itemSrc = item.src.match(/sprites\/.*\.png/)[0],
            cursorOffset = Game.findCursorOffset(itemSrc),
            helperSrc = itemSrc.replace(/\d/, ''),
            helperImg = $( '<img>', { src: helperSrc } ),
            helperDiv = $( '<div id="helper"></div>' ),
            itemClass = '.' + item.classList[3];
        $( '#' + item.id ).draggable({
          cursor: '-webkit-grabbing',
          cursorAt: cursorOffset,
          helper: function(){ return helperDiv.append(helperImg) },
          revert: 'invalid',
          zIndex: 95,
          start: function (event, ui) {
            Game.itemtip = null;
            $( itemClass ).hide();
            var slotId = event.target.parentNode.id;
            Game.findDroppableSlots(item.classList[1], slotId.slice(0, -1), event.target.id.slice(0, -2), Number(slotId.slice(-1)));
            Game.makePanelsDroppable();
          },
          stop: function (event, ui) {
            $( itemClass ).show();
            $( '.ui-droppable' ).droppable( 'destroy' );
          }
        });
      });
    },
    findCursorOffset: function (src) {
      if (src.match(/\d/)) {
        switch (Number(src.match(/\d/)[0])) {
          case 0: return { top: 16, left: 16 }
          case 1: return { top: 16, left: 48 }
          case 2: return { top: 48, left: 16 }
          case 3: return { top: 48, left: 48 }
          case 4: return { top: 80, left: 16 }
          case 5: return { top: 80, left: 48 }
        }
      } else { return { top: 16, left: 16 } }
    },
    makePanelsDroppable: function () {
      var dragover = function (html, style, id) {
            $( '#helper' ).prepend($( '<span>', { html: html, style: style } ));
            $( '#helper' ).css( 'cursor', 'none' );
            var cursorAt = $( '#' + id ).draggable( 'option', 'cursorAt' ),
                helperAt = {
                  top: Math.round(Number($( '#helper' ).css( 'height' ).slice(0, -2))) / 2,
                  left: Math.round(Number($( '#helper' ).css( 'width' ).slice(0, -2))) / 2
                },
                y = cursorAt.top - helperAt.top,
                x = cursorAt.left - helperAt.left;
            $( '#helper *' ).css({ 'top': y + 'px', 'left': x + 'px' });
          },
          dragout = function () {
            $( '#helper span' ).remove();
            $( '#helper' ).css( 'cursor', '' );
            $( '#helper *' ).css({ 'top': '', 'left': '' });
          }
      $( '.unit-info' ).droppable({
        accept: '.weapon, .usable',
        classes: {
          'ui-droppable-active': 'drop-zone',
          'ui-droppable-hover': 'drop-hover'
        },
        tolerance: 'pointer',
        over: function (event, ui) {
          var itemType = ui.draggable[0].classList[2],
              html, style = 'background-color:#dfefff;';
          if (itemType === 'weapon') { html = 'Equip'; style += ' color:#800000' }
          else if (itemType === 'accessory') { html = 'Use'; style += ' color:#005900' }
          Vue.nextTick(function(){ dragover(html, style, ui.draggable[0].id) });
        },
        out: function (event, ui) { dragout() },
        drop: function (event, ui) {
          dragout();
          var y = Game.active.unit.posY, x = Game.active.unit.posX,
              itemType = ui.draggable[0].classList[2],
              itemId = ui.draggable[0].id.slice(0, -2);
          if (itemType === 'weapon') {
            Game.map[y][x].unit.equipWeapon(itemId);
          }
          else if (itemType === 'accessory') {
            var unit = Game.active.unit, oldHp = unit.hp,
                item = unit.items.filter( i => i.id === itemId )[0];
            Game.map[y][x].unit.useItem(itemId);
            Game.events.push(new ItemEvent(unit, 'used', item, Game.faction));
            if (unit.hp !== oldHp) { Game.events.push(new ConditionEvent(unit, Game.faction)) }
          }
        }
      });
      $( '#top-center' ).droppable({
        tolerance: 'pointer',
        over: function (event, ui) { dragover('Drop', 'color:#654321', ui.draggable[0].id) },
        out: function (event, ui) { dragout() },
        drop: function (event, ui) {
          dragout();
          var y = Game.active.unit.posY, x = Game.active.unit.posX,
              itemList = Game.map[y][x].unit.items,
              itemId = ui.draggable[0].id.slice(0, -2),
              itemIndex = itemList.indexOf(itemList.filter( i => i.id === itemId )[0]),
              item = Game.map[y][x].unit.items.splice(itemIndex, 1)[0];
          item.slots = null;
          Game.map[y][x].items.push(item);
          Game.map[y][x].items.sort(Game.compareItems);
          Game.events.push(new ItemEvent(Game.active.unit, 'dropped', item, Game.faction));
          Vue.nextTick(function(){ Game.makeGroundItemsDraggable('#' + itemId) });
        }
      });
    },
    compareItems: function (a, b) {
      if (a.index < b.index) { return -1 }
      if (a.index > b.index) { return 1 }
      if (a.index === b.index) {
        if (a.id < b.id) { return -1 }
        if (a.id > b.id) { return 1 }
      }
      return 0;
    },
    makeGroundItemsDraggable: function (draggables) {
      $( draggables ).toArray().forEach( function (item) {
        $( '#' + item.id ).draggable({
          cursor: '-webkit-grabbing',
          cursorAt: { top: 16, left: 16 },
          revert: 'invalid',
          zIndex: 95,
          start: function (event, ui) {
            Game.itemtip = null;
            Game.findDroppableSlots(item.classList[1], item.classList[2], item.id);
          },
          stop: function (event, ui) {
            $( '.ui-droppable' ).droppable( 'destroy' );
          }
        });
      });
    },
    cancelEquip: function () {
      this.action = null;
      this.itemtip = null;
    },
    findDroppableSlots: function (itemStatus, itemType, itemId, slotNum) {
      var itemList = this.active.unit[this.convertItemType(itemType)],
          itemMap = [null, null, null, null, null, null],
          itemFootprint, itemIndex,
          slots = [0, 1, 2, 3, 4, 5],
          cinderella, // does the foot (item) fit the shoe (slot)?
          droppables = [];
      for (item of itemList) {
        for (slot of item.slots) {
          itemMap[slot] = item.id;
        }
      }
      if (itemStatus === 'equip') {
        itemFootprint = [];
        slots.filter(s => s !== slotNum);
        itemMap.forEach( function (slot, index) {
          if (slot === itemId) {
            itemFootprint.push(index - slotNum);
            itemMap[index] = null;
          }
        });
      } else if (itemStatus === 'ground') {
        itemIndex = this.active.items.indexOf(this.active.items.filter( i => i.id === itemId )[0]);
        itemFootprint = this.active.items[itemIndex].footprint;
      }
      for (slot of slots) {
        cinderella = true;
        for (toe of itemFootprint) {
          if (itemMap[slot + toe] !== null) { cinderella = false; }
        }
        if (cinderella) { droppables.push(itemType + slot) }
      }
      droppables = droppables.map( s => '#' + s ).join(',');
      this.makeSlotsDroppable(itemStatus, droppables);
    },
    convertItemType: function (itemType) {
      switch (itemType) {
        case 'weapon': return 'weapons';
        case 'clothing': return 'clothing';
        case 'accessory': return 'accessories';
      }
    },
    makeSlotsDroppable: function (draggable, droppables) {
      if (draggable === 'equip') {
        $( droppables ).droppable({
          tolerance: 'pointer',
          drop: function (event, ui) {
            var y = Game.active.unit.posY, x = Game.active.unit.posX,
                itemList = Game.map[y][x].unit.items,
                itemId = ui.draggable[0].id.slice(0, -2),
                itemIndex = itemList.indexOf(itemList.filter( i => i.id === itemId )[0]),
                itemSlots = itemList[itemIndex].slots,
                translation = Number(event.target.id.slice(-1)) - Number(ui.draggable[0].id.slice(-1)),
                itemString = itemSlots.map( s => '#' + itemId + '-' + (s + translation) ).join(',');
            Game.map[y][x].unit.items[itemIndex].slots = [];
            Vue.nextTick(function(){
              Game.map[y][x].unit.items[itemIndex].slots = itemSlots.map( s => s + translation );
              Vue.nextTick(function(){ Game.makeEquipItemsDraggable(itemString) });
            });
          }
        });
      } else if (draggable === 'ground') {
        $( droppables ).droppable({
          tolerance: 'pointer',
          drop: function (event, ui) {
            var y = Game.active.unit.posY, x = Game.active.unit.posX,
                itemList = Game.active.items,
                itemId = ui.draggable[0].id,
                itemIndex = itemList.indexOf(itemList.filter( i => i.id === itemId )[0]),
                item = Game.map[y][x].items.splice(itemIndex, 1)[0],
                itemString;
            item.slots = item.footprint.map( toe => toe + Number(event.target.id.slice(-1)));
            itemString = item.slots.map( s => '#' + itemId + '-' + s ).join(',');
            Game.map[y][x].unit.items.push(item);
            Game.map[y][x].unit.items.sort(Game.compareItems);
            Game.events.push(new ItemEvent(Game.active.unit, 'picked up', item, Game.faction));
            Vue.nextTick(function(){ Game.makeEquipItemsDraggable(itemString) });
          }
        });
      }
    },
    beginTurn: function () {
      var space, effects, unit, oldHp;
      if (this.units.length) {
        for (u of this.units) {
          space = this.map[u.posY][u.posX];
          effects = space.terrain.effects;
          unit = space.unit; oldHp = unit.hp;
          if (effects) {
            for (var effect in effects) {
              unit[effect](effects[effect]);
            }
          }
          if (unit.hp !== oldHp) { Game.events.push(new ConditionEvent(unit, Game.faction)) }
          unit.resetActionPoints();
        }
        this.banner = true;
        this.action = 'waiting';
        if (this.control === 'ai') {
          window.setTimeout(function(){ Game.aiFaction() }, 2000);
        }
      } else {
        this.endTurn();
      }
    },
    getUnits: function (faction) {
      var y, x, space, units = [];
      for (y = 0; y < 16; y++) {
        for (x = 0; x < 16; x++) {
          space = this.map[y][x];
          if (space.unit && space.unit.faction === faction) { units.push(space.unit) }
        }
      }
      return units;
    },
    aiFaction: function () {
      var unitFunc;
      if (this.unitIndex < this.units.length) {
        switch (this.units[this.unitIndex].behavior) {
          case 'dumb': unitFunc = this.aiUnitDumb; break;
          case 'sentry': unitFunc = this.aiUnitSentry; break;
        }
        window.setTimeout(function(){ unitFunc() }, 500);
      } else {
        this.unitIndex = 0;
        this.endTurn();
      }
    },
    aiUnitDumb: function () {
      window.setTimeout(function(){ Game.aiPassControl() }, 500);
    },
    aiUnitSentry: function () {
      var unit = this.units[this.unitIndex];
      this.active = this.map[unit.posY][unit.posX];
      unit = this.active.unit;
      window.setTimeout(function(){
        Game.action = 'attacking';
        Game.showAttackRange();
        Game.aiChooseTarget();
      }, 500);
      window.setTimeout(function(){
        if (Game.target) {
          Game.attackUnit();
          window.setTimeout(function(){
            if (Game.active.unit && Game.target.unit && Game.active.unit.hp !== 0 && Game.target.unit.hp !== 0) {
              window.setTimeout(function(){ Game.aiPassControl() }, 500);
            }
            else {
              window.setTimeout(function(){ Game.aiPassControl() }, 2000);
            }
          }, 1000);
        } else {
          Game.aiPassControl();
        }
      }, 1000);
    },
    aiChooseTarget: function () {
      var y, x, space, targets = [], bestAttack = 0,
          posY = this.active.unit.posY,
          posX = this.active.unit.posX,
          range = this.active.unit.range;
      for (y = Math.max(posY - range[1], 0); y <= Math.min(posY + range[1], 15); y++) {
        for (x = Math.max(posX - range[1], 0); x <= Math.min(posX + range[1], 15); x++) {
          space = this.map[y][x];
          if (space.distance && space.unit && space.unit.friendly !== this.active.unit.friendly) {
            this.targetUnit(y, x);
            targets.push({ posY: y, posX: x, attack: this.combat.activeAtk });
          }
        }
      }
      if (targets.length) {
        targets.forEach( function (target) { if (target.attack > bestAttack) { bestAttack = target.attack } });
        target = shuffle(targets.filter(target => target.attack === bestAttack))[0];
        this.hideAttackRange(target.posY, target.posX);
        this.targetUnit(target.posY, target.posX);
      } else {
        this.cancelAttack();
      }
    },
    aiPassControl: function () {
      this.unitIndex += 1;
      this.aiFaction();
    },
    endTurn: function () {
      if (this.factionIndex < this.factions.length - 1) {
        this.factionIndex += 1;
      } else {
        this.turn += 1;
        this.factionIndex = 0;
      }
      this.action = null;
      this.active = null;
      this.target = null;
      this.beginTurn();
    },
    advanceDialog: function () {
      var next, alignLeft;
      if (this.dialog) {
        if (this.dialog.length > 0) {
          next = this.dialog.splice(0, 1)[0];
          if (this.events.length > 0) {
            alignLeft = !this.events[this.events.length - 1].alignLeft;
          } else {
            alignLeft = true;
          }
          this.events.push(new DialogEvent(next.unit, next.message, alignLeft));
        } else {
          this.dialog = null;
          this.beginTurn();
        }
      }
    },
    scrollEventLog: function () {
      var events = this.events, index, scrollTo, posY;
      if (events[events.length - 1].eventType === 'dialog') {
        if (events.length === 1) { index = 0 }
        else { index = events.length - 2 }
      } else {
        var i = 1;
        while (events[events.length - (i + 1)].eventType !== 'dialog' && i < 8) {
          i++;
        }
        index = events.length - i;
      }
      scrollTo = document.getElementsByClassName('event')[index];
      switch (scrollTo.classList[1]) {
        case 'dialog': posY = scrollTo.offsetTop - 18; break;
        case 'action': posY = scrollTo.offsetTop - 5; break;
      }
      document.getElementById('bottom-center').scrollTop = posY;
      window.setTimeout(function(){
        Game.scrolled = false;
        Game.addFadeClasses(1);
      }, 1);
    },
    addFadeClasses: function (i) {
      var event = $( '.event:nth-last-child(' + i + ')' );
      if (i <= 9 && event.hasClass( 'action' )) {
        this.removeFadeClasses(event);
        event.addClass( 'fade' + i );
        this.addFadeClasses(i + 1);
      }
    },
    removeFadeClasses: function ( selector ) {
      $( selector ).removeClass( 'fade1 fade2 fade3 fade4 fade5 fade6 fade7 fade8 fade9' );
    },
    scrollHandler: function () {
      if (!this.scrolled) {
        this.removeFadeClasses('.event');
        this.scrolled = true;
      }
    }
  },
  components: {
    'row': Row,
    'side-panel': SidePanel,
    'ground-panel': GroundPanel,
    'event-log': EventLog,
    'topo-control': TopoControl,
    'status-panel': StatusPanel,
    'turn-banner': TurnBanner
  }
});

function keyHandler () {
  // console.log('keyCode: ' + event.keyCode); // Developer mode
  if (event.keyCode !== 86) {
    if (Game.control === 'player' && Game.active && Game.active.unit && Game.active.unit.control === 'player') {
      switch (event.keyCode) {
        case 13: // enter
          $( '#btn-confatk' ).trigger( 'click' );
          break;
        case 27: //escape
          $( '#btn-cancel' ).trigger( 'click' );
          break;
        case 65: // a
          if (Game.action !== 'attacking') { $( '#btn-attack' ).trigger( 'click' ); }
          else {
            if (Game.target) { $( '#btn-confatk' ).trigger( 'click' ); }
            else { $( '#btn-cancel' ).trigger( 'click' ); }
          }
          break;
        case 67: // c
          $( '#btn-cancel' ).trigger( 'click' );
          break;
        case 69: // e
          if (Game.action !== 'equipping') { $( '#btn-equip' ).trigger( 'click' ); }
          else { $( '#btn-cancel' ).trigger( 'click' ); }
          break;
        case 77: // m
          if (Game.action !== 'moving') { $( '#btn-move' ).trigger( 'click' ); }
          else { $( '#btn-cancel' ).trigger( 'click' ); }
          break;
      }
    }
  } else { //v
    $( '#tgl-topoview' ).trigger( 'click' );
  }
}

$( document ).keyup( keyHandler );

window.setTimeout(function(){ Game.advanceDialog() }, 1000);

});