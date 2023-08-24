import { games } from "..";
import GameServer from "../Game";
import PhysicEngine from "../PhysicEngine/PhysicEngine";

function TickLoop(game: GameServer) {
  game.Entities.forEach((entity) => {
    if(entity.AI) {
      entity.AI.runOn(game, entity);
    }
  })
  game.Entities.forEach((entity, index) => {
    if(entity.health.value > 5) {
      entity.update();
    } else {
      entity.onDie(game);
      game.Entities.splice(index, 1);
    }
    if(game.arena) {
      if(entity.pos.x - entity.physics.size < 0 - game.arena.width) {
        entity.accessor.x += entity.physics.speed;
      }
      if(entity.pos.x + entity.physics.size > 0 + game.arena.width) {
        entity.accessor.x -= entity.physics.speed;
      }
      if(entity.pos.y - entity.physics.size < 0 - game.arena.height) {
        entity.accessor.y += entity.physics.speed;
      }
      if(entity.pos.y + entity.physics.size > 0 + game.arena.height) {
        entity.accessor.y -= entity.physics.speed;
      }
    }
    for(var i = 0; i < game.Entities.length; i++) {
      if(i === index) continue;
      entity.items.forEach((item) => {
        item.projectiles.forEach((proj, index2) => {
          if(PhysicEngine.CollisionChecking.Circle(proj.pos, game.Entities[i].pos, proj.physics.size, game.Entities[i].physics.size) && !!game.Entities[i].flags.getTouch) {
            if(entity.teamgroup.ID() !== game.Entities[i].teamgroup.ID()) {
              if(game.Entities[i].health.value < 5 && !game.Entities[i].flags.getAttack) return;
              PhysicEngine.CollisionType.Circle(proj, game.Entities[i]);
              game.Entities[i].health.value -= proj.physics.damage;
              item.projectiles.splice(index2, 1);
            }
          }
        })
      })
      if(PhysicEngine.CollisionChecking.Circle(entity.pos, game.Entities[i].pos, entity.physics.size, game.Entities[i].physics.size) && !!game.Entities[i].flags.getTouch) {
        PhysicEngine.CollisionType.Circle(entity, game.Entities[i]);
        if(entity.teamgroup.ID() !== game.Entities[i].teamgroup.ID()) {
          if(game.Entities[i].health.value < 5 && !game.Entities[i].flags.getAttack) return;
          game.Entities[i].health.value -= entity.physics.damageBody;
        }
      }
    }
    game.Walls.forEach((wall) => {
      wall.bodies.forEach((body) => {
        entity.items.forEach((item) => {
          item.projectiles.forEach((proj, index2) => {
            if(PhysicEngine.CollisionChecking.CollisionWall1(proj, body)) {
              item.projectiles.splice(index2, 1);
            }
          })
        })
        if(PhysicEngine.CollisionChecking.CollisionWall1(entity,body)) {
          PhysicEngine.CollisionType.PenResWallPos(entity, body);
          PhysicEngine.CollisionType.RenResWallVect(entity, body);
        }
      })
    })
  })
  game.Walls.forEach((wall, index) => {
    wall.update();
    for(var i = 0; i < game.Walls.length; i++) {
      if(i === index) continue;
      // wall.bodies.forEach((body1) => {
      //   game.Walls[i].bodies.forEach((body2) => {
      //     PhysicEngine.CollisionType.CollisionSTS1(body1, body2)
      //   })
      // })
      PhysicEngine.CollisionType.CollisionSTS1(wall, game.Walls[i]);
    }
  })
}

export enum ArenaState {
  start      = 1,
  run        = 2,
  end        = 3,
  kill       = 4
}

export default class Arena{
  public game: GameServer;
  public width: number;
  public height: number;
  public loop: any;
  public state: number;
  public color: string;

  public wave: number;
  public time: {
    timeleft: number;
  }
  public startgame: boolean;
  public spawn: boolean;
  constructor(game: GameServer) {
    this.game = game;
    this.width = 500;
    this.height = 500;
    this.loop = null;
    this.state = ArenaState.start;
    this.color = '#011';

    this.wave = 1;
    this.time = {
      timeleft: 0
    }
    this.startgame = false;
    this.spawn = true;

    this.whenStart();
  }
  public whenStart() {
    let lastTime = Date.now();
    let delta = 0;

    const _this: any = this;
    const Timer: NodeJS.Timer = setInterval(() => {
      if(!this.startgame) return;
      this.time.timeleft++;
    }, 1000)
    const System: NodeJS.Timer = setInterval(() => {
      const now = Date.now();
      delta = now - lastTime;
      lastTime = now;
      if(!_this) {
        clearInterval(System);
        clearInterval(Timer);
        return;
      };
      if(this.state === ArenaState.start) {
        _this.installion();
        this.state = ArenaState.run;
      } else if(this.state === ArenaState.run) {
        _this.curretWave();
        TickLoop(this.game);
        const looper = {
          Entities: this.game.Entities,
          Walls: this.game.Walls,
          Arena: {
            width: this.width,
            height: this.height,
            color: this.color,
            gamemode: this.game.gamemode
          },
          ui: {
            wave: this.wave
          }
        }
        this.game.wss.to(this.game.importsId().toString()).emit('Server/aleary-update', looper);
        const listener = this.game.wss.getMaxListeners();
        if(listener >= 10) {
          this.game.wss.removeAllListeners('Server/aleary-update');
        }
      } else if(this.state === ArenaState.end) {
        console.log(`${this.game.namespace} #${this.game.importsId()} has stop`);
        this.state = ArenaState.kill;
      } else if(this.state === ArenaState.kill) {
        const index = games.indexOf(this.game);
        if(index !== -1) {
          games.splice(index, 1);
          clearInterval(System);
          clearInterval(Timer);

        }
      }
    } , 1000 / 60)
  }
  public tick(w: number = 500, h: number = 500) {
    this.width = w;
    this.height = h;
  }
}