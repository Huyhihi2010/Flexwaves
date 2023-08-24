import GameServer from "../Game";
import PhysicEngine from "../PhysicEngine/PhysicEngine";
import Entity from "./Entity";

export default class AI{
  private viewport: number;
  private distance: number;
  private status: 'Friendly' | 'Neutral' | 'Enemies';
  private target: any;
  constructor(viewport: number, distance: number = viewport / 5, status: 'Friendly' | 'Neutral' | 'Enemies') {
    this.viewport = viewport || 500;
    const distanc = distance * 4 > viewport ? viewport / 8 : distance < 0 ? viewport / 8 : distance;
    this.distance = distanc;
    this.status = status || 'Neutral';
    this.target = null;
  }
  public Status(): 'Friendly' | 'Neutral' | 'Enemies' {
    return this.status;
  }
  public Distance(): number {
    return this.distance;
  }
  public Viewport(): number {
    return this.viewport;
  }
  public setView(viewport: number): AI {
    return new AI(viewport, this.distance, this.status);
  }
  public setStatus(status: 'Friendly' | 'Neutral' | 'Enemies'): AI {
    return new AI(this.viewport, this.distance, status);
  }
  public setDistance(dist: number): AI {
    return new AI(this.viewport, dist, this.status);
  }
  public runOn(game: GameServer, owner: Entity) {
    if(!game) return;
    game.Entities.forEach((entity) => {
      if(entity === owner) return;
      if(!entity.flags.getTarget) return;
      if(this.status === 'Friendly') {
        const dist = Math.hypot(entity.pos.x - owner.pos.x, entity.pos.y - owner.pos.y);
        const enemy = game.Entities.filter((enemy) => {
          return dist - this.viewport - enemy.physics.size < 1 && enemy.teamgroup.ID() !== owner.teamgroup.ID() && entity.flags.getTarget;
        })[0]
        if(enemy && !this.target) {
          if(dist - this.distance - enemy.physics.size < 1) {
            const angle = Math.atan2(enemy.pos.y - owner.pos.y, enemy.pos.x - owner.pos.x);
            const vector = new PhysicEngine.Vector<number>(Math.cos(angle), Math.sin(angle));
            owner.velocity = owner.velocity.createVector(-vector.x, -vector.y);
          }
        }
      } else if(this.status === 'Neutral') {} else if(this.status === 'Enemies') {
        const dist = Math.hypot(entity.pos.x - owner.pos.x, entity.pos.y - owner.pos.y);
        const enemy = game.Entities.filter((enemy) => {
          return dist - this.viewport - enemy.physics.size < 1 && enemy.teamgroup.ID() !== owner.teamgroup.ID() && entity.flags.getTarget;
        })[0]
        if(!!enemy && !this.target && entity.flags.getTarget) {
          const angle = Math.atan2(enemy.pos.y - owner.pos.y, enemy.pos.x - owner.pos.x);
          const vector = new PhysicEngine.Vector<number>(Math.cos(angle), Math.sin(angle));
          owner.velocity = owner.velocity.createVector(vector.x, vector.y);
        }
      }
    })
  }
}