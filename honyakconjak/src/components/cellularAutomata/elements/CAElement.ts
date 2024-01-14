export abstract class CAElement {
  // RGBA values for rendering.
  public colour: [number, number, number, number];
  public matterState: string;
  public flowDistance: number;
  public isFalling: boolean;

  constructor(
    colour: [number, number, number, number] = [0, 0, 0, 0],
    matterState: string,
    flowDistance: number = 1
  ) {
    this.colour = colour;
    this.matterState = matterState;
    this.flowDistance = flowDistance 
    this.isFalling = false;
  }
}
