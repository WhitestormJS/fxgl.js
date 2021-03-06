import getTextureUnit from './utils/getTextureUnit';

const _gl = new WeakMap();

export class Texture {
  isTexture = true;

  static fromUrl(url) {
    return new Promise(resolve => {
      const img = new Image();
      img.src = url;

      img.onload = () => { // eslint-disable-line
        resolve(new Texture(img));
      };
    });
  }

  static createDepthTexture(width, height) {
    return new Texture(null, width, height, {
      internal: 'DEPTH_COMPONENT16',
      format: 'DEPTH_COMPONENT',
      type: 'UNSIGNED_INT',
      minFilter: 'NEAREST',
      magFilter: 'NEAREST'
    });
  }

  constructor(image, width, height, options = {}) {
    this.image = image;
    this.width = width || 256;
    this.height = height || 256;
    this.format = options.format || 'RGBA';
    this.internal = options.internal || options.format || 'RGBA';
    this.type = options.type || 'UNSIGNED_BYTE';
    this.wrapS = options.wrapS || 'CLAMP_TO_EDGE';
    this.wrapT = options.wrapT || options.wrapS || 'CLAMP_TO_EDGE';
    this.minFilter = options.minFilter || 'LINEAR';
    this.magFilter = options.magFilter || options.minFilter || 'LINEAR';
    this.isActive = false;
  }

  _compile(gl) {
    _gl.set(this, gl);

    const unit = getTextureUnit(this);
    // TODO: Cleanup comments, make the use of parameters
    const texture = gl.createTexture();

    // make unit 0 the active texture uint
    // (ie, the unit all other texture commands will affect
    // if (this.image) {
      // gl.activeTexture(gl['TEXTURE' + textureUnit.get(this)]);
    // }


    // Bind it to texture unit 0' 2D bind point
    gl.bindTexture(gl.TEXTURE_2D, texture);
    // gl.activeTexture(gl.TEXTURE0 + textureUnitInt);

    // Set the parameters so we don't need mips and so we're not filtering
    // and we don't repeat
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl[this.wrapS]);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl[this.wrapT]);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl[this.minFilter]);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl[this.magFilter]);

    gl.texImage2D(
      gl.TEXTURE_2D,
      0, // mipLevel, the largest mip
      gl[this.internal], // internalFormat, format we want in the texture
      this.width,
      this.height,
      0, // border
      gl[this.format], // srcFormat, format of data we are supplying
      gl[this.type],
      this.image
    );

    gl.bindTexture(gl.TEXTURE_2D, null);

    console.log('compile', unit);

    this._compiledTexture = texture;
    // gl.bindTexture(gl.TEXTURE_2D, this._compiledTexture);
    // textureUnitInt++;
  }

  setSize(width, height) {
    this.width = width;
    this.height = height;

    if (this._compiledTexture) {
      const gl = _gl.get(this);
      gl.bindTexture(gl.TEXTURE_2D, this._compiledTexture);

      console.log('update', unit);

      gl.texImage2D(
        gl.TEXTURE_2D,
        0, // mipLevel, the largest mip
        gl[this.internal], // internalFormat, format we want in the texture
        width,
        height,
        0, // border
        gl[this.format], // srcFormat, format of data we are supplying
        gl[this.type],
        this.image
      );
    }
  }

  _bind(gl) {
    const unit = getTextureUnit(this);

    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, this._compiledTexture);

    return unit;
  }
}
