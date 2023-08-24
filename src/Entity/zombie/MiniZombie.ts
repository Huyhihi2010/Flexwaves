import GameServer from "../../Game";
import AI from "../../Native/AI";
import Entity from "../../Native/Entity";
import { VectorEngine } from "../../PhysicEngine/PhysicEngine";

export default class MiniZombie extends Entity{
  constructor(game: GameServer, pos: VectorEngine<number>) {
    super(game);
    this.teamgroup = this.teamgroup.setNamespace('Zombie');

    this.pos = pos;

    const color = ['#156612', '#2B8128', '#0DB507', '#269022'];
    const indexColor = Math.floor(Math.random()*color.length);
    const random = indexColor > 0 && indexColor < color.length ? indexColor : 2;

    this.physics.color.inside = color[random];
    this.physics.color.outside = color[random];

    this.physics.typeId = 'entity zombie';

    this.physics.name = 'mini zombie';

    this.physics.size = 20 + Math.random() * 5;

    this.physics.damageBody = 2;

    this.physics.speed = 6;

    this.health.max = 70;
    this.health.value = this.health.max;

    this.AI = new AI(1000, 200, 'Enemies');
  }
  update() {
    super.update();
  }
}