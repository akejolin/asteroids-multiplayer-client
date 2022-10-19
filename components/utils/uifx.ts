import type {Iuifx} from './../asteroids/game.types'
export default class UIfx {

  file:string;
  volume:number;
  throttleMs:number;
  validateVolume:Function;
  audioElement:any;
  isPlaying:boolean;
  loop:boolean = false;

  constructor(file:string, config:{volume:number,throttleMs:number}) {
    this.isPlaying = false;
    const namespace = "uifx";
    const throttle = (fn:Function, delay:number) => {
      let lastCall = 0;
      return function(...args:any) {
        const now = new Date().getTime();
        if (now - lastCall < delay) {
          return;
        }
        lastCall = now;
        return fn(...args);
      };
    };
    const validateURI = (file:string) => {
      if (!file) {
        throw Error('Requires valid URI path for "file"');
      } else return file;
    };
    const validateVolume = (volume:number) => {
      const message = '"Volume" must be an number between 0.0 and 1.0';

      if (volume && typeof volume !== "number") throw Error(message);
      if (volume < 0 || volume > 1) throw Error(message);

      return volume ? volume : 1.0;
    }
    const validateThrottleMs = (throttleMs:number) => {
      const message = '"throttleMs" must be a number greater than zero';

      if (throttleMs && typeof throttleMs !== "number") throw Error(message);
      if (throttleMs < 0) throw Error(message);

      return throttleMs ? throttleMs : 0;
    };
    const volume = validateVolume(config && config.volume);
    const throttleMs = validateThrottleMs(config && config.throttleMs);
    const appendAudioElement = (file:string) => {
      // hack to force browser
      // to preload audio file

      // hash function: https://stackoverflow.com/a/8831937/11330825
      const hash = (str:string) => {
        var hash = 0;
        if (str.length === 0) {
          return hash;
        }
        for (var i = 0; i < str.length; i++) {
          var char = str.charCodeAt(i);
          hash = (hash << 5) - hash + char;
          hash = hash & hash; // Convert to 32bit integer
        }
        return Math.abs(hash);
      };
      const id = `${namespace}-${hash(file)}`;

      let audioElement = document.createElement("audio");

      audioElement.id = id;
      audioElement.src = file;
      audioElement.preload = "auto";
      audioElement.loop = this.loop;

      document.body.appendChild(audioElement);
      return file;
    };

    this.file = appendAudioElement(validateURI(file));
    this.volume = volume;
    this.throttleMs = throttleMs;
    this.play = this.play // throttleMs > 0 ? throttle(this.play, throttleMs) : this.play;
    this.setVolume = this.setVolume;
    this.validateVolume = validateVolume;
  }
  play(volume:number) {
    this.validateVolume(volume);
    const audioElement = new Audio(this.file);
    this.audioElement = audioElement
    audioElement.load();
    audioElement.loop = this.loop
    audioElement.addEventListener("loadeddata", () => {
      audioElement.volume = volume >= 0 && volume <= 1 ? volume : this.volume;
      const audioElementPromised = audioElement.play();
      audioElementPromised
        .then(() => {
          // autoplay started, everyting is ok
        })
        .catch(error => {
          console.log(`UIfx says: "had a problem playing file: ${this.file}"`)
        });
    });
    audioElement.onplaying = (event) => {
      this.isPlaying = true
    };

    return this;
  };
  pause() {
    if (this.isPlaying) {
      this.audioElement.pause()
      this.isPlaying = false
    }
  }
  noLoop() {
    this.loop = false
  }
  doLoop() {
    this.loop = true
  }

  setVolume(volume:number) {
    this.validateVolume(volume);
    this.volume = volume;
    return this;
  };
}