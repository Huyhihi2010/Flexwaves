import GameServer from "../Game";
import Entity from "../Native/Entity";
import Item from "../Native/Item";
import { VectorEngine } from "../PhysicEngine/PhysicEngine";
import TeamGroup from "../conder/TeamGroup";
import MP5 from "../items/MP5";

export interface Inputs{
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
}

export default class PlayerSource extends Entity{
  public inputs: Inputs;
  constructor(game: GameServer, pos: VectorEngine<number>, id: string) {
    super(game);

    const color = ['#C9891C', '#DFB772', '#5B4A2B', '#F7E185'];
    const indexColor = Math.floor(Math.random()*color.length);
    const random = indexColor > 0 && indexColor < color.length ? indexColor : 2;

    this.physics.color.inside = color[random];
    this.physics.color.outside = color[random];

    this.camera = this.camera.setView(1500);

    this.physics.typeId = 'players';

    this.physics.id = id;

    this.physics.name = `Guest#${Math.floor(Math.random() * 10000)}`;

    this.teamgroup = new TeamGroup('players');

    this.physics.damageBody = 0;

    this.health.max = 400;
    this.health.value = this.health.max;

    this.pos = pos;

    this.inputs = {
      up: false,
      down: false,
      left: false,
      right: false
    }

    new MP5(this);
  }
  move() {
    if(this.inputs.up || this.inputs.down || this.inputs.left || this.inputs.right) {
      this.flags.moved = true;
    } else {
      this.flags.moved = false;
    }
    if(this.inputs.up) {
      this.velocity.y = -1;
    }
    if(this.inputs.down) {
      this.velocity.y = 1;
    }
    if(this.inputs.left) {
      this.velocity.x = -1;
    }
    if(this.inputs.right) {
      this.velocity.x = 1;
    }
  }
  update() {
    this.move();
    super.update();
  }
}