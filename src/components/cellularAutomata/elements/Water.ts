import { CAElement } from './CAElement';
import { MATTER_STATES } from './CMatterStates';

export class Water extends CAElement {
  constructor() {
    super([100, 100, 100, 127], MATTER_STATES.LIQUID, 4);
    // 20, 20, rg, 191 alpha
  }
}
