import Arena from "../Native/Arena";
import Entity from "../Native/Entity";
import PhysicEngine from "../PhysicEngine/PhysicEngine";

export function SpawnEntityInWave(arena: Arena, entity: any, count: number) {
  for(var i = 0; i < count; i++) {
    let x = 0;
    let y = 0;
    if(Math.random() < 0.5) {
      x = Math.random() < 0.5 ? 0 - 100 : arena.width * 2 + 100;
      y = Math.random() * arena.height * 2;
    } else {
      x = Math.random() * arena.width * 2;
      y = Math.random() < 0.5 ? 0 - 100 : arena.height * 2 + 100;
    }
    new entity(arena.game, new PhysicEngine.Vector<number>((-arena.width) + x, (-arena.height) + y))
  }
}