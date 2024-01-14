import { CAElement } from './CAElement';
import { MATTER_STATES } from './CMatterStates';

export class Air extends CAElement {
  constructor() {
    super([0, 0, 0, 0], MATTER_STATES.GAS);
  }
}
