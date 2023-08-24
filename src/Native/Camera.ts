import Entity from "./Entity";

export default class Camera<T extends Entity>{
  private viewport: number;
  public buffView: number;
  constructor(viewport?: number) {
    this.viewport = viewport || 1000;
    this.buffView = 0;
  }
  public importsViewport(): number {
    return this.viewport;
  }
  public setView(z: number): Camera<T> {
    return new Camera<T>(z + this.buffView) as Camera<T>;
  }
}