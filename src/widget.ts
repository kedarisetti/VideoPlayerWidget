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
    /**
     * Called when view is rendered.
     */
    super.render();
    this.updated(); // Set defaults.
    this.el.addEventListener('timeupdate', () => {
      this.onTrackedVideoFrame()}); 

    this.model.on('change:videoTime', this.videoTime_changed, this);

  }

  updated(): void {
    /**
     * Update the contents of this view
     *
     */

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

    // Clean up the old objectURL
    const oldurl = this.el.src;
    this.el.src = url;
    if (oldurl && typeof oldurl !== 'string') {
      URL.revokeObjectURL(oldurl);
    }

    // Height and width
    const width = this.model.get('width');
    if (width !== undefined && width.length > 0) {
      this.el.setAttribute('width', width);
    } else {
      this.el.removeAttribute('width');
    }

    const height = this.model.get('height');
    if (height !== undefined && height.length > 0) {
      this.el.setAttribute('height', height);
    } else {
      this.el.removeAttribute('height');
    }

    // Video attributes
    const loop  = this.model.get('loop');
    if (loop != undefined && loop)
    {
      this.el.setAttribute('loop', loop);
    } else {
      this.el.removeAttribute('loop')
    }

    const muted  = this.model.get('muted');
    if (muted != undefined && muted)
    {
      this.el.muted = muted;
    } else {
      this.el.removeAttribute('muted')
    }

    const autoplay  = this.model.get('autoplay');
    if (autoplay != undefined && autoplay )
    {
      this.el.setAttribute('autoplay', autoplay);
    } else {
      this.el.removeAttribute('autoplay')
    }

    const controls  = this.model.get('controls');
    if (controls != undefined && controls !== false)
    {
      this.el.setAttribute('controls', controls);
    } else {
      this.el.removeAttribute('controls')
    }


    return super.update();
  }

  remove(): void {
    if (this.el.src) {
      URL.revokeObjectURL(this.el.src);
    }
    super.remove();
  }

  videoTime_changed(){
    console.log('------',this.model.get('videoTime'));
    this.el.currentTime=this.model.get('videoTime');
  }

  onTrackedVideoFrame(){
    this.model.set('videoTime', this.el.currentTime);
    this.touch();
    console.log(this.el.currentTime, this.model.attributes.videoTime)
  }
  
  /**
   * The default tag name.
   *
   * #### Notes
   * This is a read-only attribute.
   */
  get tagName(): string {
    // We can't make this an attribute with a default value
    // since it would be set after it is needed in the
    // constructor.
    return 'video';
  }

  el: HTMLVideoElement;
}

