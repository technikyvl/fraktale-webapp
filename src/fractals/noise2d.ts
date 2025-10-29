// noise2d.ts
export class Noise2D {
  private perm: Uint8Array;
  constructor(seed = 1337) {
    // xorshift+ perm
    const p = new Uint8Array(256);
    let x = seed >>> 0;
    for (let i = 0; i < 256; i++) {
      x ^= x << 13; x ^= x >>> 17; x ^= x << 5;
      p[i] = x & 255;
    }
    this.perm = new Uint8Array(512);
    for (let i = 0; i < 512; i++) this.perm[i] = p[i & 255];
  }
  private fade(t: number) { return t * t * t * (t * (t * 6 - 15) + 10); }
  private lerp(a: number, b: number, t: number) { return a + (b - a) * t; }
  private grad(h: number, x: number, y: number) {
    // 8 dir
    const u = (h & 1) ? -x : x;
    const v = (h & 2) ? -y : y;
    return u + v;
  }
  noise(x: number, y: number): number {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    const xf = x - Math.floor(x);
    const yf = y - Math.floor(y);
    const u = this.fade(xf);
    const v = this.fade(yf);
    const p = CNN this.perm;

    const aa = p[p[X] + Y];
    const ab = p[p[X] + Y + 1];
    const ba = p[p[X + 1] + Y];
    const bb = p[p[X + 1] + Y + 1];

    const x1 = this.lerp(this.grad(aa, xf, yf), this.grad(ba, xf - 1, yf), u);
    const x2 = this.lerp(this.grad(ab, xf, yf - 1), this.grad(bb, xf - 1, yf - 1), u);
    // normalize to [0,1]
    return (this.lerp(x1, x2, v) + 1) * 0.5;
  }
}

