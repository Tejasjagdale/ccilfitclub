import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
// @ts-expect-error CSS imports are resolved by the bundler.
import './TrophyCabinet3D.css';

export type CabinetAward = {
  id: string;
  event: string;
  title: string;
  date: string;
  type: 'hyrox' | 'chess' | 'run';
  placement: string;
  detail: string;
  finish?: string;
};

type TrophyCabinet3DProps = {
  awards: CabinetAward[];
  collectionName: string;
  selectedAwardId?: string | null;
  onAwardSelect: (award: CabinetAward) => void;
};

type AwardDisplay = {
  group: THREE.Group;
  light: THREE.SpotLight;
  award: CabinetAward;
  homeY: number;
  homeZ: number;
  index: number;
};

const GOLD = 0xd6ad62;
const INNER_GOLD = 0xf0d895;
const AWARD_SLOTS = [
  [-3.96, 6.53], [0, 6.53], [3.96, 6.53],
  [-3.96, 4.17], [0, 4.17], [3.96, 4.17],
  [-3.96, 1.81], [0, 1.81], [3.96, 1.81],
] as const;

function createWoodTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Unable to create cabinet wood texture');
  const base = context.createLinearGradient(0, 0, 512, 512);
  base.addColorStop(0, '#593321');
  base.addColorStop(0.23, '#8a5435');
  base.addColorStop(0.52, '#6a3e29');
  base.addColorStop(0.78, '#a36c44');
  base.addColorStop(1, '#4e2c20');
  context.fillStyle = base;
  context.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 250; i += 1) {
    const y = Math.random() * 512;
    const height = 1 + Math.random() * 5;
    context.strokeStyle = i % 4 === 0 ? 'rgba(34,13,8,.22)' : 'rgba(237,179,116,.10)';
    context.lineWidth = 0.5 + Math.random() * 1.6;
    context.beginPath();
    context.moveTo(0, y);
    context.bezierCurveTo(130, y - height, 350, y + height, 512, y + (Math.random() - 0.5) * 3);
    context.stroke();
  }
  for (let i = 0; i < 70; i += 1) {
    context.fillStyle = 'rgba(32,13,8,.12)';
    context.beginPath();
    context.ellipse(Math.random() * 512, Math.random() * 512, 1 + Math.random() * 12, 1 + Math.random() * 3, 0, 0, Math.PI * 2);
    context.fill();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.anisotropy = 8;
  return texture;
}

function createVelvetTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Unable to create velvet texture');
  const gradient = context.createLinearGradient(0, 0, 256, 256);
  gradient.addColorStop(0, '#17242b');
  gradient.addColorStop(0.5, '#263746');
  gradient.addColorStop(1, '#101b23');
  context.fillStyle = gradient;
  context.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 8500; i += 1) {
    const shade = Math.random() > 0.5 ? 255 : 0;
    context.fillStyle = `rgba(${shade},${shade},${shade},${Math.random() * 0.035})`;
    context.fillRect(Math.random() * 256, Math.random() * 256, 1, 1);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

function createPlaqueTexture(title: string, subtitle: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Unable to create award label');
  const bg = context.createLinearGradient(0, 0, 0, 128);
  bg.addColorStop(0, '#34251c');
  bg.addColorStop(0.5, '#171b1a');
  bg.addColorStop(1, '#49301c');
  context.fillStyle = bg;
  context.fillRect(0, 0, 512, 128);
  context.strokeStyle = '#c69a51';
  context.lineWidth = 5;
  context.strokeRect(6, 6, 500, 116);
  context.strokeStyle = 'rgba(245,211,143,.5)';
  context.lineWidth = 1;
  context.strokeRect(15, 15, 482, 98);
  context.textAlign = 'center';
  context.fillStyle = '#f1d89b';
  context.font = '700 31px Georgia, serif';
  context.fillText(title.toUpperCase().slice(0, 27), 256, 58);
  context.fillStyle = '#b9a37b';
  context.font = '600 18px Arial, sans-serif';
  context.fillText(subtitle.toUpperCase().slice(0, 38), 256, 91);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

function makeMaterial(color: number, metalness = 0, roughness = 0.45): THREE.MeshPhysicalMaterial {
  return new THREE.MeshPhysicalMaterial({ color, metalness, roughness, clearcoat: metalness > 0.5 ? 0.7 : 0.25, clearcoatRoughness: 0.28 });
}

function addMesh<T extends THREE.BufferGeometry>(
  parent: THREE.Object3D,
  geometry: T,
  material: THREE.Material,
  position: [number, number, number],
  options: { castShadow?: boolean; receiveShadow?: boolean; rotation?: [number, number, number] } = {},
): THREE.Mesh<T> {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(...position);
  if (options.rotation) mesh.rotation.set(...options.rotation);
  mesh.castShadow = options.castShadow ?? true;
  mesh.receiveShadow = options.receiveShadow ?? true;
  parent.add(mesh);
  return mesh;
}

function addBox(parent: THREE.Object3D, size: [number, number, number], material: THREE.Material, position: [number, number, number]): THREE.Mesh<THREE.BoxGeometry> {
  return addMesh(parent, new THREE.BoxGeometry(...size), material, position);
}

function addCornerOrnament(parent: THREE.Object3D, x: number, y: number, z: number, gold: THREE.Material, mirrorX: number, mirrorY: number): void {
  const ornament = new THREE.Group();
  ornament.position.set(x, y, z);
  ornament.scale.set(mirrorX, mirrorY, 1);
  parent.add(ornament);
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, 0), new THREE.Vector3(0.12, 0.02, 0),
    new THREE.Vector3(0.18, 0.13, 0), new THREE.Vector3(0.14, 0.27, 0),
    new THREE.Vector3(0.29, 0.31, 0), new THREE.Vector3(0.39, 0.25, 0),
  ]);
  addMesh(ornament, new THREE.TubeGeometry(curve, 22, 0.023, 7, false), gold, [0, 0, 0]);
  addMesh(ornament, new THREE.SphereGeometry(0.055, 12, 10), gold, [0.02, 0.025, 0.025]);
  addMesh(ornament, new THREE.SphereGeometry(0.034, 10, 8), gold, [0.38, 0.25, 0.025]);
}

function createHyroxTrophy(parent: THREE.Object3D, gold: THREE.Material, brightGold: THREE.Material, silver: THREE.Material): void {
  const trophy = new THREE.Group();
  parent.add(trophy);
  addMesh(trophy, new THREE.CylinderGeometry(0.34, 0.42, 0.13, 32), gold, [0, 0.12, 0]);
  addMesh(trophy, new THREE.CylinderGeometry(0.26, 0.34, 0.13, 32), brightGold, [0, 0.23, 0]);
  addMesh(trophy, new THREE.CylinderGeometry(0.11, 0.16, 0.48, 24), gold, [0, 0.55, 0]);
  addMesh(trophy, new THREE.TorusGeometry(0.16, 0.035, 10, 28), brightGold, [0, 0.83, 0], { rotation: [Math.PI / 2, 0, 0] });
  const bowl = new THREE.Group();
  trophy.add(bowl);
  addMesh(bowl, new THREE.LatheGeometry([
    new THREE.Vector2(0.22, 0), new THREE.Vector2(0.31, 0.08), new THREE.Vector2(0.4, 0.29),
    new THREE.Vector2(0.45, 0.53), new THREE.Vector2(0.39, 0.66), new THREE.Vector2(0.3, 0.62),
  ], 40), gold, [0, 0.88, 0]);
  addMesh(bowl, new THREE.TorusGeometry(0.425, 0.035, 10, 40), brightGold, [0, 1.42, 0], { rotation: [Math.PI / 2, 0, 0] });
  addMesh(bowl, new THREE.SphereGeometry(0.07, 16, 12), brightGold, [0, 1.57, 0]);
  [-1, 1].forEach((side) => {
    addMesh(trophy, new THREE.TorusGeometry(0.22, 0.052, 10, 26, Math.PI * 1.15), brightGold, [side * 0.42, 1.2, 0], { rotation: [0, 0, side * Math.PI * 0.52] });
    addMesh(trophy, new THREE.SphereGeometry(0.06, 12, 10), silver, [side * 0.5, 1.02, 0.02]);
  });
  addMesh(trophy, new THREE.CylinderGeometry(0.08, 0.08, 0.16, 20), brightGold, [0, 1.48, 0]);
}

function createChessTrophy(parent: THREE.Object3D, gold: THREE.Material, silver: THREE.Material, dark: THREE.Material): void {
  const trophy = new THREE.Group();
  parent.add(trophy);
  addMesh(trophy, new THREE.CylinderGeometry(0.36, 0.39, 0.13, 32), dark, [0, 0.12, 0]);
  addMesh(trophy, new THREE.CylinderGeometry(0.29, 0.35, 0.11, 32), gold, [0, 0.23, 0]);
  const silhouette = new THREE.Shape();
  silhouette.moveTo(-0.3, 0.35);
  silhouette.lineTo(-0.12, 0.47);
  silhouette.lineTo(-0.22, 0.76);
  silhouette.lineTo(-0.06, 1.0);
  silhouette.lineTo(0.03, 1.22);
  silhouette.lineTo(0.17, 1.12);
  silhouette.lineTo(0.25, 1.31);
  silhouette.lineTo(0.39, 1.34);
  silhouette.lineTo(0.32, 1.11);
  silhouette.lineTo(0.46, 0.96);
  silhouette.lineTo(0.39, 0.69);
  silhouette.lineTo(0.28, 0.51);
  silhouette.lineTo(0.31, 0.35);
  silhouette.closePath();
  const shape = new THREE.ExtrudeGeometry(silhouette, { depth: 0.24, bevelEnabled: true, bevelSegments: 3, steps: 1, bevelSize: 0.045, bevelThickness: 0.045 });
  addMesh(trophy, shape, silver, [0, 0, 0]);
  addMesh(trophy, new THREE.SphereGeometry(0.045, 12, 10), gold, [0.23, 1.01, 0.29]);
  addMesh(trophy, new THREE.ConeGeometry(0.09, 0.18, 6), gold, [0.18, 1.43, 0]);
  addMesh(trophy, new THREE.TorusGeometry(0.23, 0.025, 8, 24), gold, [0, 0.36, 0.13], { rotation: [Math.PI / 2, 0, 0] });
}

function createRunningMedal(parent: THREE.Object3D, gold: THREE.Material, ribbonBlue: THREE.Material, ribbonRed: THREE.Material, dark: THREE.Material): void {
  const medal = new THREE.Group();
  parent.add(medal);
  addMesh(medal, new THREE.CylinderGeometry(0.36, 0.38, 0.13, 32), dark, [0, 0.12, 0]);
  addMesh(medal, new THREE.CylinderGeometry(0.29, 0.36, 0.1, 32), gold, [0, 0.22, 0]);
  const ribbon = new THREE.Group();
  medal.add(ribbon);
  addMesh(ribbon, new THREE.BoxGeometry(0.19, 0.72, 0.055), ribbonBlue, [-0.1, 1.12, 0]);
  addMesh(ribbon, new THREE.BoxGeometry(0.19, 0.72, 0.055), ribbonRed, [0.1, 1.12, 0]);
  ribbon.rotation.z = -0.06;
  const coin = new THREE.Group();
  medal.add(coin);
  addMesh(coin, new THREE.CylinderGeometry(0.38, 0.38, 0.14, 48), gold, [0, 0.65, 0.12], { rotation: [Math.PI / 2, 0, 0] });
  addMesh(coin, new THREE.TorusGeometry(0.32, 0.035, 10, 42), makeMaterial(0xf4d88b, 0.88, 0.2), [0, 0.65, 0.205]);
  addMesh(coin, new THREE.SphereGeometry(0.105, 20, 16), makeMaterial(0xffe7a0, 0.82, 0.22), [0, 0.65, 0.205]);
  addMesh(coin, new THREE.CylinderGeometry(0.07, 0.07, 0.06, 16), dark, [0, 0.65, 0.29], { rotation: [Math.PI / 2, 0, 0] });
}

function createGenericTrophy(parent: THREE.Object3D, gold: THREE.Material, dark: THREE.Material): void {
  createHyroxTrophy(parent, gold, makeMaterial(0xffe1a0, 0.9, 0.18), dark);
}

function createAwardObject(award: CabinetAward, home: THREE.Vector3, awardIndex: number, materials: {
  wood: THREE.Material; darkWood: THREE.Material; gold: THREE.Material; brightGold: THREE.Material;
  silver: THREE.Material; dark: THREE.Material; red: THREE.Material; blue: THREE.Material;
}): AwardDisplay {
  const group = new THREE.Group();
  group.position.copy(home);
  group.userData.awardId = award.id;
  const pedestal = new THREE.Group();
  group.add(pedestal);
  addMesh(pedestal, new THREE.BoxGeometry(1.45, 0.2, 1.02), materials.darkWood, [0, 0.1, 0]);
  addMesh(pedestal, new THREE.BoxGeometry(1.35, 0.13, 0.94), materials.gold, [0, 0.245, 0]);
  addMesh(pedestal, new THREE.BoxGeometry(1.26, 0.1, 0.88), materials.dark, [0, 0.35, 0]);
  addMesh(pedestal, new THREE.BoxGeometry(1.16, 0.045, 0.11), materials.gold, [0, 0.18, 0.53]);
  const plaque = new THREE.Mesh(new THREE.PlaneGeometry(1.08, 0.27), new THREE.MeshStandardMaterial({ map: createPlaqueTexture(award.title, award.placement), roughness: 0.38, metalness: 0.28 }));
  plaque.position.set(0, 0.18, 0.594);
  pedestal.add(plaque);
  if (award.type === 'chess') createChessTrophy(pedestal, materials.brightGold, materials.silver, materials.dark);
  else if (award.type === 'run') createRunningMedal(pedestal, materials.brightGold, materials.blue, materials.red, materials.dark);
  else if (award.type === 'hyrox') createHyroxTrophy(pedestal, materials.gold, materials.brightGold, materials.silver);
  else createGenericTrophy(pedestal, materials.gold, materials.dark);
  group.scale.setScalar(0.88 + (awardIndex % 3) * 0.025);
  return { group, award, homeY: home.y, homeZ: home.z, index: awardIndex, light: new THREE.SpotLight(0xffd99a, 5.5, 5.8, Math.PI / 5.1, 0.78, 1.5) };
}

function makeWoodMaterials(texture: THREE.CanvasTexture): { wood: THREE.MeshPhysicalMaterial; darkWood: THREE.MeshPhysicalMaterial; edgeWood: THREE.MeshPhysicalMaterial } {
  const wood = new THREE.MeshPhysicalMaterial({ map: texture, roughness: 0.43, metalness: 0.08, clearcoat: 0.34, clearcoatRoughness: 0.45 });
  const darkWood = new THREE.MeshPhysicalMaterial({ map: texture, color: 0x70452d, roughness: 0.5, metalness: 0.1, clearcoat: 0.28 });
  const edgeWood = new THREE.MeshPhysicalMaterial({ map: texture, color: 0x42261c, roughness: 0.52, metalness: 0.06 });
  return { wood, darkWood, edgeWood };
}

function buildCabinet(scene: THREE.Scene, awards: CabinetAward[]): { displays: AwardDisplay[] } {
  const woodTexture = createWoodTexture();
  const velvetTexture = createVelvetTexture();
  const woodSet = makeWoodMaterials(woodTexture);
  const velvet = new THREE.MeshStandardMaterial({ map: velvetTexture, roughness: 0.92, metalness: 0.02 });
  const gold = makeMaterial(GOLD, 0.86, 0.26);
  const brightGold = makeMaterial(INNER_GOLD, 0.92, 0.19);
  const silver = makeMaterial(0xc4cbd0, 0.88, 0.23);
  const darkMetal = makeMaterial(0x282d31, 0.72, 0.38);
  const red = makeMaterial(0x9b2831, 0.2, 0.42);
  const blue = makeMaterial(0x174b73, 0.23, 0.38);
  const wood = woodSet.wood;
  const darkWood = woodSet.darkWood;
  const edgeWood = woodSet.edgeWood;

  // Deep, dark rear panel and the heavy side/top/bottom carcass.
  addBox(scene, [11.72, 7.45, 0.22], velvet, [0, 4.24, -0.86]);
  addBox(scene, [0.58, 7.95, 2.42], wood, [-6.03, 4.25, 0]);
  addBox(scene, [0.58, 7.95, 2.42], wood, [6.03, 4.25, 0]);
  addBox(scene, [12.62, 0.58, 2.52], wood, [0, 8.0, 0]);
  addBox(scene, [12.58, 0.62, 2.52], wood, [0, 0.58, 0]);
  addBox(scene, [12.34, 0.13, 2.6], edgeWood, [0, 8.34, 0]);
  addBox(scene, [12.38, 0.16, 2.6], edgeWood, [0, 0.2, 0]);

  // Decorative crown moulding, stepped trim and fine brass inlay.
  addBox(scene, [12.3, 0.16, 2.68], darkWood, [0, 8.42, -0.02]);
  addBox(scene, [12.45, 0.09, 2.7], brightGold, [0, 8.48, 0.02]);
  addBox(scene, [12.12, 0.08, 2.7], wood, [0, 8.57, 0.01]);
  const crownPlaque = new THREE.Mesh(
    new THREE.PlaneGeometry(2.72, 0.46),
    new THREE.MeshStandardMaterial({ map: createPlaqueTexture('Hall of achievement', 'The athlete collection'), roughness: 0.36, metalness: 0.24 }),
  );
  crownPlaque.position.set(0, 8.0, 1.31);
  scene.add(crownPlaque);
  addMesh(scene, new THREE.TorusGeometry(0.19, 0.025, 8, 28), brightGold, [-1.56, 8.0, 1.28], { rotation: [Math.PI / 2, 0, 0] });
  addMesh(scene, new THREE.TorusGeometry(0.19, 0.025, 8, 28), brightGold, [1.56, 8.0, 1.28], { rotation: [Math.PI / 2, 0, 0] });
  addBox(scene, [12.34, 0.065, 2.58], brightGold, [0, 0.9, 1.12]);
  addBox(scene, [12.34, 0.065, 2.58], brightGold, [0, 7.69, 1.12]);
  [-6.03, 6.03].forEach((x) => {
    addBox(scene, [0.07, 7.55, 0.07], brightGold, [x + (x < 0 ? 0.34 : -0.34), 4.24, 1.22]);
    addBox(scene, [0.13, 7.75, 0.14], darkWood, [x + (x < 0 ? 0.36 : -0.36), 4.24, 1.18]);
  });

  // Three full-width shelves form the display's three rows.
  [3.0, 5.36].forEach((y) => {
    addBox(scene, [11.58, 0.23, 2.18], wood, [0, y, 0.04]);
    addBox(scene, [11.62, 0.08, 2.27], darkWood, [0, y - 0.15, 0.05]);
    addBox(scene, [11.58, 0.045, 0.08], brightGold, [0, y + 0.125, 1.13]);
    addBox(scene, [11.58, 0.06, 0.12], edgeWood, [0, y - 0.19, 1.13]);
  });

  // Solid dividers, velvet back panels and hand-finished bay details.
  [-2.02, 2.02].forEach((x) => {
    addBox(scene, [0.3, 6.95, 2.1], wood, [x, 4.28, 0.02]);
    addBox(scene, [0.07, 6.95, 0.08], brightGold, [x + (x < 0 ? 0.17 : -0.17), 4.28, 1.12]);
  });
  const xCenters = [-3.96, 0, 3.96];
  const yCenters = [6.53, 4.17, 1.81];
  yCenters.forEach((y, row) => {
    xCenters.forEach((x, col) => {
      addBox(scene, [3.67, 2.2, 0.06], velvet, [x, y, -0.72]);
      // Fine vertical gold beading on the inset panel and a decorative header medallion.
      addBox(scene, [0.025, 1.95, 0.025], gold, [x - 1.72, y, -0.64]);
      addBox(scene, [0.025, 1.95, 0.025], gold, [x + 1.72, y, -0.64]);
      addMesh(scene, new THREE.SphereGeometry(0.07, 12, 10), brightGold, [x, y + 0.91, -0.57]);
      addMesh(scene, new THREE.TorusGeometry(0.13, 0.018, 7, 24), gold, [x, y + 0.91, -0.54]);
      addCornerOrnament(scene, x - 1.64, y + 0.88, -0.54, gold, 1, 1);
      addCornerOrnament(scene, x + 1.64, y + 0.88, -0.54, gold, -1, 1);
      addCornerOrnament(scene, x - 1.64, y - 0.88, -0.54, gold, 1, -1);
      addCornerOrnament(scene, x + 1.64, y - 0.88, -0.54, gold, -1, -1);
      // Each cubby receives its own warm pool of light.
      const spot = new THREE.SpotLight(0xffd99a, 4.5, 5.6, Math.PI / 5.3, 0.82, 1.4);
      spot.position.set(x, y + 1.05, 0.7);
      spot.target.position.set(x, y - 0.28, 0.3);
      spot.castShadow = row === 0 && col === 1;
      spot.shadow.mapSize.set(512, 512);
      scene.add(spot, spot.target);
    });
  });

  // The cabinet sits on a proper collector's chest with inset drawers and brass pulls.
  addBox(scene, [12.3, 0.78, 2.56], wood, [0, -0.11, 0]);
  addBox(scene, [12.5, 0.16, 2.7], edgeWood, [0, -0.58, 0]);
  addBox(scene, [12.62, 0.12, 2.75], brightGold, [0, -0.67, 0]);
  [-4.05, 0, 4.05].forEach((x, index) => {
    addBox(scene, [3.7, 0.53, 0.11], darkWood, [x, -0.09, 1.31]);
    addBox(scene, [3.48, 0.39, 0.07], wood, [x, -0.09, 1.39]);
    addBox(scene, [3.28, 0.035, 0.025], brightGold, [x, 0.13, 1.435]);
    addMesh(scene, new THREE.SphereGeometry(0.095, 18, 14), brightGold, [x, -0.09, 1.48]);
    addMesh(scene, new THREE.TorusGeometry(0.105, 0.025, 8, 24), gold, [x, -0.09, 1.5]);
    // A tiny dark inset on each drawer adds a furniture-maker's finish.
    addBox(scene, [0.2, 0.18, 0.018], edgeWood, [x, -0.09, 1.46]);
    void index;
  });
  [-5.1, -1.7, 1.7, 5.1].forEach((x) => {
    addBox(scene, [0.45, 0.35, 0.48], edgeWood, [x, -0.79, 0.05]);
  });

  // Small brass corner caps and beadwork on the front posts.
  [-6.04, 6.04].forEach((x) => {
    [0.62, 8.0].forEach((y) => {
      addMesh(scene, new THREE.SphereGeometry(0.105, 16, 12), brightGold, [x, y, 1.24]);
      addMesh(scene, new THREE.TorusGeometry(0.12, 0.022, 8, 28), gold, [x, y, 1.25]);
    });
  });

  // A dark, soft shadow-catching floor keeps the cabinet grounded in the scene.
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(22, 12), new THREE.MeshStandardMaterial({ color: 0x111719, roughness: 0.96, metalness: 0 }));
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(0, -1.02, 0);
  floor.receiveShadow = true;
  scene.add(floor);

  const displays: AwardDisplay[] = [];
  awards.slice(0, AWARD_SLOTS.length).forEach((award, index) => {
    const [x, rowY] = AWARD_SLOTS[index];
    const display = createAwardObject(award, new THREE.Vector3(x, rowY - 0.8, 0.48), index, {
      wood, darkWood, gold, brightGold, silver, dark: darkMetal, red, blue,
    });
    display.light.position.set(x, rowY + 1.0, 0.92);
    display.light.target.position.set(x, rowY - 0.2, 0.42);
    display.light.intensity = 5.5;
    display.light.angle = Math.PI / 6;
    display.light.penumbra = 0.78;
    display.light.distance = 5.4;
    scene.add(display.light, display.light.target, display.group);
    displays.push(display);
  });

  // Empty bays remain part of the cabinet, waiting for future achievements.
  AWARD_SLOTS.slice(Math.min(awards.length, AWARD_SLOTS.length)).forEach(([x, y]) => {
    const pedestal = new THREE.Group();
    pedestal.position.set(x, y - 0.77, 0.48);
    scene.add(pedestal);
    addMesh(pedestal, new THREE.BoxGeometry(1.18, 0.13, 0.82), darkWood, [0, 0.08, 0]);
    addMesh(pedestal, new THREE.BoxGeometry(1.12, 0.035, 0.75), gold, [0, 0.17, 0]);
    const marker = new THREE.Mesh(new THREE.PlaneGeometry(0.88, 0.22), new THREE.MeshStandardMaterial({ map: createPlaqueTexture('Your next win', 'A place is waiting'), roughness: 0.5, metalness: 0.12 }));
    marker.position.set(0, 0.13, 0.42);
    pedestal.add(marker);
  });

  return { displays };
}

export default function TrophyCabinet3D({ awards, collectionName, selectedAwardId, onAwardSelect }: TrophyCabinet3DProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const canvasMountRef = useRef<HTMLDivElement | null>(null);
  const [webglError, setWebglError] = useState(false);
  const onAwardSelectRef = useRef(onAwardSelect);
  const focusedAwardIdRef = useRef<string | null>(null);
  onAwardSelectRef.current = onAwardSelect;
  if (selectedAwardId === null || selectedAwardId === undefined) focusedAwardIdRef.current = null;
  else focusedAwardIdRef.current = selectedAwardId;

  useEffect(() => {
    const host = hostRef.current;
    const canvasMount = canvasMountRef.current;
    if (!host || !canvasMount) return undefined;
    let renderer: THREE.WebGLRenderer | null = null;
    let composer: EffectComposer | null = null;
    let bloomPass: UnrealBloomPass | null = null;
    let environmentTarget: THREE.WebGLRenderTarget | null = null;
    let controls: OrbitControls | null = null;
    let animationFrame = 0;
    let disposed = false;
    let hoverId: string | null = null;
    let clickStart: { x: number; y: number } | null = null;
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const awardObjects: AwardDisplay[] = [];
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    try {
      const width = Math.max(host.clientWidth, 320);
      const height = Math.max(host.clientHeight, 420);
      const scene = new THREE.Scene();
      scene.background = new THREE.Color('#151b1d');
      const aspect = width / height;
      const camera = new THREE.PerspectiveCamera(aspect < 0.95 ? 34 : aspect < 1.25 ? 32 : 30, aspect, 0.1, 80);
      camera.position.set(0, 4.25, aspect < 0.95 ? 30 : aspect < 1.25 ? 23 : 18.5);
      camera.lookAt(0, 3.78, 0);

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.65));
      renderer.setSize(width, height, false);
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFShadowMap;
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 0.78;
      renderer.domElement.setAttribute('aria-label', 'Interactive three-dimensional wooden trophy cabinet. Drag to explore and select a trophy to view its achievement.');
      renderer.domElement.setAttribute('role', 'img');
      canvasMount.append(renderer.domElement);

      // Baked studio reflections give the brass and polished wood real PBR highlights.
      const roomEnvironment = new RoomEnvironment();
      const pmremGenerator = new THREE.PMREMGenerator(renderer);
      environmentTarget = pmremGenerator.fromScene(roomEnvironment, 0.035);
      scene.environment = environmentTarget.texture;
      scene.environmentIntensity = 0.68;
      pmremGenerator.dispose();
      roomEnvironment.dispose();

      scene.add(new THREE.HemisphereLight(0xc9dcf2, 0x24150c, 0.58));
      scene.add(new THREE.AmbientLight(0xf1dcb5, 0.24));
      const keyLight = new THREE.DirectionalLight(0xffd6a0, 1.35);
      keyLight.position.set(-5.8, 10.5, 8.5);
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.set(1024, 1024);
      keyLight.shadow.camera.left = -9;
      keyLight.shadow.camera.right = 9;
      keyLight.shadow.camera.top = 10;
      keyLight.shadow.camera.bottom = -3;
      keyLight.shadow.bias = -0.0002;
      scene.add(keyLight);
      const coolRim = new THREE.DirectionalLight(0x8eb8e1, 0.55);
      coolRim.position.set(7, 5.5, -5);
      scene.add(coolRim);
      const frontFill = new THREE.PointLight(0xffe1b3, 9, 18, 2);
      frontFill.position.set(0, 5.3, 9);
      scene.add(frontFill);

      const built = buildCabinet(scene, awards);
      awardObjects.push(...built.displays);

      controls = new OrbitControls(camera, renderer.domElement);
      controls.target.set(0, 3.7, 0);
      controls.enableDamping = !reducedMotion;
      controls.dampingFactor = 0.055;
      controls.enablePan = false;
      controls.enableZoom = true;
      controls.zoomSpeed = 0.46;
      controls.rotateSpeed = 0.34;
      controls.minDistance = 13.8;
      controls.maxDistance = 28;
      controls.minPolarAngle = Math.PI / 2 - 0.17;
      controls.maxPolarAngle = Math.PI / 2 + 0.19;
      controls.minAzimuthAngle = -0.33;
      controls.maxAzimuthAngle = 0.33;
      controls.update();

      composer = new EffectComposer(renderer);
      composer.addPass(new RenderPass(scene, camera));
      bloomPass = new UnrealBloomPass(new THREE.Vector2(width, height), 0.09, 0.26, 1.02);
      composer.addPass(bloomPass);
      composer.addPass(new OutputPass());

      const findAwardAtPointer = (event: PointerEvent): AwardDisplay | undefined => {
        const rect = renderer!.domElement.getBoundingClientRect();
        pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(pointer, camera);
        const hits = raycaster.intersectObjects(awardObjects.map((item) => item.group), true);
        for (const hit of hits) {
          let current: THREE.Object3D | null = hit.object;
          while (current) {
            const id = current.userData.awardId as string | undefined;
            if (id) return awardObjects.find((item) => item.award.id === id);
            current = current.parent;
          }
        }
        return undefined;
      };

      const handlePointerMove = (event: PointerEvent): void => {
        const hit = findAwardAtPointer(event);
        hoverId = hit?.award.id ?? null;
        renderer!.domElement.style.cursor = hit ? 'pointer' : 'grab';
      };
      const handlePointerDown = (event: PointerEvent): void => { clickStart = { x: event.clientX, y: event.clientY }; };
      const handlePointerUp = (event: PointerEvent): void => {
        if (!clickStart) return;
        const distance = Math.hypot(event.clientX - clickStart.x, event.clientY - clickStart.y);
        clickStart = null;
        if (distance > 7) return;
        const hit = findAwardAtPointer(event);
        if (!hit) return;
        focusedAwardIdRef.current = hit.award.id;
        window.setTimeout(() => {
          if (!disposed) onAwardSelectRef.current(hit.award);
        }, reducedMotion ? 0 : 460);
      };
      renderer.domElement.addEventListener('pointermove', handlePointerMove);
      renderer.domElement.addEventListener('pointerdown', handlePointerDown);
      renderer.domElement.addEventListener('pointerup', handlePointerUp);
      const handlePointerLeave = (): void => { hoverId = null; renderer!.domElement.style.cursor = 'grab'; };
      renderer.domElement.addEventListener('pointerleave', handlePointerLeave);

      const resizeObserver = new ResizeObserver(() => {
        if (!renderer || disposed) return;
        const nextWidth = Math.max(host.clientWidth, 320);
        const nextHeight = Math.max(host.clientHeight, 420);
        camera.aspect = nextWidth / nextHeight;
        if (camera.aspect < 0.95) { camera.position.z = 30; camera.fov = 34; }
        else if (camera.aspect < 1.25) { camera.position.z = 23; camera.fov = 32; }
        else { camera.position.z = 18.5; camera.fov = 30; }
        camera.updateProjectionMatrix();
        renderer.setSize(nextWidth, nextHeight, false);
        composer?.setSize(nextWidth, nextHeight);
      });
      resizeObserver.observe(host);

      const clock = new THREE.Clock();
      const animate = (): void => {
        if (disposed || !renderer || !composer) return;
        animationFrame = window.requestAnimationFrame(animate);
        const delta = Math.min(clock.getDelta(), 0.04);
        const elapsed = clock.elapsedTime;
        awardObjects.forEach((display) => {
          const isFocused = focusedAwardIdRef.current === display.award.id;
          const isHovered = hoverId === display.award.id;
          const targetScale = isFocused ? 1.27 : isHovered ? 1.1 : 1;
          const targetZ = isFocused ? 1.25 : isHovered ? 0.35 : 0;
          const targetY = display.homeY + (isFocused ? 0.12 : 0) + (!reducedMotion ? Math.sin(elapsed * 1.3 + display.index) * 0.018 : 0);
          display.group.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 1 - Math.exp(-delta * 7.5));
          display.group.position.z = THREE.MathUtils.damp(display.group.position.z, display.homeZ + targetZ, 7.2, delta);
          display.group.position.y = THREE.MathUtils.damp(display.group.position.y, targetY, 7.2, delta);
          display.group.rotation.y = THREE.MathUtils.damp(display.group.rotation.y, isFocused ? -0.08 : isHovered ? -0.035 : 0, 7.2, delta);
          display.light.intensity = THREE.MathUtils.damp(display.light.intensity, isFocused ? 24 : isHovered ? 12 : 5.5, 5.5, delta);
        });
        controls?.update();
        composer.render();
      };
      animate();

      return () => {
        disposed = true;
        window.cancelAnimationFrame(animationFrame);
        resizeObserver.disconnect();
        renderer?.domElement.removeEventListener('pointermove', handlePointerMove);
        renderer?.domElement.removeEventListener('pointerdown', handlePointerDown);
        renderer?.domElement.removeEventListener('pointerup', handlePointerUp);
        renderer?.domElement.removeEventListener('pointerleave', handlePointerLeave);
        controls?.dispose();
        bloomPass?.dispose();
        composer?.dispose();
        environmentTarget?.dispose();
        renderer?.dispose();
        renderer?.domElement.remove();
        scene.traverse((object) => {
          if (object instanceof THREE.Mesh) {
            object.geometry.dispose();
            const materials = Array.isArray(object.material) ? object.material : [object.material];
            materials.forEach((material) => {
              Object.values(material).forEach((value) => {
                if (value instanceof THREE.Texture) value.dispose();
              });
              material.dispose();
            });
          }
        });
      };
    } catch (error) {
      console.error('Trophy cabinet could not initialize WebGL:', error);
      setWebglError(true);
      environmentTarget?.dispose();
      bloomPass?.dispose();
      composer?.dispose();
      renderer?.dispose();
      renderer?.domElement.remove();
      return () => { disposed = true; window.cancelAnimationFrame(animationFrame); };
    }
  }, [awards]);


  return (
    <section className="trophy-cabinet3d" aria-label="Athlete trophy cabinet">
      <header className="trophy-cabinet3d__header">
        <div>
          <span className="trophy-cabinet3d__eyebrow">THE HALL OF ACHIEVEMENT</span>
          <strong>{collectionName}</strong>
          <p>A collection built through effort, discipline and a little friendly competition.</p>
        </div>
        <div className="trophy-cabinet3d__count"><b>{String(awards.length).padStart(2, '0')}</b><span>AWARDS</span></div>
      </header>
      <div className="trophy-cabinet3d__stage" ref={hostRef}>
        <div className="trophy-cabinet3d__canvas-mount" ref={canvasMountRef} />
        {webglError && (
          <div className="trophy-cabinet3d__fallback">
            <span>3D DISPLAY UNAVAILABLE</span>
            <b>This browser could not start WebGL.</b>
            <p>Enable hardware acceleration or open this page in a browser with WebGL support.</p>
          </div>
        )}
        <div className="trophy-cabinet3d__hint"><span className="trophy-cabinet3d__hint-dot" /> DRAG TO EXPLORE <i /> SELECT A TROPHY TO OPEN ITS STORY</div>
      </div>
      <footer className="trophy-cabinet3d__footer">
        <span>✦ HAND-FINISHED DISPLAY · ONE COLLECTION, MANY STORIES</span>
        <span>{awards.length} OF 9 DISPLAY PLACES FILLED</span>
      </footer>
    </section>
  );
}
