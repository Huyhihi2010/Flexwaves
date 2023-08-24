import GameServer from "../../Game";
import AI from "../../Native/AI";
import Entity from "../../Native/Entity";
import { VectorEngine } from "../../PhysicEngine/PhysicEngine";

export default class DashZombie extends Entity{
  public Dash: {
    time: {
      value: number;
      max: number;
    };
    power: number;
  }
  constructor(game: GameServer, pos: VectorEngine<number>) {
    super(game);
    this.teamgroup = this.teamgroup.setNamespace('Zombie');

    this.pos = pos;

    const color = ['#B2681E', '#723F0D', '#583817', '#361E06'];
    const indexColor = Math.floor(Math.random()*color.length);
    const random = indexColor > 0 && indexColor < color.length ? indexColor : 2;

    this.physics.color.inside = color[random];
    this.physics.color.outside = color[random];

    this.physics.typeId = 'entity zombie';

    this.physics.name = 'Dash Zom';

    this.physics.size = 30 + Math.random() * 5;

    this.physics.damageBody = 4;

    this.physics.speed = 2.66;

    this.health.value = this.health.max = 200;

    this.AI = new AI(1000, 200, 'Enemies');

    this.Dash = {
      time: {
        value: 2,
        max: 2
      },
      power: 10
    }
  }
  private DashMode() {
    if(this.Dash.time.value <= 0) {
      this.Dash.time.value = this.Dash.time.max;
    } else {
      this.Dash.time.value -= .01;
    }

    if(this.Dash.time.value <= .01) {
      this.accessor = this.accessor.add(this.velocity.x * this.Dash.power, this.velocity.y * this.Dash.power);
    }
  }
  public update() {
    this.DashMode();
    super.update();
  }
}