import PhysicEngine, { VectorEngine } from "../PhysicEngine/PhysicEngine";

export default class Bullet extends PhysicEngine.SHAPE.Ball{
  public length: number;
  constructor(velocity: VectorEngine<number>) {
    super();
    this.physics.damage = 10;
    this.physics.speed = 17;
    this.physics.sizeRadio = 1;
    this.physics.angle = 0;
    this.physics.fill = true;

    this.graphics.lifeTime = 1;

    this.length = 1;

    this.velocity = velocity;
  }
  public update(): void {
    this.graphics.lifeTime -= .01;

    this.flags.moved = true;

    super.update();
  }
}