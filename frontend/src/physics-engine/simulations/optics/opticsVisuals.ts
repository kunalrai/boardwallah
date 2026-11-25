import * as THREE from "three";

/**
 * Shared 3D geometry builders for Optics simulations (arrows, ray segments, markers).
 * Keeps MirrorSimulation and LensSimulation concise and free of duplicated Three.js boilerplate.
 */

export function createAxisArrow(
  name: string,
  xPos: number,
  height: number,
  color: number,
  isDashedVirtual = false
): THREE.Group {
  const group = new THREE.Group();
  group.name = name;

  const absH = Math.max(0.15, Math.abs(height));
  const dirY = height >= 0 ? 1 : -1;
  const shaftRadius = 0.045;
  const headHeight = Math.min(0.28, absH * 0.35);
  const shaftHeight = Math.max(0.05, absH - headHeight);

  const mat = new THREE.MeshStandardMaterial({
    color,
    roughness: 0.35,
    metalness: 0.1,
    transparent: isDashedVirtual,
    opacity: isDashedVirtual ? 0.65 : 1.0,
  });

  const shaftGeo = new THREE.CylinderGeometry(shaftRadius, shaftRadius, shaftHeight, 12);
  const shaft = new THREE.Mesh(shaftGeo, mat);
  shaft.name = name;
  shaft.position.set(xPos, dirY * (shaftHeight / 2), 0);

  const headGeo = new THREE.ConeGeometry(0.12, headHeight, 16);
  const head = new THREE.Mesh(headGeo, mat);
  head.name = name;
  head.position.set(xPos, dirY * (shaftHeight + headHeight / 2), 0);
  if (dirY < 0) {
    head.rotation.z = Math.PI;
  }

  group.add(shaft, head);
  return group;
}

export function createPointMarker(
  name: string,
  xPos: number,
  color: number,
  radius = 0.085
): THREE.Mesh {
  const geo = new THREE.SphereGeometry(radius, 16, 16);
  const mat = new THREE.MeshStandardMaterial({
    color,
    roughness: 0.3,
    metalness: 0.15,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.name = name;
  mesh.position.set(xPos, 0, 0);
  return mesh;
}

export function createRayLine(
  points: THREE.Vector3[],
  color: number,
  dashed = false
): THREE.Line {
  const geo = new THREE.BufferGeometry().setFromPoints(points);
  const mat = dashed
    ? new THREE.LineDashedMaterial({
        color,
        dashSize: 0.18,
        gapSize: 0.12,
        transparent: true,
        opacity: 0.85,
      })
    : new THREE.LineBasicMaterial({ color });

  const line = new THREE.Line(geo, mat);
  if (dashed) {
    line.computeLineDistances();
  }
  return line;
}

export function createPhotonPulse(color = 0xf59e0b): THREE.Mesh {
  const geo = new THREE.SphereGeometry(0.075, 12, 12);
  const mat = new THREE.MeshBasicMaterial({ color });
  return new THREE.Mesh(geo, mat);
}

export function clearGroupWithDispose(group: THREE.Group): void {
  group.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if (mesh.geometry) mesh.geometry.dispose();
    if (mesh.material) {
      if (Array.isArray(mesh.material)) {
        mesh.material.forEach((m) => m.dispose());
      } else {
        mesh.material.dispose();
      }
    }
  });
  group.clear();
}
