# three-prism-geometry

A lightweight geometry class for [three.js](https://threejs.org/) that generates true prisms with parallel top and bottom faces and a variable offset vector between the two.

## Features

- Simple API: base polygon + offset vector
- Works with any 3D base polygon (convex or slightly concave)
- Fully closed mesh (CSG-ready)
- Automatic normal calculation
- Built-in validation (planarity, offset direction)

## Installation

**ES Module import:**

```js
import { PrismGeometry } from 'https://raw.githubusercontent.com/GJVothel/three-prism-geometry/main/src/PrismGeometry.js';
```