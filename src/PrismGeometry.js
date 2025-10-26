import {
  BufferGeometry,
  Float32BufferAttribute,
  Vector3
} from "three";

export class PrismGeometry extends BufferGeometry {
  constructor (points, offset) {
    super();

    if (!Array.isArray(points) || points.length < 3) {
      throw new Error('PrismGeometry: "points" must be an array of at least 3 THREE.Vector3 instances.');
    }

    for (const p of points) {
      if (!(p instanceof Vector3)) {
        throw new Error('PrismGeometry: every element of "points" must be an instance of THREE.Vector3.');
      }
    }

    if (!(offset instanceof Vector3)) {
      throw new Error('PrismGeometry: "offset" must be an instance of THREE.Vector3.');
    }

    const { normal, refPoint } = computePlane(points);

    if (!normal) {
      throw new Error('PrismGeometry: the base polygon is degenerate (all points are collinear or identical).');
    }

    if (!arePointsCoplanar(points, normal, refPoint)) {
      throw new Error('PrismGeometry: the base points are not coplanar.');
    }

    const proj = offset.dot(normal);
    const EPS = 1e-10;
    if (Math.abs(proj) < EPS) {
      throw new Error('PrismGeometry: the offset vector lies in the plane of the base polygon, the two faces would coincide.');
    }

    const n = points.length;
    const positions = [];
    const indices = [];

    for (const p of points) {
      positions.push(p.x, p.y, p.z);
    }

    for (const p of points) {
      const t = p.clone().add(offset);
      positions.push(t.x, t.y, t.z);
    }

    for (let i = 0; i < n; i++) {
      const next = (i + 1) % n;

      const b_i = i;
      const b_next = next;
      const t_i = i + n;
      const t_next = next + n;

      indices.push(b_i, t_i, b_next);
      indices.push(t_i, t_next, b_next);
    }

    const bottomCenterIndex = positions.length / 3;
    const bottomCenter = average(points);
    positions.push(bottomCenter.x, bottomCenter.y, bottomCenter.z);

    for (let i = 0; i < n; i++) {
      const next = (i + 1) % n;
      indices.push(bottomCenterIndex, i, next);
    }

    const topCenterIndex = positions.length / 3;
    const topPoints = points.map(p => p.clone().add(offset));
    const topCenter = average(topPoints);
    positions.push(topCenter.x, topCenter.y, topCenter.z);

    for (let i = 0; i < n; i++) {
      const next = (i + 1) % n;
      indices.push(topCenterIndex, next + n, i + n);
    }

    this.setIndex(indices);
    this.setAttribute('position', new Float32BufferAttribute(positions, 3));
    this.computeVertexNormals();
  }
}

function average(points) {
  const c = new Vector3();
  for (const p of points) c.add(p);
  return c.multiplyScalar(1 / points.length);
}

function computePlane(points) {
  const n = points.length;
  const refPoint = points[0].clone();

  for (let i = 1; i < n - 1; i++) {
    const a = points[0];
    const b = points[i];
    const c = points[i + 1];

    const v1 = b.clone().sub(a);
    const v2 = c.clone().sub(a);
    const normal = new Vector3().crossVectors(v1, v2);

    const len = normal.length();
    if (len > 1e-12) {
      normal.normalize();
      return { normal, refPoint };
    }
  }

  return { normal: null, refPoint };
}

function arePointsCoplanar(points, normal, refPoint) {
  const EPS = 1e-10;
  for (const p of points) {
    const dist = p.clone().sub(refPoint).dot(normal);
    if (Math.abs(dist) > EPS) {
      return false;
    }
  }
  return true;
}