export class RewardSound {
  private context: AudioContext;
  private oscillator1: OscillatorNode;
  private oscillator2: OscillatorNode;
  private filter: BiquadFilterNode;

  constructor() {
    this.context = new AudioContext();
    this.oscillator1 = this.context.createOscillator();
    this.oscillator2 = this.context.createOscillator();
    this.filter = this.context.createBiquadFilter();
  }

  public start(): void {
    // Set the first oscillator to a sine wave and the second oscillator to a triangle wave
    this.oscillator1.type = 'sine';
    this.oscillator2.type = 'triangle';

    // Set the frequency of the oscillators to different values
    this.oscillator1.frequency.value = 440;
    this.oscillator2.frequency.value = 660;

    // Start the oscillators
    this.oscillator1.start();
    this.oscillator2.start();

    // Create and configure a low-pass filter
    this.filter.type = 'lowpass';
    this.filter.frequency.value = 1000;
    this.filter.Q.value = 1;

    // Connect the oscillators to the filter and the filter to the destination
    this.oscillator1.connect(this.filter);
    this.oscillator2.connect(this.filter);
    this.filter.connect(this.context.destination);

    // Set a sweep time of 2 seconds for the filter's cutoff frequency
    this.filter.frequency.setTargetAtTime(200, this.context.currentTime, 2);

    // Stop the sound after 2.5 seconds
    setTimeout(() => this.stop(), 2500);
  }

  public stop(): void {
    this.oscillator1.stop();
    this.oscillator2.stop();
    this.filter.disconnect(this.context.destination);
  }
}
