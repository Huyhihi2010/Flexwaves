import GameServer from "../Game";
import PhysicEngine, { VectorEngine } from "../PhysicEngine/PhysicEngine";

export default class Wall extends PhysicEngine.SHAPE.ObjectShape1 {
  constructor(game: GameServer, pos: VectorEngine<number>, shape: number[][], size: number = 30) {
    super(pos.x, pos.y);
    this.physics.size = size;
    this.physics.color.inside = this.physics.color.outside = '#222222';
    super.createUpShape(shape);
    game.Walls.push(this);
  }
  update() {
    super.update();
  }
}