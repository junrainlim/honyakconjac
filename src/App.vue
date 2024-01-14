<script setup lang="ts">
import * as CA from './components/cellularAutomata/CellularAutomata';
import { Sand } from './components/cellularAutomata/elements/Sand';

const CAWidth = 64;
const CAHeight = 64;

const c = new CA.CellularMatrix(CAWidth, CAHeight);

const render = () => {
  let canvas = document.getElementById('ca-canvas') as HTMLCanvasElement;
  let ctx = canvas.getContext('2d')!;
  ctx.putImageData(new ImageData(c.render(), CAWidth, CAHeight), 0, 0);
};

// Main game tick loop.
const tick = () => {
  c.tick();
  render();
};

// Debugging
const spawnSand = () => {
  c.fill(new Sand(), CAWidth / 2 - 1, 0, CAWidth /2 + 2, 2);
};

// Start the tick interval.
setInterval(tick, 10);
</script>

<template>
  <main>
    <div class="flex-container">
      <canvas
      id="ca-canvas"
      :width="CAWidth"
      :height="CAHeight"
      style="scale: 1; image-rendering: crisp-edges; border: solid 1px grey;"
    ></canvas>
    <button @click="spawnSand()">Spawn Sand</button>
    </div>
    
    
  </main>
</template>
