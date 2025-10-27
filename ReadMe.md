# three-prism-geometry

A lightweight geometry class for [three.js](https://threejs.org/) that generates true prisms with parallel top and bottom faces and a variable offset vector between the two.

## Features

- Simple API: base polygon + offset vector
- Works with any 3D base polygon (convex or slightly concave)
- You control the facing of the sides (reverse your point array if side faces are on the inside)
- Fully closed mesh (CSG-ready)
- Automatic normal calculation
- Built-in validation (planarity, offset direction)

## Installation

**NPM:**

```Console
npm i three-prism-geometry
```

## Usage

Create a prism geometry from a set of coplanar base points and an offset vector.
The top face will be the base polygon translated by the given offset.

**Note:**

The order of the input points matters. The points array should describe the base polygon in consistent winding order (clockwise or counter-clockwise as seen from outside the prism). If the side faces appear dark or look like they are lit from the inside, reverse the array before passing it to `PrismGeometry`:

```js
import * as THREE from "three";
import { PrismGeometry } from "three-prism-geometry";

const points = [
  new THREE.Vector3( 0, 0, 0),
  new THREE.Vector3( -1, 1, 1),
  new THREE.Vector3( -2, 2, 0),
  new THREE.Vector3( -1, 1, -1)
]

const offset = new THREE.Vector3(0, 1, 0);

const geometry = new PrismGeometry(points, offset);
const material = new THREE.MeshStandardMaterial({ 
  color: 0x3399ff, 
  flatShading: true 
});
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);
```