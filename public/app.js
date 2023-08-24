// import { Server, Socket } from "socket.io"

(function () {
  const socket = io();
  const canvas = document.querySelector("canvas"),
    ctx = canvas.getContext("2d");
  const box_items = [
    document.querySelectorAll('button.item-container')[0],
    document.querySelectorAll('button.item-container')[1],
    document.querySelectorAll('button.item-container')[2]
  ];
  const itemData = [
    new Image(),
    new Image(),
    new Image()
  ]
  class Camera {
    constructor(context, settings = {}) {
      this.distance = settings.distance || 1000.0;
      this.lookAt = settings.initialPosition || [0, 0];
      this.context = context;
      this.fieldOfView = settings.fieldOfView || Math.PI / 4.0;
      this.viewport = {
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        width: 0,
        height: 0,
        scale: [settings.scaleX || 1.0, settings.scaleY || 1.0],
      };
      this.init();
    }

    /**
     * Camera Initialization
     * -Add listeners.
     * -Initial calculations.
     */
    init() {
      // this.addListeners();
      this.updateViewport();
    }

    /**
     * Applies to canvas context the parameters:
     *  -Scale
     *  -Translation
     */
    begin() {
      this.context.save();
      this.applyScale();
      this.applyTranslation();
    }

    /**
     * 2d Context restore() method
     */
    end() {
      this.context.restore();
    }

    /**
     * 2d Context scale(Camera.viewport.scale[0], Camera.viewport.scale[0]) method
     */
    applyScale() {
      this.context.scale(this.viewport.scale[0], this.viewport.scale[1]);
    }

    /**
     * 2d Context translate(-Camera.viewport.left, -Camera.viewport.top) method
     */
    applyTranslation() {
      this.context.translate(-this.viewport.left, -this.viewport.top);
    }

    /**
     * Camera.viewport data update
     */
    updateViewport() {
      this.aspectRatio = this.context.canvas.width / this.context.canvas.height;
      this.viewport.width = this.distance * Math.tan(this.fieldOfView);
      this.viewport.height = this.viewport.width / this.aspectRatio;
      this.viewport.left = this.lookAt[0] - this.viewport.width / 2.0;
      this.viewport.top = this.lookAt[1] - this.viewport.height / 2.0;
      this.viewport.right = this.viewport.left + this.viewport.width;
      this.viewport.bottom = this.viewport.top + this.viewport.height;
      this.viewport.scale[0] = this.context.canvas.width / this.viewport.width;
      this.viewport.scale[1] =
        this.context.canvas.height / this.viewport.height;
    }

    /**
     * Zooms to certain z distance
     * @param {*z distance} z
     */
    zoomTo(z) {
      gsap.to(this, {
        distance: z,
      });
      this.updateViewport();
    }

    /**
     * Moves the centre of the viewport to new x, y coords (updates Camera.lookAt)
     * @param {x axis coord} x
     * @param {y axis coord} y
     */
    moveTo(x, y) {
      this.lookAt[0] = x;
      this.lookAt[1] = y;
      this.updateViewport();
    }

    moveTo2(x, y) {
      gsap.to(this.lookAt, {
        [0]: x,
        [1]: y,
      });
      this.updateViewport();
    }

    /**
     * Transform a coordinate pair from screen coordinates (relative to the canvas) into world coordinates (useful for intersection between mouse and entities)
     * Optional: obj can supply an object to be populated with the x/y (for object-reuse in garbage collection efficient code)
     * @param {x axis coord} x
     * @param {y axis coord} y
     * @param {obj can supply an object to be populated with the x/y} obj
     * @returns
     */
    screenToWorld(x, y, obj) {
      obj = obj || {};
      obj.x = x / this.viewport.scale[0] + this.viewport.left;
      obj.y = y / this.viewport.scale[1] + this.viewport.top;
      return obj;
    }

    /**
     * Transform a coordinate pair from world coordinates into screen coordinates (relative to the canvas) - useful for placing DOM elements over the scene.
     * Optional: obj can supply an object to be populated with the x/y (for object-reuse in garbage collection efficient code).
     * @param {x axis coord} x
     * @param {y axis coord} y
     * @param {obj can supply an object to be populated with the x/y} obj
     * @returns
     */
    worldToScreen(x, y, obj) {
      obj = obj || {};
      obj.x = (x - this.viewport.left) * this.viewport.scale[0];
      obj.y = (y - this.viewport.top) * this.viewport.scale[1];
      return obj;
    }

    /**
     * Event Listeners for:
     *  -Zoom and scroll around world
     *  -Center camera on "R" key
     */
    addListeners() {
      window.onwheel = (e) => {
        if (e.ctrlKey) {
          // Your zoom/scale factor
          let zoomLevel = this.distance - e.deltaY * 20;
          if (zoomLevel <= 1) {
            zoomLevel = 1;
          }

          this.zoomTo(zoomLevel);
        } else {
          // Your track-pad X and Y positions
          const x = this.lookAt[0] + e.deltaX * 2;
          const y = this.lookAt[1] + e.deltaY * 2;

          this.moveTo(x, y);
        }
      };

      window.addEventListener("keydown", (e) => {
        if (e.key === "r") {
          this.zoomTo(1000);
          this.moveTo(0, 0);
        }
      });
    }
  }

  class Bullet {
    constructor(pos, physics, flags, length) {
      this.pos = pos;
      this.physics = physics;
      this.flags = flags;
      this.length = length;
    }
    draw() {
      if(this.length !== undefined || this.length <= 0) {
        // Save the current drawing state
        ctx.save();

        ctx.translate(this.pos.x, this.pos.y);
        ctx.rotate(this.physics.angle + -Math.PI / 2);

        // Set the stroke style
        ctx.strokeStyle = this.physics.color.outside;
        ctx.lineWidth = 2;

        ctx.beginPath();

        // Set the fill style
        ctx.fillStyle = this.physics.color.inside;

        // Move the cursor to the starting point of the drop
        ctx.moveTo(0 - this.physics.size, 0);

        // Draw the drop
        ctx.lineTo(0, 0 - this.physics.size * this.length);
        ctx.lineTo(0 + this.physics.size, 0);
        ctx.arc(0, 0, this.physics.size, 0, Math.PI * 2, false);

        // Stroke the drop
        ctx.stroke();

        // Fill the drop
        if(this.physics.fill) ctx.fill();

        ctx.closePath();

        // Restore the previous drawing state
        ctx.restore();
      }
    }
  }

  class Entity {
    constructor(pos, physics, flags, health, teamgroup) {
      this.pos = pos;
      this.physics = physics;
      this.flags = flags;
      this.health = health;
      this.teamgroup = teamgroup;
    }
    drawTag() {
      if (!this.teamgroup || !this.flags.showTag || !this.flags.showUi) return;
      const width =
          (this.health.max / (this.health.max / 100)) *
          (this.physics.size / 45),
        height = 3;
      ctx.save();
      ctx.translate(this.pos.x, this.pos.y + this.physics.size + 27 + height);
      ctx.textAlign = "right";
      ctx.fillStyle = "#ffffff";
      ctx.fillText(this.teamgroup.namespace, 0 + width / 2, 0);
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 0.1;
      ctx.strokeText(this.teamgroup.namespace, 0 + width / 2, 0);
      ctx.restore();
    }
    drawName() {
      if (!this.physics || !this.flags.showName || !this.flags.showUi) return;
      const width =
          (this.health.max / (this.health.max / 100)) *
          (this.physics.size / 45),
        height = 3;
      ctx.save();
      ctx.translate(this.pos.x, this.pos.y + this.physics.size + 14 - height);
      ctx.textAlign = "left";
      ctx.fillStyle = "#ffffff";
      ctx.fillText(this.physics.name, 0 - width / 2, 0);
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 0.1;
      ctx.strokeText(this.physics.name, 0 - width / 2, 0);
      ctx.restore();
    }
    drawHealth() {
      if (!this.health || !this.flags.showHealth || !this.flags.showUi) return;
      const width =
          (this.health.max / (this.health.max / 100)) *
          (this.physics.size / 45),
        height = 3;
      const _width =
        (this.health.value / (this.health.max / 100)) *
        (this.physics.size / 45);
      ctx.save();
      ctx.translate(this.pos.x, this.pos.y + this.physics.size + 17);

      // bar

      ctx.fillStyle = "#000";
      ctx.fillRect(0 - width / 2, 0 - height, width, height * 2);

      ctx.beginPath();
      ctx.arc(0 - width / 2 - height / 2, 0, height, 0, Math.PI * 2, false);
      ctx.fillStyle = "#000";
      ctx.fill();
      ctx.closePath();

      ctx.beginPath();
      ctx.arc(0 + width / 2 + height / 2, 0, height, 0, Math.PI * 2, false);
      ctx.fillStyle = "#000";
      ctx.fill();
      ctx.closePath();

      // value

      ctx.fillStyle = this.physics.color.inside;
      ctx.fillRect(0 - width / 2, 0 - height, _width, height * 2);

      ctx.beginPath();
      ctx.arc(0 - width / 2 - height / 2, 0, height, 0, Math.PI * 2, false);
      ctx.fillStyle = this.physics.color.inside;
      ctx.fill();
      ctx.closePath();

      ctx.beginPath();
      ctx.arc(
        0 + _width - width / 2 + height / 2,
        0,
        height,
        0,
        Math.PI * 2,
        false
      );
      ctx.fillStyle = this.physics.color.inside;
      ctx.fill();
      ctx.closePath();

      ctx.restore();
    }
    draw() {

      ctx.save();
      ctx.strokeStyle = this.physics.color.outside;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(this.pos.x, this.pos.y, this.physics.size, 0, Math.PI * 2, false);
      ctx.fillStyle = this.physics.color.inside;
      ctx.fill();
      ctx.stroke();
      ctx.closePath();
      ctx.restore();

      this.drawHealth();
      this.drawTag();
      this.drawName();
    }
  }

  class Wall {
    constructor(pos, physics, flags) {
      this.pos = pos;
      this.physics = physics;
      this.flags = flags;
    }
    draw() {
      if (!ctx) return;
      ctx.save();
      ctx.translate(this.pos.x, this.pos.y);
      ctx.rotate(this.physics.angle);
      ctx.beginPath();
      for (var i = 0; i < this.physics.shape.length; i++) {
        var _a = this.physics.shape[i],
          x = _a[0],
          y = _a[1];
        var posX = x * this.physics.size;
        var posY = y * this.physics.size;
        if (i === 0) {
          ctx.moveTo(posX, posY);
        } else {
          ctx.lineTo(posX, posY);
        }
      }
      ctx.closePath();
      ctx.fillStyle = this.physics.color.inside;
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = this.physics.color.outside;
      ctx.stroke();
      ctx.restore();
    }
  }

  class Arena {
    constructor(width, height, color, gamemode) {
      this.width = width;
      this.height = height;
      this.color = color;
      this.gamemode = gamemode;
    }
    draw() {
      ctx.save();
      ctx.translate(0, 0);
      ctx.fillStyle = this.color;
      ctx.fillRect(
        0 - this.width,
        0 - this.height,
        this.width * 2,
        this.height * 2
      );
      ctx.restore();
    }
  }

  class Item {
    constructor(pos, physics) {
      this.pos = pos;
      this.physics = physics;
    }
    draw() {
      this.physics.layer.forEach((layer) => {
        ctx.save();
        ctx.translate(
          this.pos.x +
            Math.cos(this.physics.angle + this.physics.dirAngle + layer.dirAngle) *
              ((this.physics.size / 100) * (layer.offset.x * 100)),
          this.pos.y +
            Math.sin(this.physics.angle + this.physics.dirAngle + layer.dirAngle) *
              ((this.physics.size / 100) * (layer.offset.y * 100))
        );
        ctx.rotate(this.physics.angle + this.physics.dirAngle + layer.dirAngle);
        ctx.beginPath();
        switch (layer.type) {
          case 'build':
            for (var i = 0; i < layer.shape.length; i++) {
              var _a = layer.shape[i],
                x = _a[0],
                y = _a[1];
              var posX = x * ((this.physics.size / 100) * (layer.radio * 100));
              var posY = y * ((this.physics.size / 100) * (layer.radio * 100));
              if (i === 0) {
                ctx.moveTo(posX, posY);
              } else {
                ctx.lineTo(posX, posY);
              }
            }
            break;
          case 'circle':
            ctx.save();
            ctx.strokeStyle = layer.color.outside;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(0, 0, ((this.physics.size / 100) * (layer.radio * 100)), 0, layer.angle, false);
            ctx.fillStyle = layer.color.inside;
            ctx.fill();
            ctx.stroke();
            ctx.closePath();
            ctx.restore();
            break;
        }
        ctx.closePath();
        ctx.fillStyle = layer.color.inside;
        ctx.fill();
        ctx.lineWidth = layer.lineWidth;
        ctx.strokeStyle = layer.color.outside;
        ctx.stroke();
        ctx.restore();
      });
    }
  }

  function installCanvas() {
    canvas.width = innerWidth;
    canvas.height = innerHeight;
  }

  window.addEventListener('mousemove', (e) => {
    e.preventDefault();
    socket.emit('Client/send-mouse', ({ x: e.clientX - canvas.width / 2, y: e.clientY - canvas.height / 2 }));
  })

  window.addEventListener('mousedown', () => {
    socket.emit('Client/attacking', true);
  })

  window.addEventListener('mouseup', () => {
    socket.emit('Client/attacking', false);
  })

  function moved() {
    const inputs = {
      up: false,
      down: false,
      left: false,
      right: false,
    };
    canvas.addEventListener("keydown", (e) => {
      switch (e.key) {
        case "q":
          const image = canvas.toDataURL();
          const download = document.querySelector('[download-mode]');
          download.href = image;
          download.download = 'screenshot.png';
          download.click();
          break;
        case "w":
        case "ArrowUp":
          inputs.up = true;
          socket.emit("Client/move", inputs);
          break;
        case "s":
        case "ArrowDown":
          inputs.down = true;
          socket.emit("Client/move", inputs);
          break;
        case "a":
        case "ArrowLeft":
          inputs.left = true;
          socket.emit("Client/move", inputs);
          break;
        case "d":
        case "ArrowRight":
          inputs.right = true;
          socket.emit("Client/move", inputs);
          break;
      }
    });
    canvas.addEventListener("keyup", (e) => {
      switch (e.key) {
        case "w":
        case "ArrowUp":
          inputs.up = false;
          socket.emit("Client/move", inputs);
          break;
        case "s":
        case "ArrowDown":
          inputs.down = false;
          socket.emit("Client/move", inputs);
          break;
        case "a":
        case "ArrowLeft":
          inputs.left = false;
          socket.emit("Client/move", inputs);
          break;
        case "d":
        case "ArrowRight":
          inputs.right = false;
          socket.emit("Client/move", inputs);
          break;
      }
    });
  }

  async function isMobile(devicePixelRatio) {
    if (devicePixelRatio === 1) {
      return false;
    } else if (devicePixelRatio === 2) {
      return true;
    } else {
      throw "Not can checking mobile mode";
    }
  }

  async function loadMode(ok) {
    if (ok) {
      const Control = document.querySelector("div.control-inputs");
      Control.style.display = "block";

      function mouseForMobile() {
        const input = document.querySelector("div.inputs-mouse div.inputs");
        const Control = document.querySelector("div.inputs-mouse");
        const x = Control.offsetLeft + input.offsetLeft,
          y = Control.offsetTop + input.offsetTop;
        var mouse = false;

        Control.addEventListener("touchstart", (e) => {
          e.preventDefault();
          mouse = true;
        });

        Control.addEventListener("touchend", (e) => {
          e.preventDefault();
          mouse = false;

          input.style.left = `50%`;
          input.style.top = `50%`;

          socket.emit("Client/mobile-mouse", { start: false, angle: 0 });
        });

        input.addEventListener("touchstart", (e) => {
          e.preventDefault();
          mouse = true;
        });

        input.addEventListener("touchend", (e) => {
          e.preventDefault();
          mouse = false;

          input.style.left = `50%`;
          input.style.top = `50%`;

          socket.emit("Client/mobile-mouse", { start: false, angle: 0 });
        });

        addEventListener("touchmove", (e) => {
          if (!mouse) return;
          const size = (+Control.clientWidth + +Control.clientHeight) / 5;

          const mouseX = e.touches[0].clientX;
          const mouseY = e.touches[0].clientY;

          const angle = Math.atan2(mouseY - y, mouseX - x);
          const dist = Math.hypot(mouseX - x, mouseY - y);

          if (dist - size * 5 - 2 > 1) {
            const vector = {
              x: Math.cos(angle) * size,
              y: Math.sin(angle) * size,
            };

            input.style.left = `${50 + vector.x}%`;
            input.style.top = `${50 + vector.y}%`;
          } else {
            const vector = {
              x: Math.cos(angle) * (dist / 5),
              y: Math.sin(angle) * (dist / 5),
            };

            input.style.left = `${50 + vector.x}%`;
            input.style.top = `${50 + vector.y}%`;
          }

          socket.emit("Client/mobile-mouse", {
            start: true,
            angle: angle
          });
        });
      }

      function moveForMobile() {
        const input = document.querySelector("div.inputs-move div.inputs");
        const Control = document.querySelector("div.inputs-move");
        const x = Control.offsetLeft + input.offsetLeft,
          y = Control.offsetTop + input.offsetTop;
        var move = false;

        Control.addEventListener("touchstart", (e) => {
          e.preventDefault();
          move = true;
        });

        Control.addEventListener("touchend", (e) => {
          e.preventDefault();
          move = false;

          input.style.left = `50%`;
          input.style.top = `50%`;

          socket.emit("Client/mobile-move", { start: false, x: 0, y: 0 });
        });

        input.addEventListener("touchstart", (e) => {
          e.preventDefault();
          move = true;
        });

        input.addEventListener("touchend", (e) => {
          e.preventDefault();
          move = false;

          input.style.left = `50%`;
          input.style.top = `50%`;

          socket.emit("Client/mobile-move", { start: false, x: 0, y: 0 });
        });

        addEventListener("touchmove", (e) => {
          if (!move) return;
          const size = (+Control.clientWidth + +Control.clientHeight) / 5;

          const mouseX = e.touches[0].clientX;
          const mouseY = e.touches[0].clientY;

          const angle = Math.atan2(mouseY - y, mouseX - x);
          const dist = Math.hypot(mouseX - x, mouseY - y);

          if (dist - size * 5 - 2 > 1) {
            const vector = {
              x: Math.cos(angle) * size,
              y: Math.sin(angle) * size,
            };

            input.style.left = `${50 + vector.x}%`;
            input.style.top = `${50 + vector.y}%`;
          } else {
            const vector = {
              x: Math.cos(angle) * (dist / 5),
              y: Math.sin(angle) * (dist / 5),
            };

            input.style.left = `${50 + vector.x}%`;
            input.style.top = `${50 + vector.y}%`;
          }

          socket.emit("Client/mobile-move", {
            start: true,
            x: Math.cos(angle),
            y: Math.sin(angle),
          });
        });
      }

      mouseForMobile();
      moveForMobile();

      return "Loaded mode for client's mobile";
    } else {
      throw "Failed load mode for client's mobile";
    }
  }

  const camera = new Camera(ctx);

  function getTerst() {
    socket.on("Server/aleary-update", (game) => {
      let lastTime = Date.now();
      document.querySelector('span.wave-sp > span.sp-2').innerText = game.ui.wave;
      setTimeout(() => {
        if (!game.Entities || !game.Walls) return;
        const myplayer = game.Entities.find((enti) => {
          return enti.physics.id === socket.id;
        });
        const otherPlayers = game.Entities.filter((player) => {
          return player.physics.typeId === 'players'
        })
        const myPlayer = myplayer || game.Entities.filter((player) => {
          return player.physics.id !== socket.id && player.physics.typeId === 'players'
        })[0];
        const arena = new Arena(
          game.Arena.width,
          game.Arena.height,
          game.Arena.color,
          game.Arena.gamemode
        );
        // myPlayer.physics.color.inside = myPlayer.physics.color.outside = '#fff';

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (!myPlayer && otherPlayers.length <= 0) {
          ctx.save();
          ctx.translate(canvas.width/2, canvas.height/2);
          ctx.textAlign = 'center';
          ctx.font = "bold 48px cursive";
          ctx.fillStyle = '#F93E3E';
          ctx.fillText(`Failure in wave`, 0, 0);
          ctx.restore();
          return;
        } else {
          camera.moveTo(myPlayer.pos.x, myPlayer.pos.y);
          camera.zoomTo(myPlayer.camera.viewport);
        }

        camera.begin();
        arena.draw();
        game.Walls.forEach((wall) => {
          const _wall = new Wall(wall.pos, wall.physics, wall.flags);
          _wall.draw();
        });
        game.Entities.forEach((entity) => {
          entity.items.forEach((item) => {
            
            item.projectiles.forEach((proj) => {
              if(proj.pos.x + proj.physics.size > myPlayer.pos.x - myPlayer.camera.viewport &&
                proj.pos.x - proj.physics.size < myPlayer.pos.x + myPlayer.camera.viewport &&
                proj.pos.y+ proj.physics.size > myPlayer.pos.y - myPlayer.camera.viewport &&
                proj.pos.y - proj.physics.size < myPlayer.pos.y + myPlayer.camera.viewport) {
                const en = new Bullet(
                  proj.pos,
                  proj.physics,
                  proj.flags,
                  proj.length
                );
  
                en.draw();
              }
            })
            
            if(item.pos.x + item.physics.size * 2 > myPlayer.pos.x - myPlayer.camera.viewport &&
              item.pos.x - item.physics.size * 2 < myPlayer.pos.x + myPlayer.camera.viewport &&
              item.pos.y+ item.physics.size * 2 > myPlayer.pos.y - myPlayer.camera.viewport &&
              item.pos.y - item.physics.size * 2 < myPlayer.pos.y + myPlayer.camera.viewport) {
              const _iot = new Item(item.pos, item.physics);
              _iot.draw();
            }
          })
          if(entity.pos.x + entity.physics.size > myPlayer.pos.x - myPlayer.camera.viewport &&
            entity.pos.x - entity.physics.size < myPlayer.pos.x + myPlayer.camera.viewport &&
            entity.pos.y+ entity.physics.size > myPlayer.pos.y - myPlayer.camera.viewport &&
            entity.pos.y - entity.physics.size < myPlayer.pos.y + myPlayer.camera.viewport) {
            const en = new Entity(
              entity.pos,
              entity.physics,
              entity.flags,
              entity.health,
              entity.teamgroup
            );
            if(myPlayer && entity.teamgroup.id === myPlayer.teamgroup.id) {
              en.physics.color.outside = 'lime';
            }
            en.draw();
          }
        });
        camera.end();
        if(!myplayer) {
          ctx.save();
          ctx.translate(canvas.width/2, canvas.height/2);
          ctx.textAlign = 'center';
          ctx.font = "bold 26px cursive";
          ctx.fillStyle = '#FFFFFF';
          ctx.fillText(`You will spawn in next wave`, 0, 0);
          ctx.restore();
        }
        socket.removeListener("Server/aleary-update", (game));
      }, 0);
    });
  }

  getTerst();
  moved();

  socket.on("Game/mobile-mode", (data) => {
    loadMode(data)
      .then((msg) => {
        console.log(msg);
      })
      .catch((msg) => {
        console.log(msg);
      });
  });

  window.onload = async () => {
    installCanvas();
    await isMobile(window.devicePixelRatio)
      .then((_v) => {
        socket.emit("Game/inputs-system", _v);
      })
      .catch((_v) => {
        console.log(_v);
      });
    socket.emit("Client/join-server");
  };
  window.onresize = () => {
    installCanvas();
  };
  socket._onclose = (reason) => {
    document.querySelector('div.error').style.display = 'block';
    console.log(reason);
    alert('Server disconnected!');
  }
})();
