import GameServer from "../../Game";
import AI from "../../Native/AI";
import Entity from "../../Native/Entity";
import PhysicEngine, { VectorEngine } from "../../PhysicEngine/PhysicEngine";
import Zombie from "./Zombie";

export default class GiantZombie extends Entity{
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

    this.physics.name = 'Giant Zombie';

    this.physics.size = 90 + Math.random() * 5;

    this.physics.damageBody = 15;

    this.physics.speed = 2.16;

    this.health.value = this.health.max = 1500;
    this.health.heal = false;

    this.AI = new AI(2000, 200, 'Enemies');
  }
  onDie(game: GameServer): void {
    for(var i = 0; i < 5; i++) {
      new Zombie(game, new PhysicEngine.Vector<number>(this.pos.x - this.physics.size + (Math.random() * (this.physics.size * 2)), this.pos.y - this.physics.size + (Math.random() * (this.physics.size * 2))));
    }
  }
  update() {
    super.update();
  }
}