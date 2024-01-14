import { CAElement } from './CAElement';
import { MATTER_STATES } from './CMatterStates';

export class Sand extends CAElement {
  constructor() {
    const randomShade = Math.random() * 64 + 127;
    super([randomShade + 30, randomShade + 20, randomShade - 70, 255], MATTER_STATES.SOLID);
  }
}
