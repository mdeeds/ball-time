import { AudioSource } from "./audioSource";

export class MusicSource extends AudioSource {
  constructor(url: string,
    listener: THREE.Object3D, audioCtx: AudioContext) {
    console.log('Construct source');
    super(listener, audioCtx);

    const audioElement = document.createElement('audio');
    // audioElement.setAttribute('controls', '');
    audioElement.src = url;
    audioElement.setAttribute('type', 'audio/ogg');
    audioElement.loop = true;
    let mse = null;
    audioElement.addEventListener('canplay', () => {
      if (mse != null) {
        // Already playing.
        return;
      }
      mse = audioCtx.createMediaElementSource(audioElement);
      // source.connect(audioCtx.destination);
      this.connect(mse);
      audioElement.play();
      console.log('Playing');
    });
    document.body.appendChild(audioElement);
  }
}