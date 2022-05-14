import Phaser from "phaser";

const width = document.body.clientWidth;
const height = document.body.clientHeight;

var config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width,
  height,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 10 },
    },
  },
  scene: {
    preload: preload,
    create: create,
    update: update,
  },
};

new Phaser.Game(config);
let player: Phaser.Types.Physics.Arcade.ImageWithDynamicBody;
let cursors: Phaser.Types.Input.Keyboard.CursorKeys;
let arrows: Phaser.Physics.Arcade.Group;
let level = 1;
let gameOver = false;

setInterval(() => {
  level++;
}, 5000);

function preload(this: Phaser.Scene) {
  this.load.image("sky", "/img/bg.png");
  this.load.image("player", "/img/player.png");
  this.load.image("red", "/img/red.png");
  this.load.image("arrow", "/img/arrow.png");
}

function create(this: Phaser.Scene) {
  const bg = this.add.image(width / 2, height / 2, "sky");
  const scale = Math.max(width / bg.width, height / bg.height);
  bg.setScale(scale, scale);
  const particles = this.add.particles("red");
  const emitter = particles.createEmitter({
    speed: 100,
    scale: { start: 1, end: 0 },
    blendMode: "ADD",
  });

  this.physics.world.setBoundsCollision(true, true, false, false);

  arrows = this.physics.add.group({
    defaultKey: "arrow",
    maxSize: 10,
    accelerationY: 150,
  });

  player = this.physics.add.image(
    Phaser.Math.Between(100, width - 100),
    Phaser.Math.Between(100, height - 100),
    "player"
  );
  player.setVelocity(0, 0);
  player.setBounce(0.1, 0.1);
  player.setCollideWorldBounds(true);

  emitter.startFollow(player);
  this.physics.add.collider(player, arrows, hitArrow);

  cursors = this.input.keyboard.createCursorKeys();
}

function addArrow() {
  arrows.create(Phaser.Math.Between(100, width - 100), -100);
}

function hitArrow() {
  gameOver = true;
  player.disableInteractive();
  player.setAngularAcceleration(200);
  player.setAccelerationY(300);
}

function update(this: Phaser.Scene) {
  if (player.y < 0 - player.height || player.y > height + player.height) {
    level = 0;
    gameOver = false;
    this.scene.restart();
  }
  if (gameOver) return;

  if (cursors.up.isDown) {
    player.setAccelerationY(Math.max(player.body.acceleration.y - 10, -100));
  } else if (cursors.down.isDown) {
    player.setAccelerationY(Math.min(player.body.acceleration.y + 10, 100));
  }
  if (cursors.left.isDown) {
    player.setAccelerationX(Math.max(player.body.acceleration.x - 10, -100));
  } else if (cursors.right.isDown) {
    player.setAccelerationX(Math.min(player.body.acceleration.x + 10, 100));
  }
  if (cursors.space.isDown) {
    player.setAccelerationX(player.body.velocity.x * 10);
  }

  if (!player.body.blocked.none) {
    player.setAcceleration(0, 0);
  }
  arrows.getChildren().forEach((arrow) => {
    const body = arrow.body;
    if (body.position.y > height) {
      arrows.remove(arrow);
    }
  });
  if (
    arrows.getLength() === 0 ||
    (arrows.getLength() < level && Math.random() > 0.5)
  ) {
    addArrow();
  }
}
