import GameServer from "../Game";
import PhysicEngine from "../PhysicEngine/PhysicEngine";
import TeamGroup from "../conder/TeamGroup";
import AI from "./AI";
import Camera from "./Camera";
import Item from "./Item";

export interface Health {
  value: number;
  max: number;
  lastValue: number;
  timeGen: number;
  timeGenMax: number;
  heal: boolean;
}

export default class Entity extends PhysicEngine.SHAPE.Ball {
  public mouse: { x: number; y: number };

  public camera: Camera<Entity>;

  public teamgroup: TeamGroup;

  public AI: AI | undefined;

  public health: Health;

  public items: Item[];
  constructor(game: GameServer) {
    super();
    this.mouse = {
      x: 0,
      y: 0,
    };

    this.physics.typeId = "entity";

    this.physics.angle = 0;

    this.physics.damageBody = 10;

    this.flags.showHealth = true;
    this.flags.showUi = true;
    this.flags.showName = true;
    this.flags.showTag = true;

    this.flags.getAttack = true;
    this.flags.getTarget = true;
    this.flags.showBody = true;
    this.flags.lookAt = false;
    this.flags.autoAngle = true;
    this.graphics.attacking = false;
    this.graphics.movedByVelocity = true;
    this.graphics.movedByAsseccer = true;

    this.camera = new Camera(1450);

    this.teamgroup = new TeamGroup("newteam");

    this.health = {
      value: 120,
      max: 120,
      lastValue: 120,
      timeGen: 0,
      timeGenMax: 2.5,
      heal: true,
    };

    this.items = [];

    game.Entities.push(this);
  }
  onDie(game: GameServer) {}
  update() {
    super.update();

    if (!this.graphics.movedByVelocity) {
      this.velocity = this.velocity.multi(0, 0);
    }

    if (!this.graphics.movedByAsseccer) {
      this.accessor = this.accessor.multi(0, 0);
    }

    if (this.flags.autoAngle && !this.flags.lookAt)
      this.physics.angle = Math.atan2(
        this.mouse.y - this.pos.y,
        this.mouse.x - this.pos.x
      );

    this.items.forEach((item) => {
      item.physics.size = (this.physics.size / 100) * (item.physics.radio * 100);

      // Calculate the x and y components of the offset.
      const xOffset = (item.physics.offset.x * 100) * (item.physics.size / 100);
      const yOffset = (item.physics.offset.y * 100) * (item.physics.size / 100);
      
      // Calculate the new position of the item.
      item.pos.x = this.pos.x +
        (Math.cos(item.physics.angle + item.physics.dirAngle) * xOffset + Math.cos(item.physics.angle + item.physics.dirAngle) * yOffset) / 2;
      item.pos.y = this.pos.y +
        (Math.sin(item.physics.angle + item.physics.dirAngle) * xOffset + Math.sin(item.physics.angle + item.physics.dirAngle) * yOffset) / 2;

      if (this.graphics.attacking) {
        item.curret(item.shot);
      }
      item.update();
    });

    if (this.health.value < 0) {
      this.health.value = 3;
    }
    if (this.health.value < this.health.max && this.health.heal) {
      if (this.health.timeGen >= this.health.timeGenMax) {
        this.health.value *= 1.088;
        this.health.timeGen = 0;
      } else {
        this.health.timeGen += 0.1;
      }
    }
    if (this.health.value > this.health.max) {
      this.health.value = this.health.max;
    }
  }
}
