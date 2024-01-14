import { Air } from './elements/Air';
import { CAElement } from './elements/CAElement';
import { MATTER_STATES } from './elements/CMatterStates';
import { Sand } from './elements/Sand';
import { Water } from './elements/Water';
export { CellularMatrix };

/**
 * Grid-based cellular automata simulation. Implementation based on tutorial by DavidMcLaughlin208 at https://www.youtube.com/watch?v=5Ka3tbbT-9E
 */
class CellularMatrix {
  public height: number;
  public width: number;
  private matrix: CAElement[];
  // State of matrix at the next tick step.
  private matrixNext: CAElement[];

  constructor(width: number, height: number) {
    this.height = height;
    this.width = width;
    // 1D matrix representing cells from top left to bottom right.
    this.matrix = new Array(width * height).fill(new Air());
    // Deep copy. Only works with 1D arrays!
    this.matrixNext = [...this.matrix];
  }

  /**
   * Given an X and Y coordinate, converts it to the equivalent matrix index.
   * @param x X coordinate.
   * @param y Y coordinate.
   * @returns The corresponding matrix index.
   */
  public getIndexFromCoords(x: number, y: number): number {
    let newX = x;
    let newY = y;
    if (x < 0) {
      newX = 0;
    }
    if (x > this.width - 1) {
      newX = this.width - 1;
    }
    if (y < 0) {
      newY = 0;
    }
    if (y > this.height - 1) {
      newY = this.height - 1;
    }
    return this.width * newY + newX;
  }

  /**
   * Given a matrix index, converts it to the equivalent X and Y coordinate.
   * @param index Matrix index.
   * @returns The X and Y coordinates as an array.
   */
  public getCoordsFromIndex(index: number): [x: number, y: number] {
    const x = index % this.width;
    const y = (index - x) / this.height;
    return [x, y];
  }

  /**
   * Given a matrice, and indices of two elements in it, swaps their places.
   * @param matrix The matrix to modify.
   * @param firstElementIndex Matrix index of the first element to swap.
   * @param secondElementIndex Matrix index of the second element to swap.
   */
  public swapElements(
    matrix: CAElement[],
    firstElementIndex: number,
    secondElementIndex: number
  ): void {
    [matrix[firstElementIndex], matrix[secondElementIndex]] = [
      matrix[secondElementIndex],
      matrix[firstElementIndex]
    ];
  }

  /**
   * Given the coordinates of an element, recursively drops it down by a number of cells downwards equal to the number of iterations.
   * @param x X coordinate of element to drop.
   * @param y Y coordinate of element to drop.
   * @param iterations Counter of remaining number of iterations to perform.
   * @returns
   */
  public dropElementRecursive(x: number, y: number, iterations: number): void {
    if (iterations == 0) {
      return;
    }
    const droppedResult = this.dropElement(x, y);
    // If there are no changes in the element's position, stop iterating.
    if (x == droppedResult[0] && y == droppedResult[1]) {
      return;
    }
    const oldIndex = this.getIndexFromCoords(x, y);
    const newIndex = this.getIndexFromCoords(droppedResult[0], droppedResult[1]);
    this.swapElements(this.matrixNext, oldIndex, newIndex);
    return this.dropElementRecursive(droppedResult[0], droppedResult[1], iterations - 1);
  }
  /**
   * Given the coordinates of an element, returns the position it would be dropped one cell downwards to.
   * @param x X coordinate of element to drop.
   * @param y Y coordinate of element to drop.
   * @returns The coordinates of the element's dropped position as an array.
   */
  public dropElement(x: number, y: number): [newX: number, newY: number] {
    const elementIndex = this.getIndexFromCoords(x, y);
    const element = this.matrix[elementIndex];
    // Position index of final dropped location.
    let finalDroppedIndex = this.getIndexFromCoords(x, y);
    const elementBelowIndex = this.getIndexFromCoords(x, y + 1);
    // If the element below is a gas, swap places with it.
    if (this.matrix[elementBelowIndex].matterState == MATTER_STATES.GAS) {
      finalDroppedIndex = elementBelowIndex;
    }
    // If the element being dropped is a solid, and the element below is a liquid, swap places with it.
    else if (
      element.matterState == MATTER_STATES.SOLID &&
      this.matrix[elementBelowIndex].matterState == MATTER_STATES.LIQUID
    ) {
      finalDroppedIndex = elementBelowIndex;
    }
    // If the element being dropped is a liquid, try to drop next to the element below it.
    else if (element.matterState == MATTER_STATES.LIQUID) {
      finalDroppedIndex = elementIndex;
      // console.log('displacing!');
      // Determine he number of cells to travel based on the matter state
      const flowDistance = element.flowDistance;

      const spread = (originIndex: number, range: number, directionInverted: boolean) => {
        const travel = (distanceX: number) => {
          // Check for out of bounds indices
          if (distanceX < 0) {
            if (x + distanceX <= 0) {
              return;
            }
          } else {
            if (x + distanceX >= this.width) {
              return;
            }
          }
          const currentElementIndex = originIndex + distanceX;
          // const currentElementIndex =
          //   distanceX < 0
          //     ? // Left
          //       x + distanceX <= 0
          //       ? finalDroppedIndex
          //       : originIndex + distanceX
          //     : // Right
          //       x + distanceX >= this.width
          //       ? finalDroppedIndex
          //       : originIndex + distanceX;
          const currentElement = this.matrix[currentElementIndex];
          // If the location is unobstructed, choose it
          if (currentElement.matterState == MATTER_STATES.GAS) {
            finalDroppedIndex = currentElementIndex;
            return;
          }
          // If the location is obstructed by a solid, choose the previous furthest position
          else if (currentElement.matterState == MATTER_STATES.SOLID) {
            return;
          }
          // If the location is obstructed by a liquid, and the element being spread is a solid, choose it
          else if (currentElement.matterState == MATTER_STATES.LIQUID) {
            if (element.matterState == MATTER_STATES.SOLID) {
              finalDroppedIndex = currentElementIndex;
              return;
            }
          }
        };
        for (let i = 1; i < range; i += 1) {
          // Try the first direction
          travel(directionInverted ? -i : i);
          // If a valid position was found, stop
          if (finalDroppedIndex != elementIndex) {
            return;
            // Otherwise, try the other direction
          } else {
            travel(directionInverted ? i : -i);
            // If no further position was found, stop
            if (finalDroppedIndex == elementIndex) {
              return;
            }
          }
        }
      };
      // Randomly pick the direction to travel in first, true = left, false = right
      const directionInverted = Math.random() >= 0.5 ? true : false;

      // Attempt to spread the element in the row below it
      spread(elementBelowIndex, flowDistance, directionInverted);
      // If unsuccessful, try spreading in the same row
      if (finalDroppedIndex == elementIndex) {
        spread(elementIndex, flowDistance, directionInverted);
      }
    } else {
      // The element below is solid, so try to fall to either side.
      const bottomLeftElementIndex = x <= 0 ? elementBelowIndex : elementBelowIndex - 1;
      const bottomRightElementIndex =
        x >= this.width - 1 ? elementBelowIndex : elementBelowIndex + 1;

      let selectedElementIndex = elementIndex;
      // Randomly pick left or right to fall to first.
      if (Math.random() >= 0.5) {
        // Check the bottom left cell, then the bottom right.
        if (!(this.matrix[bottomLeftElementIndex].matterState == MATTER_STATES.SOLID)) {
          selectedElementIndex = bottomLeftElementIndex;
        } else if (!(this.matrix[bottomRightElementIndex].matterState == MATTER_STATES.SOLID)) {
          selectedElementIndex = bottomRightElementIndex;
        }
      } else {
        // Check the bottom right cell, then the bottom left.
        if (!(this.matrix[bottomRightElementIndex].matterState == MATTER_STATES.SOLID)) {
          selectedElementIndex = bottomRightElementIndex;
        } else if (!(this.matrix[bottomLeftElementIndex].matterState == MATTER_STATES.SOLID)) {
          selectedElementIndex = bottomLeftElementIndex;
        }
      }
      finalDroppedIndex = selectedElementIndex;
    }
    return this.getCoordsFromIndex(finalDroppedIndex);
  }

  /**
   * Simulates a single time step in the CA.
   */
  public tick(): void {
    for (let x = 0; x < this.width; x += 1) {
      for (let y = 0; y < this.height; y += 1) {
        const elementIndex = this.getIndexFromCoords(x, y);
        const element = this.matrix[elementIndex];
        if (x == this.width / 2 && y == 0) {
          this.matrixNext[elementIndex] = new Sand();
        }
        // if (y == this.height - 1 && element.matterState != MATTER_STATES.SOLID) {
        //   this.matrixNext[elementIndex] = new Sand();
        // }
        // Reset the element's falling state.
        element.isFalling = false;
        // If the element is not already at the bottom, try to make it fall.
        if (y != this.height - 1) {
          switch (element.matterState) {
            case MATTER_STATES.SOLID: {
              // If the element below is not a solid, start falling.
              if (
                !(this.matrix[this.getIndexFromCoords(x, y + 1)].matterState == MATTER_STATES.SOLID)
              ) {
                element.isFalling = true;
              }
              break;
            }
            case MATTER_STATES.LIQUID: {
              // If the element below, or any one of the elements a certain range to the left and right of it, is not a solid, start falling.
              // Number of cells to check in each direction
              const range = 4;
              for (let i = range * -1; i < range; i += 1) {
                // const direction = Math.random() >= 0.5 ? 1 : -1;
                const elementBelow = this.matrix[this.getIndexFromCoords(x + i, y + 1)];
                if (
                  elementBelow.matterState != MATTER_STATES.SOLID //&&
                  // elementBelow.matterState != MATTER_STATES.LIQUID
                ) {
                  element.isFalling = true;
                  break;
                }
              }
              break;
            }
          }
        }
        // If an element is falling, resolve it.
        if (element.isFalling) {
          // Drop the element at a rate of two steps per tick.
          this.dropElementRecursive(x, y, 4);
        }
      }
    }
    // Update the matrix to its latest state.
    this.matrix = [...this.matrixNext];
  }

  /**
   * Fills an area with an element.
   * @param element Element to fill with.
   * @param startX Starting X coordinate of fill area.
   * @param startY Starting Y cooordinate of fill area.
   * @param endY Ending Y cooordinate of fill area.
   * @param endX Ending X coordinate of fill area.
   */
  public fill(
    element: CAElement,
    startX: number,
    startY: number,
    endX: number = startX,
    endY: number = startY
  ): void {
    for (let i = 0; i < Math.abs(endX - startX) + 1; i += 1) {
      for (let j = 0; j < Math.abs(endY - startY) + 1; j += 1) {
        this.matrixNext[this.getIndexFromCoords(startX + i, startY + j)] = element;
      }
    }
  }
  /**
   * Returns the CA as an array to be rendered in a HTML canvas.
   */
  public render(): Uint8ClampedArray {
    const colourArray = this.matrix.flatMap((element) => {
      return element.colour;
    });
    return new Uint8ClampedArray(colourArray);
  }
}
