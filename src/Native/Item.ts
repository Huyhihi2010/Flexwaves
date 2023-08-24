import Basic from "../Amo/basic";
import PhysicEngine, { VectorEngine } from "../PhysicEngine/PhysicEngine";
import Bullet from "./Bullet";
import Entity from "./Entity";

interface LayerColor{
  inside: string;
  outside: string;
}

export interface Layer{
  id: number;
  name: string;
  offset: {
    x: number;
    y: number;
  };
  color: LayerColor;
  angle: number;
  shape: number[][];
  radio: number;
  dirAngle: number;
  lineWidth: number;
  type: 'build' | 'circle';
}

interface UseBag{
  name: string;
  amo: {
    value: number;
    max: number;
    min: number;
    replace: boolean;
    reload: {
      value: number;
      max: number;
    }
  };
}

interface AffectWeapon{
  damageTrigger: number;
  poisonTrigger: number;
  hitBox: number;
  ronger: number;
}

interface PhysicWeapon{
  dirAngle: number;
  type: 'weapon' | 'melepon';
  name: string;
  offset: { 
    x: number;
    y: number;
  };
  layer: Layer[];
  angle: number;
  size: number;
  radio: number;
  reload: {
    value: number;
    max: number;
  }
}

export default class Item{
  public pos: VectorEngine<number>;
  public physics: PhysicWeapon;
  public bag: UseBag;
  public affect: AffectWeapon;
  public projectiles: Bullet[];
  constructor(entityPickUp: Entity) {
    this.pos = new PhysicEngine.Vector<number>(0, 0);

    this.physics = {
      'dirAngle': 0,
      'type': 'weapon',
      'offset': {
        x: 0,
        y: 0
      },
      'name': 'new weapon',
      'angle': 0,
      'size': 20,
      'radio': 1,
      'layer': [
        {
          'id': 1,
          'name': 'body',
          'offset': {
            'x': 1,
            'y': 1
          },
          'color': {
            'inside': '#110330',
            'outside': '#000330'
          },
          'angle': 0,
          'shape': [[-3, -1], [-3, 1], [3, 1], [3, -1]],
          'dirAngle': 0,
          'lineWidth': 2,
          'radio': 1,
          'type': 'build'
        }
      ],
      'reload': {
        'value': 0,
        'max': .3
      }
    }

    this.bag = {
      'name': '?',
      'amo': {
        'value': 50,
        'max': 50,
        'min': 0,
        'replace': true,
        'reload': {
          'value': 2,
          'max': 2
        }
      }
    }

    this.affect = {
      'damageTrigger': 0,
      'poisonTrigger': 0,
      'hitBox': 0,
      'ronger': 0
    }

    this.projectiles = [];

    entityPickUp.items.push(this);
  }
  shot(item: Item) {
    if(item.physics.reload.value <= 0) {
      const velocity = new PhysicEngine.Vector<number>(Math.cos(item.physics.angle + item.physics.dirAngle), Math.sin(item.physics.angle + item.physics.dirAngle));
      item.projectiles.push(new Basic(new PhysicEngine.Vector<number>(item.pos.x, item.pos.y), item.physics.size, velocity, item.physics.angle + item.physics.dirAngle));
      item.physics.reload.value = item.physics.reload.max;
    }
  }
  curret(e: (item: Item) => void) {
    e(this);
  }
  setReload(x: number) {
    this.physics.reload.max = x;
  }
  update() {
    if(this.physics.reload.value > 0) {
      this.physics.reload.value -= .01;
    }

    this.projectiles.forEach((projectile, index) => {
      if(projectile.graphics.lifeTime > 0) {
        projectile.update();
      } else {
        this.projectiles.splice(index, 1);
      }
    })
  }
}