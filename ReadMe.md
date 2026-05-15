# three-prism-geometry

A lightweight geometry class for [three.js](https://threejs.org/) that generates true prisms with parallel top and bottom faces and a variable offset vector between the two.

> ⚠️ **Breaking change**
>
> The constructor signature has fundamentally changed. `PrismGeometry` no longer accepts positional arguments — it now takes a single options object. Code written against earlier versions **will throw** until it is migrated.
>
> ```js
> // Before
> new PrismGeometry(points, offset);
>
> // After
> new PrismGeometry({ points, offset });
> ```

## Features

- Simple API: a single options object
- Two construction modes: base polygon + offset, or explicit base and top polygons
- Works with any 3D base polygon (convex or slightly concave)
- You control the facing of the sides (reverse your point array if side faces are on the inside)
- Fully closed mesh (CSG-ready)
- Automatic normal calculation
- Built-in validation (planarity, offset direction, pairwise offset consistency)
## Installation

**NPM:**

```Console
npm i three-prism-geometry
```

## Usage

`PrismGeometry` is constructed from a single options object. Depending on whether you supply an `offset`, the class operates in one of two modes.

### Mode 1 — base polygon + offset

Pass a coplanar base polygon and an offset vector. The top face is the base translated by the offset.

- `points` must contain at least 3 coplanar `THREE.Vector3` instances.
- `offset` must be a `THREE.Vector3` that does not lie in the plane of the base polygon.
```js
import * as THREE from "three";
import { PrismGeometry } from "three-prism-geometry";
 
const points = [
  new THREE.Vector3( 0,  0, 0),
  new THREE.Vector3( 1,  0, 0),
  new THREE.Vector3( 1,  1, 0),
  new THREE.Vector3( .5, .5, 0),
  new THREE.Vector3( 0,  1, 0)
];
 
const offset = new THREE.Vector3(0, 1, -1);
 
const geometry = new PrismGeometry({ points, offset });
const material = new THREE.MeshStandardMaterial({
  color: 0x3399ff,
  flatShading: true
});
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);
```

### Mode 2 — explicit base and top polygons

Omit `offset` and pass both polygons in a single `points` array. The first half describes the base, the second half describes the top.

- `points.length` must be even and at least 6 (3 points per face).
- The first half must be coplanar and non-degenerate.
- For every index `i`, `points[i + n] - points[i]` must yield the **same** offset vector (where `n = points.length / 2`). The class derives this shared offset internally and uses it the same way as in Mode 1.
```js
import * as THREE from "three";
import { PrismGeometry } from "three-prism-geometry";
 
const points = [
  // base polygon
  new THREE.Vector3(0, 0, 0),
  new THREE.Vector3(1, 0, 0),
  new THREE.Vector3(1, 1, 0),
  new THREE.Vector3(0, 1, 0),
 
  // top polygon — base translated by (0, 1, -1)
  new THREE.Vector3(0, 1, -1),
  new THREE.Vector3(1, 1, -1),
  new THREE.Vector3(1, 2, -1),
  new THREE.Vector3(0, 2, -1)
];
 
const geometry = new PrismGeometry({ points });
```

If the pairwise offsets do not all match, the constructor throws. This mode is therefore equivalent to Mode 1 — it just lets you express the prism in terms of two explicit polygons when that is more convenient (e.g. when the points come from an external source that already stores both faces).

### A note on winding order

The order of the input points matters. The base polygon should be given in a consistent winding order (clockwise or counter-clockwise as seen from outside the prism). If the side faces appear dark or look like they are lit from the inside, reverse the array before passing it to `PrismGeometry`. In Mode 2, reverse both halves so they stay paired.
