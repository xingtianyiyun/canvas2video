import { Options, Deferred, CanvasElement, MediaRecorderEvent } from './type';

declare var MediaRecorder: any;

const defaultOptions: Partial<Options> = {
  mimeType: 'video/webm;codecs=h264',
  outVideoType: 'mp4',
  transcodeOptions: '',
  concatDemuxerOptions: '-c:v copy -af apad -map 0:v -map 1:a -shortest'
}

export class Canvas2Video {
  private deferred: Deferred;
  private recorder: any;
  config: Options;
  constructor(config: Options) {
    this.config = Object.assign({}, defaultOptions, config);
  }
  /**
   * start to record canvas stream
   */
  startRecord(): void {
    const deferred: Deferred = {};
    deferred.promise = new Promise((resolve, reject) => {
      deferred.resolve = resolve;
      deferred.reject = reject;
    })
    this.deferred = deferred;
    const stream = (<CanvasElement>this.config.canvas).captureStream();
    const recorder = new MediaRecorder(stream, { mimeType: this.config.mimeType });
    const data: any[] = [];
    recorder.ondataavailable = function (event: MediaRecorderEvent) {
      if (event.data && event.data.size) {
        data.push(event.data);
      }
    };
    recorder.onstop = () => {
      const url = URL.createObjectURL(new Blob(data, { type: this.config.mimeType }));
      this.deferred.resolve(url);
    };
    recorder.start();
    this.recorder = recorder;
  }
  /**
   * stop to record canvas stream
   */
  stopRecord(): void {
    this.recorder.stop();
  }
  /**
   * merge audio and convert video type
   * @param url 
   */
  private async convertVideoUrl(url: string): Promise<string> {
    const { audio, outVideoType, mimeType, workerOptions, transcodeOptions, concatDemuxerOptions } = this.config;
    const { createFFmpeg } = window.FFmpeg;
    const ffmpeg = createFFmpeg(workerOptions || {});
    await ffmpeg.load();
    const type = mimeType.split(';')[0].split('/')[1];
    await ffmpeg.write(`video.${type}`, url);

    if (audio) {
      const audioType = audio.split('.').pop();
      await ffmpeg.write(`1.${audioType}`, audio);
      await ffmpeg.run(`-i video.${type} -i 1.${audioType} ${concatDemuxerOptions} out.${outVideoType}`);
    } else {
      if (type !== outVideoType) {
        await ffmpeg.transcode(`video.${type} `, `out.${outVideoType}`, transcodeOptions);
      }
    }
    const data  = await ffmpeg.read(`out.${outVideoType}`);
    const blob = new Blob([data.buffer], { type: `video/${outVideoType}` })
    const mp4Url = URL.createObjectURL(blob);
    return mp4Url;
  }
  /**
   * get canvas stream url, created by URL.createObjectURL & Blob
   */
  async getStreamURL(): Promise<string> {
    const url = await this.deferred.promise;
    const { mimeType, audio, outVideoType } = this.config;
    const type = mimeType.split(';')[0].split('/')[1];
    if (type === outVideoType && !audio) {
      return url;
    }
    if (!window.FFmpeg) {
      const err = new Error('please load FFmpeg script file like https://unpkg.com/@ffmpeg/ffmpeg@0.7.0/dist/ffmpeg.min.js');
      return Promise.reject(err);
    }
    return this.convertVideoUrl(url);
  }
}