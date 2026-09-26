// Jump sound synthesized with the Web Audio API, so no audio files or audio
// library are needed.
let ctx = null;

/**
 * Browsers only allow audio after a user gesture; call this from one.
 */
export function unlockAudio() {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) {
        return;
    }
    if (!ctx) {
        ctx = new AudioCtx();
    }
    if (ctx.state === 'suspended') {
        ctx.resume();
    }
}

export function playJump() {
    if (!ctx || ctx.state !== 'running') {
        return;
    }
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(220, t);
    osc.frequency.exponentialRampToValueAtTime(880, t + 0.12);
    gain.gain.setValueAtTime(0.06, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.16);
}
