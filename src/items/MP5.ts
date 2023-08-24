import Entity from "../Native/Entity";
import Item from "../Native/Item";

export default class MP5 extends Item{
  constructor(entityPickUp: Entity) {
    super(entityPickUp);
    this.physics.dirAngle = 0;
    this.physics.layer = [
      {
        'id': 1,
        'name': 'body',
        'offset': {
          'x': 0.3,
          'y': 0.3
        },
        'color': {
          'inside': '#A6A6A6',
          'outside': '#6E6E6E'
        },
        'angle': 0,
        'shape': [[-0.2,0],[0.2,0],[0.2,3],[-0.2,3]],
        'dirAngle': -Math.PI/2,
        'lineWidth': 3,
        'radio': 0.7,
        'type': 'build'
      },
      {
        'id': 2,
        'name': 'body',
        'offset': {
          'x': 0,
          'y': 0
        },
        'color': {
          'inside': '#5E4C4C',
          'outside': '#362C2C'
        },
        'angle': 0,
        'shape': [[-0.6,-0],[0.6,-0],[0.6,1],[0.4,1.2],[-0.25,2.6],[-0.25,1.2],[-0.4,1.2],[-0.6,1]],
        'dirAngle': -Math.PI/2,
        'lineWidth': 3,
        'radio': 1,
        'type': 'build'
      }
    ]
    this.physics.reload.max = 0.04;
  }
}