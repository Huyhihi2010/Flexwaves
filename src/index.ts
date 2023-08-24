import express from "express";
import * as ws from "socket.io";
import * as http from "http";
import * as core from "express-serve-static-core";
import PhysicEngine from "./PhysicEngine/PhysicEngine";
import GameServer from "./Game";
import Entity from "./Native/Entity";
import PlayerSource from "./Entity/PlayerSoucre";

const app: core.Express = express() as core.Express;
const server: http.Server = http.createServer(app) as http.Server;
const wss: ws.Server = new ws.Server(server);
const port = process.env.PORT || 3000;

const games: GameServer[] = [];

app.use(express.static('public'));  

app.get('/', (req, res) => {
  res.sendFile(__dirname+'/public/index.html');
})

app.get('/custom-shape', (req, res) => {
  res.sendFile('E:/wave-multiplayer/public/custom.html');
})

server.listen(port, () => {
  const land = new GameServer(wss, 'land', 'Land');

  games.push(land);

  games.forEach((gameServer) => {
    console.log(`GameServer: ${gameServer.importsId()} started!`);
  })

  console.log(`Server running at port *::${port}`);
})

wss.on('connection', (socket) => {
  console.log(socket.id);
  games[0].onConnect(socket);
  socket.on('Client/send-mouse', (mouse) => {
    games[0].event((e) => {
      const player: PlayerSource = e.Entities.find((_pl: any) => { return _pl.physics.id === socket.id }) as PlayerSource;
      if(!player) return;
      player.mouse.x = mouse.x + player.pos.x;
      player.mouse.y = mouse.y + player.pos.y;

      player.items.forEach((item) => {
        item.physics.angle = player.physics.angle;
      })
    })
  })
  socket.on('Client/attacking', (inputs) => {
    games[0].event((e) => {
      const player: PlayerSource = e.Entities.find((_pl: any) => { return _pl.physics.id === socket.id }) as PlayerSource;
      if(!player) return;
      player.graphics.attacking = inputs;
    })
  })
  socket.on('Client/move', (inputs) => {
    games[0].event((e) => {
      const player: PlayerSource = e.Entities.find((_pl: any) => { return _pl.physics.id === socket.id }) as PlayerSource;
      if(!player) return;
      player.inputs = inputs;
    })
  })
  socket.on('Client/mobile-move', (client) => {
    games[0].event((e) => {
      const player: PlayerSource = e.Entities.find((_pl: any) => { return _pl.physics.id === socket.id }) as PlayerSource;
      if(!player) return;
      if(!client.start) return player.flags.moved = false;
      player.flags.moved = true;
      player.velocity.x = client.x;
      player.velocity.y = client.y;
    })
  })
  socket.on('Client/mobile-mouse', (client) => {
    games[0].event((e) => {
      const player: PlayerSource = e.Entities.find((_pl: any) => { return _pl.physics.id === socket.id }) as PlayerSource;
      if(!player) return;
      if(!client.start) return player.graphics.attacking = false;
      player.graphics.attacking = true;
      player.flags.autoAngle = false;
      player.physics.angle = client.angle;
      player.items.forEach((item) => {
        item.physics.angle = player.physics.angle;
      })
    })
  })
  socket.on('Game/inputs-system', (data) => {
    socket.emit('Game/mobile-mode', data);
  })
  socket.on('disconnect', () => {
    games[0].onDisconnect(socket);
  })
})

export {
  games
}