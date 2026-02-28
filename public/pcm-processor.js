/**
 * PCM Audio Worklet Processor
 * 
 * Runs on the dedicated audio rendering thread (not the main thread).
 * Accumulates microphone samples into chunks and posts Float32Array data
 * to the main thread via MessagePort for sending to Gemini Live API.
 */
class PcmProcessor extends AudioWorkletProcessor {
    constructor() {
        super();
        this._buffer = new Float32Array(0);
        // Accumulate ~4096 samples before sending (matches old ScriptProcessorNode buffer size)
        this._bufferSize = 4096;
    }

    process(inputs, outputs, parameters) {
        const input = inputs[0];
        if (!input || !input[0] || input[0].length === 0) {
            return true;
        }

        const channelData = input[0]; // mono channel

        // Append new samples to the buffer
        const newBuffer = new Float32Array(this._buffer.length + channelData.length);
        newBuffer.set(this._buffer);
        newBuffer.set(channelData, this._buffer.length);
        this._buffer = newBuffer;

        // When we have enough samples, send them to main thread
        while (this._buffer.length >= this._bufferSize) {
            const chunk = this._buffer.slice(0, this._bufferSize);
            this._buffer = this._buffer.slice(this._bufferSize);
            this.port.postMessage({ type: 'pcm_data', data: chunk });
        }

        return true;
    }
}

registerProcessor('pcm-processor', PcmProcessor);
