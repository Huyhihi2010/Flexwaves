import Bullet from "../Native/Bullet";
import { VectorEngine } from "../PhysicEngine/PhysicEngine";

export default class Basic extends Bullet{
  constructor(pos: VectorEngine<number>, size: number, velocity: VectorEngine<number>, angle: number) {
    super(velocity);

    this.pos.x = pos.x;
    this.pos.y = pos.y;

    this.length = 10;

    this.physics.angle = angle;
    this.physics.sizeRadio = 0.1;
    this.physics.size = (size / 100) * (this.physics.sizeRadio * 100);
    this.physics.color.inside = this.physics.color.outside = 'yellow';
  }
  update() {
    super.update();
  }
}