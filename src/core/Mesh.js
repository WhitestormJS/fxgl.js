import {Object3D} from './Object3D';
import {Program} from './Program';

export class Mesh extends Object3D {
  isMesh = true;

  constructor(geometry, options = {}) {
    super();

    options = Object.assign({
      shader: {}
    }, options);

    this.program = new Program({
      vert: options.shader.vert,
      frag: options.shader.frag
    }, geometry);

    this.program.uniforms = {
      $modelMatrix: this.matrix
    };
  }
}