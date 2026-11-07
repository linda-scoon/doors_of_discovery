/**
 * Run before the tests. They run in jsdom -- a browser simulated in Node --
 * which lacks a few things a real browser has; this fills in the ones the
 * tests touch.
 */

// Pointer events carry pointerType, which the doors use to tell a mouse
// from a finger.
if (typeof globalThis.PointerEvent === 'undefined') {
  class PointerEventStandIn extends MouseEvent {
    readonly pointerType: string;
    constructor(type: string, init: PointerEventInit = {}) {
      super(type, init);
      this.pointerType = init.pointerType ?? '';
    }
  }
  (globalThis as { PointerEvent?: unknown }).PointerEvent = PointerEventStandIn;
}
