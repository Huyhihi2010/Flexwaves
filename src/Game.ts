import { Server, Socket } from "socket.io";
import Entity from "./Native/Entity";
import Arena from "./Native/Arena";
import Wall from "./Native/Wall";
import LandArena from "./Gamemode/Land";

export type ModeInputs = 'Land' | 'Freeze' | 'Lava' | 'Bosses';

interface GM{
  Land: typeof LandArena,
  Freeze?: null,
  Lava?: null,
  Bosses?: null
}

export const Gamemode: GM = {
  Land: LandArena
}

export default class GameServer{
  private roomId: number = Math.floor(Math.random() * 1000000000000);

  public wss: Server;
  public namespace: string;
  public gamemode: ModeInputs = 'Land';

  public arena: Arena | any;
  public Entities: Entity[] = [];
  public Walls: Wall[] = [];

  constructor(wss: Server, namespace: string, gamemode: ModeInputs) {
    this.wss = wss;
    this.namespace = namespace;
    this.gamemode = gamemode;

    this.arena = null;

    this.Entities = [];
    this.Walls = [];

    this.createUpArena();
  }
  createUpArena() {
    if(!Gamemode[this.gamemode] || !this.gamemode) return console.log(`Failed create arena for server id ${this.roomId}`);
    this.arena = new Gamemode[this.gamemode](this);
  }
  event(e: (_this: GameServer) => void) {
    e(this);
  }
  importsId() {
    return this.roomId;
  }
  onConnect(client: Socket) {
    if(!this.arena) return;
    this.arena.connect(client);
  }
  onDisconnect(client: Socket) {
    if(!this.arena) return;
    this.arena.disconnect(client);
  }
}