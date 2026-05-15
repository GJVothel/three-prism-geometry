import {
  BufferGeometry,
  Float32BufferAttribute,
  Vector3
} from "three";

const EPS = 1e-10;

export class PrismGeometry extends BufferGeometry {
  constructor (options) {
    super();

    if (options === null || typeof options !== 'object' || Array.isArray(options)) {
      throw new Error('PrismGeometry: constructor expects an options object.');
    }

    const { points, offset } = options;

    if (!Array.isArray(points)) {
      throw new Error('PrismGeometry: "points" must be an array of THREE.Vector3 instances.');
    }
    for (const p of points) {
      if (!(p instanceof Vector3)) {
        throw new Error('PrismGeometry: every element of "points" must be an instance of THREE.Vector3.');
      }
    }

    let basePoints;
    let prismOffset;

    if (offset === undefined) {
      // Two-plane mode: derive the offset from the second half of the list.
      if (points.length < 6 || points.length % 2 !== 0) {
        throw new Error('PrismGeometry: without "offset", "points" must contain an even number of entries and at least 6 (3 per face).');
      }

      const half = points.length / 2;
      basePoints = points.slice(0, half);
      const topPoints = points.slice(half);

      // All pairwise offsets must match.
      prismOffset = topPoints[0].clone().sub(basePoints[0]);
      for (let i = 1; i < half; i++) {
        const d = topPoints[i].clone().sub(basePoints[i]);
        if (d.distanceTo(prismOffset) > EPS) {
          throw new Error('PrismGeometry: the offset between paired base and top points is not consistent across the polygon.');
        }
      }
    } else {
      // Single-base mode: caller supplied the offset directly.
      if (!(offset instanceof Vector3)) {
        throw new Error('PrismGeometry: "offset" must be an instance of THREE.Vector3.');
      }
      if (points.length < 3) {
        throw new Error('PrismGeometry: "points" must contain at least 3 entries.');
      }
      basePoints = points;
      prismOffset = offset.clone();
    }

    const { normal, refPoint } = computePlane(basePoints);
    if (!normal) {
      throw new Error('PrismGeometry: the base polygon is degenerate (all points are collinear or identical).');
    }
    if (!arePointsCoplanar(basePoints, normal, refPoint)) {
      throw new Error('PrismGeometry: the base points are not coplanar.');
    }

    if (Math.abs(prismOffset.dot(normal)) < EPS) {
      throw new Error('PrismGeometry: the offset vector lies in the plane of the base polygon; the two faces would coincide.');
    }

    buildPrism(this, basePoints, prismOffset);
  }
}

function buildPrism(geometry, basePoints, offset) {
  const n = basePoints.length;
  const positions = [];
  const indices = [];

  // Base ring (indices 0 .. n-1).
  for (const p of basePoints) {
    positions.push(p.x, p.y, p.z);
  }
  // Top ring (indices n .. 2n-1).
  for (const p of basePoints) {
    positions.push(p.x + offset.x, p.y + offset.y, p.z + offset.z);
  }

  // Side quads.
  for (let i = 0; i < n; i++) {
    const next = (i + 1) % n;
    const bI = i;
    const bN = next;
    const tI = i + n;
    const tN = next + n;
    indices.push(bI, tI, bN);
    indices.push(tI, tN, bN);
  }

  // Bottom cap, fanned from the centroid (winding flipped vs. top).
  const bottomCenter = average(basePoints);
  const bottomCenterIndex = positions.length / 3;
  positions.push(bottomCenter.x, bottomCenter.y, bottomCenter.z);
  for (let i = 0; i < n; i++) {
    const next = (i + 1) % n;
    indices.push(bottomCenterIndex, i, next);
  }

  // Top cap.
  const topCenter = average(basePoints).add(offset);
  const topCenterIndex = positions.length / 3;
  positions.push(topCenter.x, topCenter.y, topCenter.z);
  for (let i = 0; i < n; i++) {
    const next = (i + 1) % n;
    indices.push(topCenterIndex, next + n, i + n);
  }

  geometry.setIndex(indices);
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
  geometry.computeVertexNormals();
}

function average(points) {
  const c = new Vector3();
  for (const p of points) c.add(p);
  return c.multiplyScalar(1 / points.length);
}

function computePlane(points) {
  const refPoint = points[0].clone();
  const n = points.length;

  for (let i = 1; i < n - 1; i++) {
    const v1 = points[i].clone().sub(points[0]);
    const v2 = points[i + 1].clone().sub(points[0]);
    const normal = new Vector3().crossVectors(v1, v2);

    if (normal.length() > 1e-12) {
      normal.normalize();
      return { normal, refPoint };
    }
  }

  return { normal: null, refPoint };
}

function arePointsCoplanar(points, normal, refPoint) {
  for (const p of points) {
    const dist = p.clone().sub(refPoint).dot(normal);
    if (Math.abs(dist) > EPS) return false;
  }
  return true;
}