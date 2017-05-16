var createGame = require('../lib/game')
var THREE = require('three')
var voxel = require('voxel')
var toolbar = require('toolbar')
var blockSelector = toolbar({el: '#tools'})
var skin = require('minecraft-skin')

window.game = createGame({
  generate: voxel.generator['Valley'],
  texturePath: './textures/',
  materials: [['grass', 'dirt', 'grass_dirt'], 'brick', 'dirt', 'obsidian', 'crate'],
  cubeSize: 25,
  chunkSize: 32,
  chunkDistance: 2,
  startingPosition: [35, 64, 35],
  worldOrigin: [0,0,0]
})

var maxogden = skin(game.THREE, 'maxogden.png').createPlayerObject();
maxogden.position.set(0, 62, 20);
game.scene.add(maxogden);

var substack = skin(game.THREE, 'substack.png').createPlayerObject();
substack.position.set(0, 62, -20);
game.scene.add(substack);

var martindale = skin(game.THREE, 'martindale.png').createPlayerObject();
martindale.position.set(-20, 62, 0);
game.scene.add(martindale);

var currentMaterial = 1;
var tally = document.querySelector('.tally .count')
var erase = true
var container = document.querySelector('#container');

blockSelector.on('select', function(material) {
  var idx = game.materials.indexOf(material)
  if(idx === -1) {
    for(var m = 0; m < game.materials.length; m++) {
      if(typeof game.materials[m] === 'object' && game.materials[m][0] === material) idx = m
    }
  }
  if (idx > -1) currentMaterial = idx + 1
})

game.on('collision', function (item) {
  incrementBlockTally()
  game.removeItem(item)
})

game.appendTo('#container')

game.on('mousedown', function (pos) {
  var cid = game.voxels.chunkAtPosition(pos)
  var vid = game.voxels.voxelAtPosition(pos)
  if (erase) {
    explode(pos, game.getBlock(pos))
    game.setBlock(pos, 0)
  } else {
    game.createBlock(pos, currentMaterial)
  }
});

container.addEventListener('click', handleClick);

window.addEventListener('keyup', ctrlToggle)
window.addEventListener('keydown', ctrlToggle)

function handleClick () {
  game.requestPointerLock(container);
}

function incrementBlockTally() {
  var c = +tally.innerText
  ++c
  tally.innerText = c
}

function createDebris (pos, value) {
  var mesh = new THREE.Mesh(
    new THREE.CubeGeometry(4, 4, 4),
    game.material
  )
  mesh.geometry.faces.forEach(function (face) {
    face.materialIndex = value - 1
  })
  mesh.translateX(pos.x)
  mesh.translateY(pos.y)
  mesh.translateZ(pos.z)
  
  return {
    mesh: mesh,
    size: 4,
    collisionRadius: 22,
    value: value
  }
}

function explode (pos, value) {
  if (!value) return
  var item = createDebris(pos, value)
  item.velocity = {
    x: (Math.random() * 2 - 1) * 0.05,
    y: (Math.random() * 2 - 1) * 0.05,
    z: (Math.random() * 2 - 1) * 0.05,
  }
  game.addItem(item)
  setTimeout(function (item) {
    game.removeItem(item)
  }, 15 * 1000 + Math.random() * 15 * 1000, item)
}
