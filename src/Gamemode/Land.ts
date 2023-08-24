import { Socket } from "socket.io";
import PlayerSource from "../Entity/PlayerSoucre";
import GameServer from "../Game";
import Arena from "../Native/Arena";
import PhysicEngine from "../PhysicEngine/PhysicEngine";
import Wall from "../Native/Wall";
import Build from "../conder/Build";
import Zombie from "../Entity/zombie/Zombie";
import DashZombie from "../Entity/zombie/DashZombie";
import MiniZombie from "../Entity/zombie/MiniZombie";
import { SpawnEntityInWave } from "../conder/Conder";
import GiantZombie from "../Entity/zombie/GiantZombie";

export default class LandArena extends Arena{
  constructor(game: GameServer) {
    super(game);
    super.tick(2000, 2000);
  }
  public curretWave() {
    const zombie = this.game.Entities.filter((zombie) => { return zombie.physics.typeId.indexOf('zombie') !== -1 });
    const players = this.game.Entities.filter((player) => { return player.physics.typeId.indexOf('players') !== -1 });
    const lengthOfPlayer = players.length || 1;
    // if(!this.startgame) return;
    if(this.spawn) {
      switch (this.wave) {
        case 1: case 2: case 3:
          SpawnEntityInWave(this, Zombie, 7*lengthOfPlayer);
          break;
        case 4: case 5:
          SpawnEntityInWave(this, Zombie, 6*lengthOfPlayer);
          SpawnEntityInWave(this, MiniZombie, 4*lengthOfPlayer);
          break;
        case 6: case 7: case 8: case 9:
          SpawnEntityInWave(this, Zombie, 10*lengthOfPlayer);
          SpawnEntityInWave(this, MiniZombie, 6*lengthOfPlayer);
          SpawnEntityInWave(this, DashZombie, 3*lengthOfPlayer);
          break;
        case 10: case 11: case 12:
          SpawnEntityInWave(this, Zombie, 15*lengthOfPlayer);
          SpawnEntityInWave(this, GiantZombie, 1*lengthOfPlayer);
          break;
        case 13: case 14: case 15:
          SpawnEntityInWave(this, MiniZombie, 15*lengthOfPlayer);
          SpawnEntityInWave(this, Zombie, 7*lengthOfPlayer);
          SpawnEntityInWave(this, GiantZombie, 1*lengthOfPlayer);
          break;
        default:
          SpawnEntityInWave(this, GiantZombie, 10*lengthOfPlayer);
          break;
      }
      this.spawn = false;
    } else if(zombie.length <= 0) {
      if(!this.game.Entities.filter((entity) => { entity.physics.typeId === 'players' })) return;
      this.wave++;
      this.spawn = true;
      const room = this.game.wss.of('/').adapter.rooms.get(this.game.importsId().toString());
      const client: string[] = [];
      if(!room) return;
      room.forEach((socketId) => {
        const player = this.game.Entities.filter((entity) => { return entity.physics.typeId === 'players' }).find((player) => { return player.physics.id === socketId });
        if(player) return;
        client.push(socketId);
      })
      client.forEach((socketId: string) => {
        new PlayerSource(this.game, new PhysicEngine.Vector<number>(0 - 150 + Math.random() * 300, 0 - 150 + Math.random() * 300), socketId);
      })
    }
  };
  public start() {
    // const rock = [Build.Rock1, Build.Rock2, Build.Rock3];
    // for(var i = 0; i < 10; i++) {
    //   const index = Math.floor(Math.random() * rock.length);
    //   if(index > rock.length - 1) {
    //     new Wall(this.game, new PhysicEngine.Vector<number>((0 - this.width) + (Math.random() * (this.width * 2)), (0 - this.height) + (Math.random() * (this.height * 2))), rock[0], 40 + Math.floor(Math.random() * 120))
    //   } else {
    //     new Wall(this.game, new PhysicEngine.Vector<number>((0 - this.width) + (Math.random() * (this.width * 2)), (0 - this.height) + (Math.random() * (this.height * 2))), rock[index], 40 + Math.floor(Math.random() * 120))
    //   }
    // }
    new Wall(this.game, new PhysicEngine.Vector<number>(0, 0), Build.House1, 400);
  }
  public connect(client: Socket) {
    client.join(this.game.importsId().toString());
    new PlayerSource(this.game, new PhysicEngine.Vector<number>(0 - 150 + Math.random() * 300, 0 - 150 + Math.random() * 300), client.id);
    // console.log(this.game.Entities);
    this.game.wss.to(this.game.importsId().toString()).emit('Server/aleary-update', this.game.Entities);
  }
  public disconnect(client: Socket) {
    this.game.event((e) => {
      const player: PlayerSource = e.Entities.find((player: any) => { return player.physics.id === client.id }) as PlayerSource;
      const index = e.Entities.indexOf(player);

      if(index !== -1) {
        e.Entities.splice(index, 1);
      }
    })
  }
  public installion() {
    this.start();
  }
}