export interface VectorEngine<T extends number> {
  x: T;
  y: T;
  add(x: T, y: T): VectorEngine<T>;
  minus(x: T, y: T): VectorEngine<T>;
  multi(x: T, y: T): VectorEngine<T>;
  divide(x: T, y: T): VectorEngine<T>;
  mag(): number;
  unit(): VectorEngine<T>;
  normal(): VectorEngine<T>;
  createDir(x1: T, x2: T, y1: T, y2: T): VectorEngine<T>;
  createVector(x: T, y: T): VectorEngine<T>;
}

export interface EngineGroup {
  namespace: string;
  maxCount: number | boolean;
  obj: any[];
  begin: any;
  subto(_func: any): void
}

export default class PhysicEngine {
  /* ENGINE */
  public static engine = class {
    public static Engine: EngineGroup[] = [];
    public static render() {
      PhysicEngine.engine.Engine.forEach((engine) => {
        if(engine.begin) engine.begin();
        engine.obj.forEach((obj1, index1) => {})
      })
    }
    public static Group = class implements EngineGroup {
      public static id: number = 0;

      public namespace: string;

      public maxCount: number | boolean;

      public obj: any[];

      public begin: any;

      constructor(namespace?: string, maxCount: number | boolean = false, EngineGroup: EngineGroup[] = PhysicEngine.engine.Engine) {
        PhysicEngine.engine.Group.id++;
        this.namespace = namespace || PhysicEngine.engine.Group.id.toString();
        this.maxCount = maxCount;
        this.obj = [];
        this.begin = (function(){})
      }

      subto(_func: (EngineGroup?: EngineGroup[]) => void) {
        this.begin = _func;
      }

      delete(groupBase = PhysicEngine.engine.Engine) {
        const index = groupBase.indexOf(this);
        if(index !== -1) {
          groupBase.splice(index, 1);
        }
      }
    }
  }
  /* PHYSIC */
  // physic engine object's physics
  public static SHAPE = class {
    // wall's type or border
    public static ObjectWall1 = class {
      public start: VectorEngine<number>;
      public end: VectorEngine<number>;
      public lineWidth: number;
      public color: string;

      public flags: any;

      constructor(
        start: VectorEngine<number>,
        end: VectorEngine<number>,
        lineWidth?: number,
        color: string = "white"
      ) {
        this.start = new PhysicEngine.Vector<number>(start.x, start.y);
        this.end = new PhysicEngine.Vector<number>(end.x, end.y);
        this.lineWidth = lineWidth || 2;
        this.color = color;

        this.flags = {
          getTouch: true
        }
      }
      render(ctx?: CanvasRenderingContext2D) {
        if (!ctx) return;
        ctx.save();
        ctx.strokeStyle = this.color;
        ctx.lineWidth = this.lineWidth;
        ctx.beginPath();
        ctx.moveTo(this.start.x, this.start.y);
        ctx.lineTo(this.end.x, this.end.y);
        ctx.stroke();
        ctx.closePath();
        ctx.restore();
      }
    };
    // wall's type (can spin)
    public static ObjectWall2 = class {
      public start: VectorEngine<number>;
      public end: VectorEngine<number>;
      public center: VectorEngine<number>;
      public length: number;
      public lineWidth: number;
      public refStart: VectorEngine<number>;
      public refEnd: VectorEngine<number>;
      public refUnit: VectorEngine<number>;
      public angle: number;
      public color: string;

      constructor(
        start: VectorEngine<number>,
        end: VectorEngine<number>,
        lineWidth?: number,
        color: string = "white"
      ) {
        this.start = new PhysicEngine.Vector<number>(start.x, start.y);
        this.end = new PhysicEngine.Vector<number>(end.x, end.y);
        this.center = this.start.add(this.end.x, this.end.y).multi(0.5, 0.5);
        this.length = this.end.minus(this.start.x, this.start.y).mag();
        this.refStart = new PhysicEngine.Vector<number>(start.x, start.y);
        this.refEnd = new PhysicEngine.Vector<number>(end.x, end.y);
        this.refUnit = this.end.minus(this.start.x, this.start.y).unit();
        this.lineWidth = lineWidth || 2;
        this.angle = 0;
        this.color = color;
      }
      render(ctx?: CanvasRenderingContext2D) {
        if (!ctx) return;
        ctx.save();
        ctx.strokeStyle = this.color;
        ctx.lineWidth = this.lineWidth;
        ctx.beginPath();
        ctx.moveTo(this.start.x, this.start.y);
        ctx.lineTo(this.end.x, this.end.y);
        ctx.stroke();
        ctx.closePath();
        ctx.restore();
      }
      update() {
        this.angle += 0.02;
        if(this.angle === Math.PI*2) {
          this.angle = 0;
        }
        let rotMx: any = PhysicEngine.PrecesMX.rotMx(this.angle);
        let newDir = rotMx.multiplyVec(this.refUnit);
        this.start = this.center.add(newDir.multi(-this.length/2).x, newDir.multi(-this.length/2).y);
        this.end = this.center.add(newDir.multi(this.length/2).x, newDir.multi(this.length/2).y);
      }
    };
    // shape
    public static ObjectShape1 = class {
      public pos: VectorEngine<number>;
      public physics: {
        mass: 1 | 2 | 5;
        angle: number;
        type: "ObjectShape1";
        name: string;
        size: number;
        shape: number[][];
        color: {
          inside: string;
          outside: string;
        };
        speed: number;
        [index: string]: any;
      };
      public flags: {
        moved: boolean;
        getTouch: boolean;
        [index: string]: any;
      };

      public points: {
        start: VectorEngine<number>;
        end: VectorEngine<number>;
      }[];

      public bodies: any[];

      public graphics: {
        [index: string]: any;
      };

      public gravity: number;

      public velocity: VectorEngine<number>;

      public accessor: VectorEngine<number>;

      constructor(x: number, y: number) {
        this.pos = new PhysicEngine.Vector<number>(x, y);

        this.physics = {
          mass: 1,
          angle: Math.PI * 2,
          type: "ObjectShape1",
          name: "The ObjectShape1",
          shape: [
            [-1, -1],
            [-1, 1],
            [1, 1],
            [1, -1],
          ],
          size: 30,
          color: {
            inside: "#000",
            outside: "#fff",
          },
          speed: 3,
        };

        this.flags = {
          moved: false,
          getTouch: true,
        };

        this.points = [];

        this.bodies = [];

        this.graphics = {};

        this.gravity = 0.96;

        this.velocity = new PhysicEngine.Vector<number>(0, 0);

        this.accessor = new PhysicEngine.Vector<number>(0, 0);

        this.createUpShape(this.physics.shape);
      }
      public createUpShape(shape: number[][]) {
        if (shape.length < 2) return;
        this.points = [];
        this.bodies = [];
        this.physics.shape = shape;
        for (var i = 0; i < this.physics.shape.length; i++) {
          var _a = this.physics.shape[i],
            x = _a[0],
            y = _a[1];
          var posX = x * this.physics.size;
          var posY = y * this.physics.size;
          if (i !== this.physics.shape.length - 1) {
            var _a2 = this.physics.shape[i + 1],
              new_posX = _a2[0] * this.physics.size,
              new_posY = _a2[1] * this.physics.size;
            this.bodies.push(
              new PhysicEngine.SHAPE.ObjectWall1(
                new PhysicEngine.Vector<number>(
                  this.pos.x + posX,
                  this.pos.y + posY
                ),
                new PhysicEngine.Vector<number>(
                  this.pos.x + new_posX,
                  this.pos.y + new_posY
                ),
                9,
                this.physics.color.outside
              )
            );
            const point = {
              start: new PhysicEngine.Vector<number>(posX, posY),
              end: new PhysicEngine.Vector<number>(new_posX, new_posY),
            };
            this.points.push(point);
          } else {
            var _a2 = this.physics.shape[0],
              new_posX = _a2[0] * this.physics.size,
              new_posY = _a2[1] * this.physics.size;
            this.bodies.push(
              new PhysicEngine.SHAPE.ObjectWall1(
                new PhysicEngine.Vector<number>(
                  this.pos.x + posX,
                  this.pos.y + posY
                ),
                new PhysicEngine.Vector<number>(
                  this.pos.x + new_posX,
                  this.pos.y + new_posY
                ),
                9,
                this.physics.color.outside
              )
            );
            const point = {
              start: new PhysicEngine.Vector<number>(posX, posY),
              end: new PhysicEngine.Vector<number>(new_posX, new_posY),
            };
            this.points.push(point);
          }
        }
      }
      public render(ctx?: CanvasRenderingContext2D) {
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
      public update(ctx?: CanvasRenderingContext2D) {
        // this.physics.angle += (Math.PI * 2) / 360;

        if (this.physics.angle === Math.PI * 2) {
          this.physics.angle = 0;
        }

        this.bodies.forEach((body, index) => {
          const a = this.points[index];

          let x = this.pos.x + a.start.x,
            y = this.pos.y + a.start.y;

          if (index !== this.physics.shape.length - 1) {
            const _a = this.points[index + 1],
              _x = this.pos.x + _a.start.x,
              _y = this.pos.y + _a.start.y;

            body.start.x = x;
            body.start.y = y;

            body.end.x = _x;
            body.end.y = _y;
          } else {
            const _a = this.points[0],
              _x = this.pos.x + _a.start.x,
              _y = this.pos.y + _a.start.y;

            body.start.x = x;
            body.start.y = y;
  
            body.end.x = _x;
            body.end.y = _y;
          }

          // body.render(ctx);
        });

        if (!this.flags.moved) {
          this.velocity = this.velocity.multi(this.gravity, this.gravity);
        }
        this.accessor = this.accessor.multi(this.gravity, this.gravity);
        this.pos = this.pos.add(
          this.velocity.x * this.physics.speed,
          this.velocity.y * this.physics.speed
        );
        this.pos = this.pos.add(this.accessor.x, this.accessor.y);
      }
    };
    // matrix's type
    public static Matrix = class {
      public rows: number;
      public cols: number;
      public data: any[];

      constructor(rows: number, cols: number) {
        this.rows = rows;
        this.cols = cols;
        this.data = [];

        for (var i = 0; i < this.rows; i++) {
          this.data[i] = [];
          for (var j = 0; j < this.cols; j++) {
            this.data[i][j] = 0;
          }
        }
      }
      multiplyVec(vec: VectorEngine<number>): VectorEngine<number> {
        let result = new PhysicEngine.Vector<number>(0, 0);
        result.x = this.data[0][0]*vec.x + this.data[0][1]*vec.y;
        result.y = this.data[1][0]*vec.x + this.data[1][1]*vec.y;

        return result;
      }
    };
    // ball's type
    public static Ball = class {
      public pos: VectorEngine<number>;

      public physics: {
        mass: 1 | 2 | 5;
        type: "Ball";
        name: string;
        size: number;
        color: {
          inside: string;
          outside: string;
        };
        speed: number;
        [index: string]: any;
      };

      public flags: {
        moved: boolean;
        getTouch: boolean;
        [index: string]: any;
      };

      public graphics: {
        [index: string]: any;
      };

      public gravity: number;

      public velocity: VectorEngine<number>;

      public accessor: VectorEngine<number>;

      constructor() {
        this.pos = new PhysicEngine.Vector<number>(0, 0);

        this.physics = {
          mass: 1,
          type: "Ball",
          name: "The ball",
          size: 30,
          color: {
            inside: "#000",
            outside: "#fff",
          },
          speed: 4,
        };

        this.flags = {
          moved: false,
          getTouch: true,
        };

        this.graphics = {};

        this.gravity = 0.96;

        this.velocity = new PhysicEngine.Vector<number>(0, 0);
        this.accessor = new PhysicEngine.Vector<number>(0, 0);
      }

      public render(ctx?: CanvasRenderingContext2D) {
        if (!ctx) return;
        ctx.save();
        ctx.translate(this.pos.x, this.pos.y);
        ctx.lineWidth = 2;
        ctx.strokeStyle = this.physics.color.outside;
        ctx.beginPath();
        ctx.arc(0, 0, this.physics.size, 0, Math.PI * 2, false);
        ctx.fillStyle = this.physics.color.inside;
        ctx.fill();
        ctx.stroke();
        ctx.closePath();
        ctx.restore();
      }

      public update() {
        if (!this.flags.moved) {
          this.velocity = this.velocity.multi(this.gravity, this.gravity);
        }
        this.accessor = this.accessor.multi(this.gravity, this.gravity);
        this.pos = this.pos.add(
          this.velocity.x * this.physics.speed,
          this.velocity.y * this.physics.speed
        );
        this.pos = this.pos.add(this.accessor.x, this.accessor.y);
      }
    };
  };
  // static Math
  public static Math = class {
    public static round(number: number, precision: number): number {
      let factor = 10 ** precision;
      return Math.round(number * factor) / factor;
    }
    public static random(x: number): number {
      return Math.floor(Math.random() * x);
    }
    public static distance(vector1: VectorEngine<number>, vector2: VectorEngine<number>): number {
      const dx = vector2.x - vector1.x;
      const dy = vector2.y - vector1.y;
      return Math.hypot(dx, dy);
    }
    public static rotate(vector1: VectorEngine<number>, vector2: VectorEngine<number>): number {
      return Math.atan2(vector2.y - vector1.y, vector2.x - vector1.x);
    }
    public static CPV(posVect1: VectorEngine<number>, vect1: VectorEngine<number>, posVect2: VectorEngine<number>, vect2: VectorEngine<number>, mass: 1 | 2 | 5 = 1) {
      let normal1 = posVect1.minus(posVect2.x, posVect2.y).unit();
      let relVel = vect1.minus(vect2.x, vect2.y);
      let sepVel = PhysicEngine.Vector.Dot(relVel, normal1);
      let new_sepVel = -sepVel * mass;
      let sepVelVec = normal1.multi(new_sepVel, new_sepVel);

      return { v1: new PhysicEngine.Vector<number>(sepVelVec.x, sepVelVec.y) , v2: new PhysicEngine.Vector<number>(sepVelVec.multi(-1, -1).x, sepVelVec.multi(-1, -1).y) };
    }
  };
  // physic collision resposn
  public static CollisionType = class {
    public static Circle(b1: any, b2: any) {
      if (!b1.flags.getTouch || !b2.flags.getTouch) return;
      let dist = b1.pos.minus(b2.pos.x, b2.pos.y);
      let pen_depth = b1.physics.size + b2.physics.size - dist.mag();
      let pen_res = dist.unit().multi(pen_depth / 2, pen_depth / 2);

      b1.accessor = b1.accessor.add(pen_res.x, pen_res.y);
      b2.accessor = b2.accessor.add(
        pen_res.multi(-1, -1).x,
        pen_res.multi(-1, -1).y
      );
    }
    public static Circle2(b1: any, b2: any) {
      if (!b1.flags.getTouch || !b2.flags.getTouch) return;
      let normal1 = b1.pos.minus(b2.pos.x, b2.pos.y).unit();
      let relVel = b1.velocity.minus(b2.velocity.x, b2.velocity.y);
      let sepVel = PhysicEngine.Vector.Dot(relVel, normal1);
      let new_sepVel = -sepVel * b1.physics.mass;
      let sepVelVec = normal1.multi(new_sepVel, new_sepVel);

      b1.velocity = b1.velocity.add(sepVelVec.x, sepVelVec.y);
      b2.velocity = b2.velocity.add(
        sepVelVec.multi(-1, -1).x,
        sepVelVec.multi(-1, -1).y
      );
    }
    public static Circle3(b1: any, b2: any) {
      if (!b1.flags.getTouch || !b2.flags.getTouch) return;
      let normal2 = b1.pos.minus(b2.pos.x, b2.pos.y).unit();
      let relAcc = b1.accessor.minus(b2.accessor.x, b2.accessor.y);
      let sepAcc = PhysicEngine.Vector.Dot(relAcc, normal2);
      let new_sepAcc = -sepAcc * b1.physics.mass;
      let sepAccVec = normal2.multi(new_sepAcc, new_sepAcc);

      b1.accessor = b1.accessor.add(sepAccVec.x, sepAccVec.y);
      b2.accessor = b2.accessor.add(
        sepAccVec.multi(-1, -1).x,
        sepAccVec.multi(-1, -1).y
      );
    }
    // ** this function just for circle's object
    public static async PenResCircle(b1: any, b2: any): Promise<boolean> {
      const dist = PhysicEngine.Math.distance(b1.pos, b2.pos);
      if(dist - b1.physics.size - b2.physics.size < 1) {
        return true;
      }
      throw false;
    }
    public static PenResWallPos(object: any, wall: any) {
      if (!object.flags.getTouch) return;
      let penVect = object.pos.minus(
        PhysicEngine.CollisionChecking.ClosestPointWall1(object, wall).x,
        PhysicEngine.CollisionChecking.ClosestPointWall1(object, wall).y
      ) as VectorEngine<number>;
      let dir = penVect
        .unit()
        .multi(
          object.physics.size + wall.lineWidth - penVect.mag(),
          object.physics.size + wall.lineWidth - penVect.mag()
        );
      object.pos = object.pos.add(dir.x, dir.y);
    }

    public static RenResWallVect(object: any, wall: any) {
      if (!object.flags.getTouch) return;
      let closestPointWall = PhysicEngine.CollisionChecking.ClosestPointWall1(
        object,
        wall
      );
      let normal = object.pos
        .minus(closestPointWall.x, closestPointWall.y)
        .unit() as VectorEngine<number>;
      let sepVel = PhysicEngine.Vector.Dot(object.velocity, normal);
      let new_sepVel = -sepVel * object.physics.mass;
      let vsep_diff = sepVel - new_sepVel;
      if (!object.velocity.moved) {
        object.velocity = object.velocity.add(
          normal.multi(-vsep_diff, -vsep_diff).x,
          normal.multi(-vsep_diff, -vsep_diff).y
        );
      }

      let sepAcc = PhysicEngine.Vector.Dot(object.accessor, normal);
      let new_sepAcc = -sepAcc * object.physics.mass;
      let asep_diff = sepAcc - new_sepAcc;
      object.accessor = object.accessor.add(
        normal.multi(-asep_diff, -asep_diff).x,
        normal.multi(-asep_diff, -asep_diff).y
      );
    }
    // **
    // ** this function just for ObjectShape1
    public static CollisionSTS1(shape1: any, shape2: any) {
      shape1.bodies.forEach((body1: any) => {
        shape2.bodies.forEach((body2: any) => {
          const obj = {
            pos: body1.start
          }
          const ClosestPoint = PhysicEngine.CollisionChecking.ClosestPointWall1(obj, body2).minus(obj.pos.x, obj.pos.y);
          if (ClosestPoint.mag() <= body1.lineWidth + body2.lineWidth) {
            // if (!shape2.flags.getTouch) return;
            PhysicEngine.CollisionType.Circle2(shape1, shape2);
            // shape1.pos = shape1.pos.add(.1, 0);
          }
        })
      })
    }
    // **
  };
  // physic collision checking
  public static CollisionChecking = class {
    public static Circle(
      position1: VectorEngine<number>,
      position2: VectorEngine<number>,
      size1: number,
      size2: number,
      value: number = 1
    ): boolean {
      const dx = position2.x - position1.x;
      const dy = position2.y - position1.y;
      const distance = Math.hypot(dx, dy);
      if (distance - size1 - size2 < value) {
        return true;
      }
      return false;
    }
    // ** this function just for circle's object
    public static ClosestPointWall1(
      object: any,
      wall: any
    ): VectorEngine<number> {
      let objectToWallStart = wall.start.minus(object.pos.x, object.pos.y);
      if (
        PhysicEngine.Vector.Dot(
          wall.end.minus(wall.start.x, wall.start.y).unit(),
          objectToWallStart
        ) > 0
      ) {
        return wall.start;
      }

      let wallEndToObject = object.pos.minus(wall.end.x, wall.end.y);
      if (
        PhysicEngine.Vector.Dot(
          wall.end.minus(wall.start.x, wall.start.y).unit(),
          wallEndToObject
        ) > 0
      ) {
        return wall.end;
      }

      let closestDist = PhysicEngine.Vector.Dot(
        wall.end.minus(wall.start.x, wall.start.y).unit(),
        objectToWallStart
      );
      let closestVect = wall.end
        .minus(wall.start.x, wall.start.y)
        .unit()
        .multi(closestDist, closestDist);
      return wall.start.minus(closestVect.x, closestVect.y);
    }

    public static CollisionWall1(object: any, wall: any): boolean {
      let objectToClosest = PhysicEngine.CollisionChecking.ClosestPointWall1(
        object,
        wall
      ).minus(object.pos.x, object.pos.y);
      if (objectToClosest.mag() <= object.physics.size + wall.lineWidth) {
        return true;
      }
      return false;
    }
    // **
    public static Square1(): boolean {
      return false;
    }
  };
  // physic engine PrecesMX
  public static PrecesMX = class {
    public static rotMx(z: number): PhysicEngine {
      let mx = new PhysicEngine.SHAPE.Matrix(2, 2);
      mx.data[0][0] = Math.cos(z);
      mx.data[0][1] = -Math.sin(z);
      mx.data[1][0] = Math.sin(z);
      mx.data[1][1] = Math.cos(z);
      return mx;
    }
  };
  // physic engine vector
  public static Vector = class<T extends number = number>
    implements VectorEngine<T>
  {
    public static Cross(v1: VectorEngine<number>, v2: VectorEngine<number>) {
      return v1.x*v2.y - v1.y*v2.x;
    }
    public static Dot(v1: VectorEngine<number>, v2: VectorEngine<number>) {
      return v1.x * v2.x + v1.y * v2.y;
    }

    public static DrawMatrix(
      ctx: CanvasRenderingContext2D,
      pos: VectorEngine<number>,
      velocity: VectorEngine<number>,
      z: number = 10,
      color: string = "white"
    ) {
      if (!ctx || !pos || !velocity) return;
      ctx.save();
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.moveTo(pos.x, pos.y);
      ctx.lineTo(pos.x + velocity.x * z, pos.y + velocity.y * z);
      ctx.stroke();
      ctx.closePath();
      ctx.restore();
    }

    public x: T;
    public y: T;
    constructor(x: T, y: T) {
      this.x = x;
      this.y = y;
    }
    add(x: T, y: T): VectorEngine<T> {
      return new PhysicEngine.Vector<number>(
        this.x + x,
        this.y + y
      ) as VectorEngine<T>;
    }
    minus(x: T, y: T): VectorEngine<T> {
      return new PhysicEngine.Vector<number>(
        this.x - x,
        this.y - y
      ) as VectorEngine<T>;
    }
    multi(x: T, y: T): VectorEngine<T> {
      return new PhysicEngine.Vector<number>(
        this.x * x,
        this.y * y
      ) as VectorEngine<T>;
    }
    divide(x: T, y: T): VectorEngine<T> {
      return new PhysicEngine.Vector<number>(
        this.x / x,
        this.y / y
      ) as VectorEngine<T>;
    }
    mag(): number {
      return Math.sqrt(this.x ** 2 + this.y ** 2);
    }
    unit(): VectorEngine<T> {
      if (this.mag() === 0) {
        return new PhysicEngine.Vector<number>(0, 0) as VectorEngine<T>;
      } else {
        return new PhysicEngine.Vector<number>(
          this.x / this.mag(),
          this.y / this.mag()
        ) as VectorEngine<T>;
      }
    }
    normal(): VectorEngine<T> {
      return new PhysicEngine.Vector<number>(
        -this.y,
        this.x
      ).unit() as VectorEngine<T>;
    }
    createDir(x1: T, x2: T, y1: T, y2: T): VectorEngine<T> {
      const dx = x2 - x1;
      const dy = y2 - y1;
      return new PhysicEngine.Vector<number>(
        Math.cos(Math.atan2(dy, dx)),
        Math.sin(Math.atan2(dy, dx))
      ) as VectorEngine<T>;
    }
    createVector(x: T, y: T): VectorEngine<T> {
      return new PhysicEngine.Vector<number>(x, y) as VectorEngine<T>;
    }
  };
}