<script setup lang="ts">
import * as CA from './components/cellularAutomata/CellularAutomata';
import { Air } from './components/cellularAutomata/elements/Air';
import { Sand } from './components/cellularAutomata/elements/Sand';
import { Water } from './components/cellularAutomata/elements/Water';

const CAWidth = 64;
const CAHeight = 64;
// Scale factor for CA to be scaled in the canvas element.
const canvasScale = 4;
// Additional margin to compensate for scaled canvas element.
const marginHorizontal = (CAWidth * 2).toString() + 'px';
const marginVertical = (CAHeight * 2).toString() + 'px';

let c: CA.CellularMatrix;

const initialiseCA = () => {
  c = new CA.CellularMatrix(CAWidth, CAHeight);
};

// Renders the CA to the canvas.
const render = () => {
  let canvas = document.getElementById('ca-canvas') as HTMLCanvasElement;
  let ctx = canvas.getContext('2d')!;
  ctx.putImageData(new ImageData(c.render(), CAWidth, CAHeight), 0, 0);
};

// Main game tick loop.
const tick = () => {
  if (currentlyPainting) {
    paint();
  }
  c.tick();
  render();
};

// Coordinates of the mouse cursor, to be updated constantly
let brushX = 0;
let brushY = 0;

// Updates the stored mouse position.
const updateBrushCoordinatesMouse = (e: MouseEvent) => {
  brushX = e.offsetX;
  brushY = e.offsetY;
};

const updateBrushCoordinatesTouch = (e: TouchEvent) => {
  let canvas = document.getElementById('ca-canvas') as HTMLCanvasElement;
  const bcr = canvas.getBoundingClientRect();
  brushX = Math.round((e.targetTouches[0].clientX - bcr.x) / canvasScale);
  brushY = Math.round((e.targetTouches[0].clientY - bcr.y) / canvasScale);
  console.log(brushX, brushY);
};
// Element to paint with.
let paintElement = Sand;

// Size of brush to paint with, as a string
let brushSizeString = '1';

// Size of brush to paint with, as a number.
const getBrushSize = () => parseInt(brushSizeString);

// True if currently painting, false otherwise
let currentlyPainting = false;

const startPainting = () => {
  currentlyPainting = true;
};

const stopPainting = () => {
  currentlyPainting = false;
};

// Paint a location with an element.
const paint = () => {
  c.fill(
    new paintElement(),
    brushX,
    brushY,
    brushX + getBrushSize() - 1,
    brushY + getBrushSize() - 1
  );
};

// Resets the CA to its initial state.
const reset = () => {
  initialiseCA();
};

// Create and initialise the CA.
initialiseCA();
// Start the tick interval.
setInterval(tick, 10);
</script>
<style>
#ca-canvas {
  scale: v-bind('canvasScale');
  margin-top: v-bind('marginVertical');
  margin-bottom: v-bind('marginVertical');
  margin-left: v-bind('marginHorizontal');
  margin-right: v-bind('marginHorizontal');
}
</style>
<template>
  <main>
    <div style="display: flex">
      <div>
        <canvas
          id="ca-canvas"
          :width="CAWidth"
          :height="CAHeight"
          @mousemove="updateBrushCoordinatesMouse"
          @mousedown="startPainting"
          @mouseup="stopPainting"
          @mouseleave="stopPainting"
          @touchstart="
            (e) => {
              updateBrushCoordinatesTouch(e);
              startPainting();
            }
          "
          @touchmove="updateBrushCoordinatesTouch"
          @touchcancel="stopPainting"
          @touchend="stopPainting"
          style="image-rendering: crisp-edges; border: solid 1px grey; touch-action: none"
        ></canvas>
      </div>
      <div>
        <div>
          Element
          <br />
          <input
            type="radio"
            id="choice-sand"
            name="elementChoice"
            checked="true"
            :value="Sand"
            v-model="paintElement"
          />
          <label for="choiceSand">Sand</label>

          <input
            type="radio"
            id="choice-water"
            name="elementChoice"
            :value="Water"
            v-model="paintElement"
          />
          <label for="choiceWater">Water</label>
        </div>
        <div>
          <label>Brush size</label>
          <input
            type="range"
            id="brush-size-selector"
            name="brushSizeSelector"
            min="1"
            max="16"
            v-model="brushSizeString"
          />
        </div>
        <button @click="reset">Reset</button>
      </div>
    </div>
  </main>
</template>
