/**
 * Min-heap priority queue for A* pathfinding
 */
export class PriorityQueue<T> {
  private heap: Array<{ item: T; priority: number }> = [];

  /**
   * Get the size of the queue
   */
  size(): number {
    return this.heap.length;
  }

  /**
   * Check if the queue is empty
   */
  isEmpty(): boolean {
    return this.heap.length === 0;
  }

  /**
   * Add an item with a priority
   */
  enqueue(item: T, priority: number): void {
    this.heap.push({ item, priority });
    this.bubbleUp(this.heap.length - 1);
  }

  /**
   * Remove and return the item with the lowest priority
   */
  dequeue(): T | undefined {
    if (this.isEmpty()) return undefined;

    const result = this.heap[0];
    const end = this.heap.pop();

    if (this.heap.length > 0 && end) {
      this.heap[0] = end;
      this.bubbleDown(0);
    }

    return result?.item;
  }

  /**
   * Clear the queue
   */
  clear(): void {
    this.heap = [];
  }

  /**
   * Bubble up an element to maintain heap property
   */
  private bubbleUp(index: number): void {
    const element = this.heap[index]!;

    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);
      const parent = this.heap[parentIndex]!;

      if (element.priority >= parent.priority) break;

      this.heap[index] = parent;
      index = parentIndex;
    }

    this.heap[index] = element;
  }

  /**
   * Bubble down an element to maintain heap property
   */
  private bubbleDown(index: number): void {
    const length = this.heap.length;
    const element = this.heap[index]!;

    while (true) {
      const leftChildIndex = 2 * index + 1;
      const rightChildIndex = 2 * index + 2;
      let swapIndex = -1;

      if (leftChildIndex < length) {
        const leftChild = this.heap[leftChildIndex]!;
        if (leftChild.priority < element.priority) {
          swapIndex = leftChildIndex;
        }
      }

      if (rightChildIndex < length) {
        const rightChild = this.heap[rightChildIndex]!;
        if (
          (swapIndex === -1 && rightChild.priority < element.priority) ||
          (swapIndex !== -1 && rightChild.priority < this.heap[swapIndex]!.priority)
        ) {
          swapIndex = rightChildIndex;
        }
      }

      if (swapIndex === -1) break;

      this.heap[index] = this.heap[swapIndex]!;
      index = swapIndex;
    }

    this.heap[index] = element;
  }
}
