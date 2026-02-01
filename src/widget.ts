// Copyright (c) Dharanish Kedarisetti
// Distributed under the terms of the Modified BSD License.

import {
  DOMWidgetModel,
  DOMWidgetView,
  ISerializers,
} from '@jupyter-widgets/base';

import { MODULE_NAME, MODULE_VERSION } from './version';

// Import the CSS
import '../css/widget.css';

export class ExampleModel extends DOMWidgetModel {
  defaults() {
    return {
      ...super.defaults(),
      _model_name: ExampleModel.model_name,
      _model_module: ExampleModel.model_module,
      _model_module_version: ExampleModel.model_module_version,
      _view_name: ExampleModel.view_name,
      _view_module: ExampleModel.view_module,
      _view_module_version: ExampleModel.view_module_version,
      value: 'Hello World',
    };
  }

  static serializers: ISerializers = {
    ...DOMWidgetModel.serializers,
    // Add any extra serializers here
  };

  static model_name = 'ExampleModel';
  static model_module = MODULE_NAME;
  static model_module_version = MODULE_VERSION;
  static view_name = 'ExampleView'; // Set to null if no view
  static view_module = MODULE_NAME; // Set to null if no view
  static view_module_version = MODULE_VERSION;
}

export class ExampleView extends DOMWidgetView {
  render() {
    this.el.classList.add('custom-widget');

    this.value_changed();
    this.model.on('change:value', this.value_changed, this);
  }

  value_changed() {
    this.el.textContent = this.model.get('value');
  }
}

export class VideoModel extends DOMWidgetModel {
  defaults() {
    return {
      ...super.defaults(),
      _model_name: VideoModel.model_name,
      _model_module: VideoModel.model_module,
      _model_module_version: VideoModel.model_module_version,
      _view_name: VideoModel.view_name,
      _view_module: VideoModel.view_module,
      _view_module_version: VideoModel.view_module_version,
      format: 'mp4',
      width: '',
      height: '',
      autoplay: true,
      muted: true,
      loop: true,
      controls: true,
      useWebGL: true,
      value: new DataView(new ArrayBuffer(0)),
      videoTime :0.0
    };
  }

  static serializers = {
    ...DOMWidgetModel.serializers,
    value: {
      serialize: (value: any): DataView => {
        return new DataView(value.buffer.slice(0));
      }
    }
  };


  static model_name = 'VideoModel';
  static model_module = MODULE_NAME;
  static model_module_version = MODULE_VERSION;
  static view_name = 'VideoView'; // Set to null if no view
  static view_module = MODULE_NAME; // Set to null if no view
  static view_module_version = MODULE_VERSION;
}

  
export class VideoView extends DOMWidgetView {
  render(): void {
    super.render();

    this.el.classList.add('video-widget');

    this.videoEl = document.createElement('video');
    this.videoEl.classList.add('video-widget__video');
    this.videoEl.preload = 'auto';
    this.videoEl.setAttribute('playsinline', 'true');

    this.canvasEl = document.createElement('canvas');
    this.canvasEl.classList.add('video-widget__canvas');

    this.controlsEl = document.createElement('div');
    this.controlsEl.classList.add('video-widget__controls');

    this.playButton = document.createElement('button');
    this.playButton.type = 'button';
    this.playButton.classList.add('video-widget__button');
    this.playButton.textContent = 'Play';

    this.muteButton = document.createElement('button');
    this.muteButton.type = 'button';
    this.muteButton.classList.add('video-widget__button');
    this.muteButton.textContent = 'Mute';

    this.timeLabel = document.createElement('div');
    this.timeLabel.classList.add('video-widget__time');
    this.timeLabel.textContent = '0:00 / 0:00';

    this.progressInput = document.createElement('input');
    this.progressInput.type = 'range';
    this.progressInput.min = '0';
    this.progressInput.max = '1000';
    this.progressInput.value = '0';
    this.progressInput.classList.add('video-widget__progress');

    this.controlsEl.appendChild(this.playButton);
    this.controlsEl.appendChild(this.progressInput);
    this.controlsEl.appendChild(this.timeLabel);
    this.controlsEl.appendChild(this.muteButton);

    this.el.appendChild(this.canvasEl);
    this.el.appendChild(this.controlsEl);
    this.el.appendChild(this.videoEl);

    this.setupEvents();
    this.configureRenderMode();
    this.updated();
  }

  updated(): void {
    let url;
    const format = this.model.get('format');
    const value = this.model.get('value');
    if (format !== 'url') {
      const blob = new Blob([value], {
        type: `video/${this.model.get('format')}`
      });
      url = URL.createObjectURL(blob);
    } else {
      url = new TextDecoder('utf-8').decode(value.buffer);
    }

    const oldurl = this.videoEl.src;
    this.videoEl.src = url;
    if (oldurl && oldurl.startsWith('blob:')) {
      URL.revokeObjectURL(oldurl);
    }
    this.videoEl.load();

    const width = this.model.get('width');
    if (width !== undefined && width.length > 0) {
      this.canvasEl.style.width = width;
      this.videoEl.setAttribute('width', width);
    } else {
      this.canvasEl.style.removeProperty('width');
      this.videoEl.removeAttribute('width');
    }

    const height = this.model.get('height');
    if (height !== undefined && height.length > 0) {
      this.canvasEl.style.height = height;
      this.videoEl.setAttribute('height', height);
    } else {
      this.canvasEl.style.removeProperty('height');
      this.videoEl.removeAttribute('height');
    }

    const loop = this.model.get('loop');
    if (loop !== undefined) {
      this.videoEl.loop = loop;
    }

    const muted = this.model.get('muted');
    if (muted !== undefined) {
      this.videoEl.muted = muted;
      this.muteButton.textContent = muted ? 'Unmute' : 'Mute';
    }

    const autoplay = this.model.get('autoplay');
    if (autoplay !== undefined) {
      this.videoEl.autoplay = autoplay;
    }

    this.configureRenderMode();

    const controls = this.model.get('controls');
    if (this.isFallback) {
      this.controlsEl.style.display = 'none';
      this.videoEl.controls = controls !== false;
    } else if (controls !== undefined && controls !== false) {
      this.controlsEl.style.removeProperty('display');
    } else {
      this.controlsEl.style.display = 'none';
    }

    return super.update();
  }

  remove(): void {
    this.stopRenderLoop();
    if (this.videoEl.src && this.videoEl.src.startsWith('blob:')) {
      URL.revokeObjectURL(this.videoEl.src);
    }
    super.remove();
  }

  videoTime_changed(): void {
    const targetTime = this.model.get('videoTime');
    if (Number.isFinite(targetTime) && Math.abs(this.videoEl.currentTime - targetTime) > 0.05) {
      this.videoEl.currentTime = targetTime;
    }
  }

  onTrackedVideoFrame(): void {
    this.model.set('videoTime', this.videoEl.currentTime);
    this.touch();
    this.updateTimeUI();
    this.drawFrame();
  }

  private setupEvents(): void {
    this.model.on('change:videoTime', this.videoTime_changed, this);
    this.model.on(
      'change:format change:value change:width change:height change:autoplay change:muted change:loop change:controls change:useWebGL',
      this.updated,
      this
    );

    this.videoEl.addEventListener('timeupdate', () => this.onTrackedVideoFrame());
    this.videoEl.addEventListener('loadedmetadata', () => this.syncCanvasSize());
    this.videoEl.addEventListener('error', () => this.switchToFallback('video-error'));
    this.videoEl.addEventListener('play', () => {
      this.playButton.textContent = 'Pause';
      this.startRenderLoop();
    });
    this.videoEl.addEventListener('pause', () => {
      this.playButton.textContent = 'Play';
      this.stopRenderLoop();
    });
    this.videoEl.addEventListener('ended', () => {
      this.playButton.textContent = 'Play';
      this.stopRenderLoop();
    });

    this.playButton.addEventListener('click', () => {
      if (this.videoEl.paused) {
        void this.videoEl.play();
      } else {
        this.videoEl.pause();
      }
    });

    this.muteButton.addEventListener('click', () => {
      this.videoEl.muted = !this.videoEl.muted;
      this.model.set('muted', this.videoEl.muted);
      this.touch();
      this.muteButton.textContent = this.videoEl.muted ? 'Unmute' : 'Mute';
    });

    this.progressInput.addEventListener('input', () => {
      const duration = this.videoEl.duration || 0;
      if (!duration) {
        return;
      }
      const fraction = Number(this.progressInput.value) / 1000;
      this.videoEl.currentTime = fraction * duration;
      this.onTrackedVideoFrame();
    });
  }

  private configureRenderMode(): void {
    const useWebGL = this.model.get('useWebGL');
    if (!useWebGL) {
      this.switchToFallback('webgl-disabled');
      return;
    }

    if (!this.glInitialized) {
      this.initializeGL();
    } else if (!this.isFallback) {
      this.canvasEl.classList.remove('video-widget__canvas--hidden');
      this.videoEl.classList.remove('video-widget__video--fallback');
    }
  }

  private initializeGL(): void {
    const gl = this.canvasEl.getContext('webgl', { premultipliedAlpha: false });
    if (!gl) {
      this.glInitialized = true;
      this.switchToFallback('webgl-unavailable');
      return;
    }

    this.gl = gl;
    this.glInitialized = true;
    this.program = this.createProgram(gl);
    if (!this.program) {
      this.switchToFallback('webgl-program-failed');
      return;
    }

    gl.useProgram(this.program);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

    this.positionBuffer = gl.createBuffer();
    this.texCoordBuffer = gl.createBuffer();
    this.texture = gl.createTexture();

    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        -1, -1,
        1, -1,
        -1, 1,
        -1, 1,
        1, -1,
        1, 1
      ]),
      gl.STATIC_DRAW
    );

    gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        0, 0,
        1, 0,
        0, 1,
        0, 1,
        1, 0,
        1, 1
      ]),
      gl.STATIC_DRAW
    );

    const positionLocation = gl.getAttribLocation(this.program, 'a_position');
    const texCoordLocation = gl.getAttribLocation(this.program, 'a_texCoord');

    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);
    gl.enableVertexAttribArray(texCoordLocation);
    gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);

    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    this.canvasEl.classList.remove('video-widget__canvas--hidden');
    this.videoEl.classList.remove('video-widget__video--fallback');
    this.isFallback = false;
  }

  private createProgram(gl: WebGLRenderingContext): WebGLProgram | null {
    const vertexSource = `
      attribute vec2 a_position;
      attribute vec2 a_texCoord;
      varying vec2 v_texCoord;
      void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
        v_texCoord = a_texCoord;
      }
    `;

    const fragmentSource = `
      precision mediump float;
      varying vec2 v_texCoord;
      uniform sampler2D u_texture;
      void main() {
        gl_FragColor = texture2D(u_texture, v_texCoord);
      }
    `;

    const vertexShader = this.compileShader(gl, gl.VERTEX_SHADER, vertexSource);
    const fragmentShader = this.compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
    if (!vertexShader || !fragmentShader) {
      return null;
    }

    const program = gl.createProgram();
    if (!program) {
      return null;
    }
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      return null;
    }

    const textureLocation = gl.getUniformLocation(program, 'u_texture');
    gl.useProgram(program);
    if (textureLocation) {
      gl.uniform1i(textureLocation, 0);
    }

    return program;
  }

  private compileShader(
    gl: WebGLRenderingContext,
    type: number,
    source: string
  ): WebGLShader | null {
    const shader = gl.createShader(type);
    if (!shader) {
      return null;
    }
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      return null;
    }
    return shader;
  }

  private startRenderLoop(): void {
    if (this.rendering) {
      return;
    }
    this.rendering = true;
    const renderFrame = () => {
      if (!this.rendering) {
        return;
      }
      this.drawFrame();
      this.animationFrameId = requestAnimationFrame(renderFrame);
    };
    this.animationFrameId = requestAnimationFrame(renderFrame);
  }

  private stopRenderLoop(): void {
    this.rendering = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  private syncCanvasSize(): void {
    const pixelRatio = window.devicePixelRatio || 1;
    const videoWidth = this.videoEl.videoWidth || 640;
    const videoHeight = this.videoEl.videoHeight || 360;
    this.canvasEl.width = Math.floor(videoWidth * pixelRatio);
    this.canvasEl.height = Math.floor(videoHeight * pixelRatio);

    if (this.gl) {
      this.gl.viewport(0, 0, this.canvasEl.width, this.canvasEl.height);
    }
    this.drawFrame();
  }

  private drawFrame(): void {
    if (!this.gl || !this.texture || !this.program) {
      return;
    }
    if (this.videoEl.readyState < 2) {
      return;
    }

    this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
    try {
      this.gl.texImage2D(
        this.gl.TEXTURE_2D,
        0,
        this.gl.RGBA,
        this.gl.RGBA,
        this.gl.UNSIGNED_BYTE,
        this.videoEl
      );
    } catch {
      this.switchToFallback('webgl-texture-failed');
      return;
    }
    this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
  }

  private switchToFallback(reason: string): void {
    if (this.isFallback) {
      return;
    }
    this.isFallback = true;
    this.stopRenderLoop();
    this.canvasEl.classList.add('video-widget__canvas--hidden');
    this.videoEl.classList.add('video-widget__video--fallback');
    this.controlsEl.style.display = 'none';
    this.videoEl.controls = true;
    console.warn(`[VideoPlayerWidget] Falling back to native video (${reason}).`);
  }

  private updateTimeUI(): void {
    const duration = this.videoEl.duration || 0;
    const current = this.videoEl.currentTime || 0;
    if (duration > 0) {
      const fraction = Math.min(1, Math.max(0, current / duration));
      this.progressInput.value = Math.round(fraction * 1000).toString();
    }
    const formatTime = (timeSeconds: number) => {
      const minutes = Math.floor(timeSeconds / 60);
      const seconds = Math.floor(timeSeconds % 60);
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };
    this.timeLabel.textContent = `${formatTime(current)} / ${formatTime(duration)}`;
  }
  
  /**
   * The default tag name.
   *
   * #### Notes
   * This is a read-only attribute.
   */
  tagName = 'div';

  el: HTMLDivElement;
  private videoEl: HTMLVideoElement;
  private canvasEl: HTMLCanvasElement;
  private controlsEl: HTMLDivElement;
  private playButton: HTMLButtonElement;
  private muteButton: HTMLButtonElement;
  private progressInput: HTMLInputElement;
  private timeLabel: HTMLDivElement;
  private gl: WebGLRenderingContext | null = null;
  private program: WebGLProgram | null = null;
  private texture: WebGLTexture | null = null;
  private positionBuffer: WebGLBuffer | null = null;
  private texCoordBuffer: WebGLBuffer | null = null;
  private animationFrameId: number | null = null;
  private rendering = false;
  private isFallback = false;
  private glInitialized = false;
}
