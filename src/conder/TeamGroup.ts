export default class TeamGroup{
  private namespace: string;
  private id: string;
  constructor(namespace: string) {
    this.namespace = namespace;
    this.id = (namespace.length**namespace.length * 100000).toString();
  }
  public name(): string{
    return this.namespace;
  }
  public ID(): string{
    return this.id;
  }
  public setNamespace(namespace: string): TeamGroup {
    return new TeamGroup(namespace) as TeamGroup;
  }
}