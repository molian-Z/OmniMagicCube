export class ComponentPool {
  private pool: Map<string, any[]> = new Map();
  private maxSize: number = 50;

  constructor(maxSize?: number) {
    if (maxSize) this.maxSize = maxSize;
  }

  acquire(type: string) {
    const components = this.pool.get(type) || [];
    if (components.length > 0) {
      return components.pop();
    }
    return null;
  }

  release(type: string, component: any) {
    if (!this.pool.has(type)) {
      this.pool.set(type, []);
    }
    const components = this.pool.get(type)!;
    if (components.length < this.maxSize) {
      components.push(component);
    }
  }

  clear() {
    this.pool.clear();
  }
}