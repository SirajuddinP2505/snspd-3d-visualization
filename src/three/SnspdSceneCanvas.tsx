import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { wavelengthToColor } from '../utils/physics';

export type DetectorPartId =
  | 'nanowire'
  | 'substrate'
  | 'contacts'
  | 'photonSource'
  | 'cryostat'
  | 'readout';

export type ViewMode = 'macroscopic' | 'microscopic' | 'hero';

interface SnspdSceneProps {
  viewMode?: ViewMode;
  resetNonce?: number;
  wavelengthNm?: number;
  widthNm?: number;
  temperatureK?: number;
  isSuperconducting?: boolean;
  photonProgress?: number;
  hotspotIntensity?: number;
  currentDiversion?: number;
  selectedPart?: DetectorPartId | null;
  onSelectPart?: (part: DetectorPartId | null) => void;
  showLabels?: boolean;
  interactive?: boolean;
}

interface CameraPreset {
  pos: [number, number, number];
  target: [number, number, number];
}

const CAMERA_PRESETS: Record<ViewMode, CameraPreset> = {
  macroscopic: { pos: [4.3, 3.25, 5.1], target: [0.15, 0.12, 0] },
  microscopic: { pos: [0.42, 1.18, 1.48], target: [0, 0.08, 0] },
  hero: { pos: [3.2, 2.25, 4.1], target: [0, 0.15, 0] },
};

// Reusable module-level math helpers (zero GC inside animation loop)
const _projVec = new THREE.Vector3();
const _desiredPos = new THREE.Vector3();
const _desiredTarget = new THREE.Vector3();
const _dummy = new THREE.Object3D();
const _carrierPt = new THREE.Vector3();

function buildMeanderCurve(): THREE.CatmullRomCurve3 {
  const pts: THREE.Vector3[] = [];
  const rows = 5;
  const xSpan = 1.65;
  const zSpacing = 0.42;
  const startZ = -((rows - 1) * zSpacing) / 2;

  pts.push(new THREE.Vector3(-2.35, 0.08, startZ));

  for (let i = 0; i < rows; i += 1) {
    const z = startZ + i * zSpacing;
    const dir = i % 2 === 0 ? 1 : -1;
    const xStart = dir === 1 ? -xSpan : xSpan;
    const xEnd = dir === 1 ? xSpan : -xSpan;

    pts.push(new THREE.Vector3(xStart, 0.08, z));
    pts.push(new THREE.Vector3(0, 0.08, z));
    pts.push(new THREE.Vector3(xEnd, 0.08, z));

    if (i < rows - 1) {
      const nextZ = z + zSpacing;
      const turnX = xEnd + dir * 0.22;
      pts.push(new THREE.Vector3(turnX, 0.08, (z + nextZ) / 2));
    }
  }

  pts.push(new THREE.Vector3(2.35, 0.08, startZ + (rows - 1) * zSpacing));
  return new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.35);
}

function createDielectricGridTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#0f1c3d';
    ctx.fillRect(0, 0, 512, 512);
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.14)';
    ctx.lineWidth = 1;
    const step = 32;
    for (let x = 0; x <= 512; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 512);
      ctx.stroke();
    }
    for (let y = 0; y <= 512; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(512, y);
      ctx.stroke();
    }
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.28)';
    ctx.lineWidth = 2;
    ctx.strokeRect(4, 4, 504, 504);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = Math.min(8, maxAnisotropy);
  tex.needsUpdate = true;
  return tex;
}

function createContactShadowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const grad = ctx.createRadialGradient(128, 128, 12, 128, 128, 124);
    grad.addColorStop(0, 'rgba(0, 0, 0, 0.65)');
    grad.addColorStop(0.6, 'rgba(0, 0, 0, 0.25)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

interface LabelEntry {
  id: DetectorPartId;
  worldPos: THREE.Vector3;
  text: string;
  macroOnly?: boolean;
}

export default function SnspdSceneCanvas({
  viewMode = 'macroscopic',
  resetNonce = 0,
  wavelengthNm = 1550,
  widthNm = 100,
  temperatureK = 2.5,
  isSuperconducting = true,
  photonProgress = 0,
  hotspotIntensity = 0,
  currentDiversion = 0,
  selectedPart = null,
  onSelectPart,
  showLabels = true,
  interactive = true,
}: SnspdSceneProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const labelElsRef = useRef<Record<string, HTMLDivElement | null>>({});
  const [contextLost, setContextLost] = useState(false);

  // Store reactive props in refs so WebGL scene never tears down on slider updates
  const propsRef = useRef({
    viewMode,
    wavelengthNm,
    widthNm,
    temperatureK,
    isSuperconducting,
    photonProgress,
    hotspotIntensity,
    currentDiversion,
    selectedPart,
    showLabels,
    interactive,
  });
  propsRef.current = {
    viewMode,
    wavelengthNm,
    widthNm,
    temperatureK,
    isSuperconducting,
    photonProgress,
    hotspotIntensity,
    currentDiversion,
    selectedPart,
    showLabels,
    interactive,
  };

  const onSelectRef = useRef(onSelectPart);
  onSelectRef.current = onSelectPart;

  const cameraAnimRef = useRef({ active: false });
  const rebuildNanowireRef = useRef<((w: number) => void) | null>(null);

  // Trigger camera transition when viewMode or resetNonce changes
  useEffect(() => {
    const preset = CAMERA_PRESETS[viewMode] || CAMERA_PRESETS.macroscopic;
    _desiredPos.set(...preset.pos);
    _desiredTarget.set(...preset.target);
    cameraAnimRef.current.active = true;
  }, [viewMode, resetNonce]);

  // Update nanowire tube geometry when widthNm changes
  useEffect(() => {
    rebuildNanowireRef.current?.(widthNm);
  }, [widthNm]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    const isSoftwareGl = (() => {
      try {
        const probeCanvas = document.createElement('canvas');
        const gl = probeCanvas.getContext('webgl2') || probeCanvas.getContext('webgl');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return true;
      }
    })();

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 520;

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    const handleContextLost = (e: Event) => {
      e.preventDefault();
      setContextLost(true);
    };
    const handleContextRestored = () => {
      setContextLost(false);
    };
    renderer.domElement.addEventListener('webglcontextlost', handleContextLost);
    renderer.domElement.addEventListener('webglcontextrestored', handleContextRestored);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#040814');
    scene.fog = new THREE.FogExp2('#040814', 0.045);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envRT = pmremGenerator.fromScene(new RoomEnvironment(), 0.04);
    scene.environment = envRT.texture;
    pmremGenerator.dispose();

    const preset0 = CAMERA_PRESETS[propsRef.current.viewMode] || CAMERA_PRESETS.macroscopic;
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 80);
    camera.position.set(...preset0.pos);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.08;
    controls.minDistance = 0.9;
    controls.maxDistance = 12;
    controls.maxPolarAngle = Math.PI / 2 - 0.04;
    controls.target.set(...preset0.target);
    controls.enabled = propsRef.current.interactive;
    controls.update();

    controls.addEventListener('start', () => {
      cameraAnimRef.current.active = false;
    });

    // Studio 3-Point Lighting Rig
    const hemiLight = new THREE.HemisphereLight('#7dd3fc', '#0f172a', 0.55);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight('#fff7ed', 1.35);
    keyLight.position.set(5, 8, 5);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.camera.near = 1;
    keyLight.shadow.camera.far = 24;
    keyLight.shadow.camera.left = -5;
    keyLight.shadow.camera.right = 5;
    keyLight.shadow.camera.top = 5;
    keyLight.shadow.camera.bottom = -5;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight('#38bdf8', 0.7);
    rimLight.position.set(-5, 3.5, -5);
    scene.add(rimLight);

    // Subtle background starfield using InstancedMesh / Points
    const starCount = 500;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i += 1) {
      const r = 14 + Math.random() * 24;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      starPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      starPositions[i * 3 + 1] = Math.abs(r * Math.cos(phi)) - 2;
      starPositions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMat = new THREE.PointsMaterial({
      color: '#93c5fd',
      size: 0.075,
      transparent: true,
      opacity: 0.55,
    });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    // Track disposable geometries, materials, textures
    const disposables: Array<{ dispose: () => void }> = [envRT, starGeo, starMat];
    const clickables: THREE.Object3D[] = [];

    const tagClickable = (obj: THREE.Object3D, partId: DetectorPartId) => {
      obj.userData.partId = partId;
      clickables.push(obj);
    };

    // Contact shadow plane under the cold stage
    const shadowTex = createContactShadowTexture();
    disposables.push(shadowTex);
    const shadowPlaneGeo = new THREE.PlaneGeometry(9.5, 9.5);
    const shadowPlaneMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false,
      opacity: 0.5,
    });
    const shadowPlane = new THREE.Mesh(shadowPlaneGeo, shadowPlaneMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -0.8;
    scene.add(shadowPlane);
    disposables.push(shadowPlaneGeo, shadowPlaneMat);

    // 1. Cryogenic Cold Stage Group (Macroscopic)
    const cryostatGroup = new THREE.Group();
    const copperMat = new THREE.MeshStandardMaterial({
      color: '#b45309',
      metalness: 0.85,
      roughness: 0.28,
    });
    const copperFlangeGeo = new THREE.CylinderGeometry(3.45, 3.68, 0.34, 48);
    const copperFlange = new THREE.Mesh(copperFlangeGeo, copperMat);
    copperFlange.position.set(0, -0.58, 0);
    copperFlange.receiveShadow = true;
    tagClickable(copperFlange, 'cryostat');
    cryostatGroup.add(copperFlange);

    const lowerPedestalGeo = new THREE.CylinderGeometry(2.1, 2.3, 0.24, 36);
    const lowerPedestal = new THREE.Mesh(lowerPedestalGeo, copperMat);
    lowerPedestal.position.set(0, -0.84, 0);
    tagClickable(lowerPedestal, 'cryostat');
    cryostatGroup.add(lowerPedestal);

    const shieldRingGeo = new THREE.TorusGeometry(3.32, 0.055, 16, 64);
    const shieldMat = new THREE.MeshStandardMaterial({
      color: '#475569',
      metalness: 0.78,
      roughness: 0.32,
    });
    const shieldRing = new THREE.Mesh(shieldRingGeo, shieldMat);
    shieldRing.rotation.x = Math.PI / 2;
    shieldRing.position.set(0, 0.45, 0);
    tagClickable(shieldRing, 'cryostat');
    cryostatGroup.add(shieldRing);

    // 12 instanced stainless mounting bolts around cold stage rim
    const boltGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.08, 6);
    const boltMat = new THREE.MeshStandardMaterial({
      color: '#cbd5e1',
      metalness: 0.9,
      roughness: 0.22,
    });
    const boltInstances = new THREE.InstancedMesh(boltGeo, boltMat, 12);
    for (let i = 0; i < 12; i += 1) {
      const ang = (i / 12) * Math.PI * 2;
      _dummy.position.set(Math.cos(ang) * 3.15, -0.39, Math.sin(ang) * 3.15);
      _dummy.rotation.set(0, ang, 0);
      _dummy.scale.setScalar(1);
      _dummy.updateMatrix();
      boltInstances.setMatrixAt(i, _dummy.matrix);
    }
    boltInstances.instanceMatrix.needsUpdate = true;
    boltInstances.computeBoundingSphere();
    cryostatGroup.add(boltInstances);

    scene.add(cryostatGroup);
    disposables.push(
      copperMat,
      copperFlangeGeo,
      lowerPedestalGeo,
      shieldRingGeo,
      shieldMat,
      boltGeo,
      boltMat
    );

    // 2. Silicon & Dielectric Optical Cavity Substrate
    const substrateGeo = new THREE.BoxGeometry(5.4, 0.34, 3.3);
    const substrateMat = new THREE.MeshStandardMaterial({
      color: '#0f172a',
      metalness: 0.32,
      roughness: 0.45,
    });
    const substrateMesh = new THREE.Mesh(substrateGeo, substrateMat);
    substrateMesh.position.set(0, -0.18, 0);
    substrateMesh.receiveShadow = true;
    substrateMesh.castShadow = true;
    tagClickable(substrateMesh, 'substrate');
    scene.add(substrateMesh);

    const gridTex = createDielectricGridTexture(renderer.capabilities.getMaxAnisotropy());
    const spacerGeo = new THREE.BoxGeometry(5.16, 0.05, 3.06);
    const spacerMat = new THREE.MeshStandardMaterial({
      map: gridTex,
      metalness: 0.18,
      roughness: 0.25,
    });
    const spacerMesh = new THREE.Mesh(spacerGeo, spacerMat);
    spacerMesh.position.set(0, 0.025, 0);
    spacerMesh.receiveShadow = true;
    tagClickable(spacerMesh, 'substrate');
    scene.add(spacerMesh);
    disposables.push(substrateGeo, substrateMat, gridTex, spacerGeo, spacerMat);

    // 3. Gold Contact Pads & Bond Wires
    const goldMat = new THREE.MeshPhysicalMaterial({
      color: '#eab308',
      metalness: 0.92,
      roughness: 0.18,
      clearcoat: 0.4,
    });
    const padGeo = new THREE.BoxGeometry(0.56, 0.065, 0.66);
    const leftPad = new THREE.Mesh(padGeo, goldMat);
    leftPad.position.set(-2.35, 0.08, -0.84);
    leftPad.castShadow = true;
    tagClickable(leftPad, 'contacts');
    scene.add(leftPad);

    const rightPad = new THREE.Mesh(padGeo, goldMat);
    rightPad.position.set(2.35, 0.08, 0.84);
    rightPad.castShadow = true;
    tagClickable(rightPad, 'contacts');
    scene.add(rightPad);

    // Bond wire arch on right contact pad
    const bondCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(2.45, 0.11, 0.84),
      new THREE.Vector3(2.68, 0.34, 0.84),
      new THREE.Vector3(2.9, 0.08, 0.84),
    ]);
    const bondGeo = new THREE.TubeGeometry(bondCurve, 24, 0.014, 8, false);
    const bondWire = new THREE.Mesh(bondGeo, goldMat);
    tagClickable(bondWire, 'contacts');
    scene.add(bondWire);
    disposables.push(goldMat, padGeo, bondGeo);

    // 4. Superconducting Meandering Nanowire
    const meanderCurve = buildMeanderCurve();
    const nanowireMat = new THREE.MeshStandardMaterial({
      color: '#22d3ee',
      emissive: '#0891b2',
      emissiveIntensity: 0.55,
      metalness: 0.68,
      roughness: 0.22,
    });
    const makeWireGeo = (wNm: number) => {
      const r = 0.032 + ((wNm - 50) / 150) * 0.025;
      return new THREE.TubeGeometry(meanderCurve, 220, r, 12, false);
    };
    let wireGeo = makeWireGeo(propsRef.current.widthNm);
    const nanowireMesh = new THREE.Mesh(wireGeo, nanowireMat);
    nanowireMesh.castShadow = true;
    nanowireMesh.receiveShadow = true;
    tagClickable(nanowireMesh, 'nanowire');
    scene.add(nanowireMesh);

    rebuildNanowireRef.current = (wNm: number) => {
      const nextGeo = makeWireGeo(wNm);
      nanowireMesh.geometry = nextGeo;
      wireGeo.dispose();
      wireGeo = nextGeo;
    };
    disposables.push(nanowireMat);

    // 5. Single-Mode Optical Fiber Photon Source (Macroscopic)
    const fiberGroup = new THREE.Group();
    fiberGroup.position.set(0, 2.72, 0);
    const ferruleMat = new THREE.MeshStandardMaterial({
      color: '#94a3b8',
      metalness: 0.7,
      roughness: 0.24,
    });
    const ferruleGeo = new THREE.CylinderGeometry(0.16, 0.13, 0.55, 24);
    const ferruleMesh = new THREE.Mesh(ferruleGeo, ferruleMat);
    tagClickable(ferruleMesh, 'photonSource');
    fiberGroup.add(ferruleMesh);

    const collarGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.16, 24);
    const collarMat = new THREE.MeshStandardMaterial({
      color: '#334155',
      metalness: 0.65,
      roughness: 0.35,
    });
    const collarMesh = new THREE.Mesh(collarGeo, collarMat);
    collarMesh.position.y = 0.28;
    tagClickable(collarMesh, 'photonSource');
    fiberGroup.add(collarMesh);

    const tipGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.06, 16);
    const tipMat = new THREE.MeshStandardMaterial({
      color: '#38bdf8',
      emissive: '#0284c7',
      emissiveIntensity: 1.4,
    });
    const tipMesh = new THREE.Mesh(tipGeo, tipMat);
    tipMesh.position.y = -0.28;
    tagClickable(tipMesh, 'photonSource');
    fiberGroup.add(tipMesh);

    scene.add(fiberGroup);
    disposables.push(ferruleMat, ferruleGeo, collarGeo, collarMat, tipGeo, tipMat);

    // 6. Bias Tee & 50 Ohm Readout Module (Macroscopic)
    const readoutGroup = new THREE.Group();
    const traceGeo = new THREE.BoxGeometry(0.55, 0.03, 0.07);
    const traceMesh = new THREE.Mesh(traceGeo, goldMat);
    traceMesh.position.set(2.88, 0.06, 0.84);
    tagClickable(traceMesh, 'readout');
    readoutGroup.add(traceMesh);

    const coaxPostGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.44, 16);
    const coaxPost = new THREE.Mesh(coaxPostGeo, shieldMat);
    coaxPost.position.set(3.15, -0.14, 0.84);
    tagClickable(coaxPost, 'readout');
    readoutGroup.add(coaxPost);

    const readoutBoxGeo = new THREE.BoxGeometry(0.68, 0.38, 1.38);
    const readoutMat = new THREE.MeshStandardMaterial({
      color: '#1e293b',
      emissive: '#000000',
      metalness: 0.48,
      roughness: 0.35,
    });
    const readoutBox = new THREE.Mesh(readoutBoxGeo, readoutMat);
    readoutBox.position.set(3.45, -0.28, 0.25);
    tagClickable(readoutBox, 'readout');
    readoutGroup.add(readoutBox);

    scene.add(readoutGroup);
    disposables.push(traceGeo, coaxPostGeo, readoutBoxGeo, readoutMat);

    // 7. Instanced Cooper-Pair Supercurrent Carriers
    const carrierCount = 30;
    const carrierGeo = new THREE.SphereGeometry(0.028, 10, 10);
    const carrierMat = new THREE.MeshStandardMaterial({
      color: '#a5f3fc',
      emissive: '#22d3ee',
      emissiveIntensity: 1.55,
    });
    const carrierInstanced = new THREE.InstancedMesh(carrierGeo, carrierMat, carrierCount);
    carrierInstanced.frustumCulled = false;
    scene.add(carrierInstanced);
    disposables.push(carrierGeo, carrierMat);

    // 8. Single-Photon Wavepacket Group
    const photonGroup = new THREE.Group();
    const photonCoreGeo = new THREE.SphereGeometry(0.095, 24, 24);
    const photonCoreMat = new THREE.MeshStandardMaterial({
      color: '#38bdf8',
      emissive: '#38bdf8',
      emissiveIntensity: 2.3,
      toneMapped: false,
    });
    const photonCore = new THREE.Mesh(photonCoreGeo, photonCoreMat);
    photonGroup.add(photonCore);

    const photonRingGeo = new THREE.TorusGeometry(0.19, 0.018, 12, 32);
    const photonRingMat = new THREE.MeshStandardMaterial({
      color: '#e0f2fe',
      emissive: '#38bdf8',
      emissiveIntensity: 1.5,
      transparent: true,
      opacity: 0.85,
    });
    const photonRing = new THREE.Mesh(photonRingGeo, photonRingMat);
    photonGroup.add(photonRing);

    const photonLight = new THREE.PointLight('#38bdf8', 2.0, 3.2);
    photonGroup.add(photonLight);
    scene.add(photonGroup);
    disposables.push(photonCoreGeo, photonCoreMat, photonRingGeo, photonRingMat);

    // 9. Localized Resistive Hotspot & Instanced Quasiparticles
    const hotspotGroup = new THREE.Group();
    hotspotGroup.position.set(0, 0.09, 0);

    const hsCoreGeo = new THREE.SphereGeometry(0.12, 24, 24);
    const hsCoreMat = new THREE.MeshStandardMaterial({
      color: '#ff6d00',
      emissive: '#ff3d00',
      emissiveIntensity: 2.5,
      transparent: true,
      opacity: 0.9,
    });
    const hsCore = new THREE.Mesh(hsCoreGeo, hsCoreMat);
    hotspotGroup.add(hsCore);

    const hsHaloGeo = new THREE.SphereGeometry(0.16, 24, 24);
    const hsHaloMat = new THREE.MeshStandardMaterial({
      color: '#ef4444',
      emissive: '#f97316',
      emissiveIntensity: 1.35,
      transparent: true,
      opacity: 0.34,
      depthWrite: false,
    });
    const hsHalo = new THREE.Mesh(hsHaloGeo, hsHaloMat);
    hotspotGroup.add(hsHalo);

    const qpCount = 16;
    const qpGeo = new THREE.SphereGeometry(0.018, 10, 10);
    const qpMat = new THREE.MeshStandardMaterial({
      color: '#fde047',
      emissive: '#fb923c',
      emissiveIntensity: 1.8,
    });
    const qpInstanced = new THREE.InstancedMesh(qpGeo, qpMat, qpCount);
    qpInstanced.frustumCulled = false;
    hotspotGroup.add(qpInstanced);

    const hotspotLight = new THREE.PointLight('#ff5722', 0, 2.6);
    hotspotGroup.add(hotspotLight);

    scene.add(hotspotGroup);
    disposables.push(hsCoreGeo, hsCoreMat, hsHaloGeo, hsHaloMat, qpGeo, qpMat);

    // Pre-compile shaders on hardware GPUs
    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    // 3D Label projections
    const labelEntries: LabelEntry[] = [
      { id: 'cryostat', worldPos: new THREE.Vector3(-2.85, -0.32, 1.75), text: 'Cryogenic Stage', macroOnly: true },
      { id: 'substrate', worldPos: new THREE.Vector3(0, -0.22, 1.75), text: 'SiO₂ / Si Substrate' },
      { id: 'contacts', worldPos: new THREE.Vector3(-2.35, 0.36, -0.84), text: 'Au Contact Pads' },
      { id: 'nanowire', worldPos: new THREE.Vector3(0, 0.36, -0.95), text: 'Meandering Nanowire' },
      { id: 'photonSource', worldPos: new THREE.Vector3(0.48, 2.72, 0), text: 'Optical Fiber Source', macroOnly: true },
      { id: 'readout', worldPos: new THREE.Vector3(3.45, 0.18, 0.25), text: 'Bias Tee & 50 Ω Readout', macroOnly: true },
    ];

    // Raycasting for clicking 3D components (ignoring drags)
    const raycaster = new THREE.Raycaster();
    const pointerNdc = new THREE.Vector2();
    let downX = 0;
    let downY = 0;

    const onPointerDown = (e: PointerEvent) => {
      downX = e.clientX;
      downY = e.clientY;
    };

    const onPointerUp = (e: PointerEvent) => {
      if (!propsRef.current.interactive) return;
      const dx = e.clientX - downX;
      const dy = e.clientY - downY;
      if (dx * dx + dy * dy > 25) return; // Dragging camera, not clicking

      const rect = renderer.domElement.getBoundingClientRect();
      pointerNdc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointerNdc.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(pointerNdc, camera);
      const hits = raycaster.intersectObjects(clickables, false);
      if (hits.length > 0) {
        const partId = hits[0].object.userData.partId as DetectorPartId | undefined;
        onSelectRef.current?.(partId ?? null);
      } else {
        onSelectRef.current?.(null);
      }
    };

    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    renderer.domElement.addEventListener('pointerup', onPointerUp);

    // ResizeObserver for crisp layout adaptation
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = Math.max(1, entry.contentRect.width);
        const h = Math.max(1, entry.contentRect.height);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      }
    });
    resizeObserver.observe(container);

    // Animation loop with software-WebGL pacing
    let frameId = 0;
    let disposed = false;
    const clock = new THREE.Clock();

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync ? gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0) : null;
      gl.flush();
      const poll = () => {
        if (disposed) return;
        const state = sync && gl.getSyncParameter ? gl.getSyncParameter(sync, gl.SYNC_STATUS) : gl.SIGNALED;
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync && gl.deleteSync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    function tick() {
      if (disposed) return;
      const delta = Math.min(0.05, clock.getDelta());
      const elapsed = clock.getElapsedTime();
      const p = propsRef.current;
      const isMicro = p.viewMode === 'microscopic';

      // Visibility toggling for microscopic focus
      cryostatGroup.visible = !isMicro;
      fiberGroup.visible = !isMicro;
      readoutGroup.visible = !isMicro;
      shadowPlane.visible = !isMicro;

      // Smooth exponential camera preset transitions
      if (cameraAnimRef.current.active) {
        camera.position.x = THREE.MathUtils.damp(camera.position.x, _desiredPos.x, 5.5, delta);
        camera.position.y = THREE.MathUtils.damp(camera.position.y, _desiredPos.y, 5.5, delta);
        camera.position.z = THREE.MathUtils.damp(camera.position.z, _desiredPos.z, 5.5, delta);
        controls.target.x = THREE.MathUtils.damp(controls.target.x, _desiredTarget.x, 5.5, delta);
        controls.target.y = THREE.MathUtils.damp(controls.target.y, _desiredTarget.y, 5.5, delta);
        controls.target.z = THREE.MathUtils.damp(controls.target.z, _desiredTarget.z, 5.5, delta);
        if (camera.position.distanceTo(_desiredPos) < 0.03) {
          cameraAnimRef.current.active = false;
        }
      }
      controls.update();

      // Update part highlight & superconductor material states
      copperMat.emissive.set(p.selectedPart === 'cryostat' ? '#451a03' : '#000000');
      substrateMat.color.set(p.selectedPart === 'substrate' ? '#1e3a8a' : '#0f172a');
      goldMat.color.set(p.selectedPart === 'contacts' ? '#fde047' : '#eab308');
      ferruleMat.color.set(p.selectedPart === 'photonSource' ? '#38bdf8' : '#94a3b8');

      nanowireMat.color.set(
        !p.isSuperconducting ? '#94a3b8' : p.hotspotIntensity > 0.2 ? '#38bdf8' : '#22d3ee'
      );
      nanowireMat.emissive.set(
        !p.isSuperconducting ? '#334155' : p.selectedPart === 'nanowire' ? '#67e8f9' : '#0891b2'
      );
      nanowireMat.emissiveIntensity = p.isSuperconducting
        ? 0.55 + p.hotspotIntensity * 0.35
        : 0.1;

      readoutMat.color.set(p.selectedPart === 'readout' ? '#1d4ed8' : '#1e293b');
      readoutMat.emissive.set(p.currentDiversion > 0.08 ? '#10b981' : '#000000');
      readoutMat.emissiveIntensity = p.currentDiversion * 1.4;

      // Update Cooper-pair carrier instances
      carrierInstanced.visible = p.isSuperconducting;
      if (p.isSuperconducting) {
        const speed = 0.16 * (1 - p.currentDiversion * 0.45);
        for (let i = 0; i < carrierCount; i += 1) {
          const u = (i / carrierCount + elapsed * speed) % 1;
          meanderCurve.getPointAt(u, _carrierPt);
          const distSq = _carrierPt.x * _carrierPt.x + _carrierPt.z * _carrierPt.z;
          let lateralShift = 0;
          if (p.hotspotIntensity > 0.1 && distSq < 0.25) {
            const proximity = Math.max(0, 1 - Math.sqrt(distSq) / 0.5);
            const sideSign = i % 2 === 0 ? 1 : -1;
            lateralShift = sideSign * proximity * p.hotspotIntensity * 0.11;
          }
          _dummy.position.set(_carrierPt.x, _carrierPt.y + 0.055, _carrierPt.z + lateralShift);
          _dummy.rotation.set(0, 0, 0);
          const sc = p.hotspotIntensity > 0.4 && distSq < 0.08 ? 0.55 : 1;
          _dummy.scale.setScalar(sc);
          _dummy.updateMatrix();
          carrierInstanced.setMatrixAt(i, _dummy.matrix);
        }
        carrierInstanced.instanceMatrix.needsUpdate = true;
      }

      // Update Photon wavepacket
      const showPhoton = p.photonProgress > 0 && p.photonProgress < 0.995;
      photonGroup.visible = showPhoton;
      if (showPhoton) {
        const pColor = wavelengthToColor(p.wavelengthNm);
        photonCoreMat.color.set(pColor);
        photonCoreMat.emissive.set(pColor);
        photonRingMat.emissive.set(pColor);
        photonLight.color.set(pColor);

        const y = 2.65 - (2.65 - 0.09) * Math.min(1, Math.max(0, p.photonProgress));
        photonGroup.position.set(0, y, 0);
        photonRing.rotation.z = elapsed * 5;
        photonRing.rotation.x = Math.sin(elapsed * 6) * 0.4;
      }

      // Update Hotspot & Quasiparticle cloud
      const showHotspot = p.hotspotIntensity > 0.02;
      hotspotGroup.visible = showHotspot;
      if (showHotspot) {
        const s = 0.25 + p.hotspotIntensity * 1.1;
        hsCore.scale.set(s * 1.45, s * 0.75, s * 1.15);
        hsCoreMat.emissiveIntensity = 2.6 * p.hotspotIntensity;
        hsCoreMat.opacity = Math.min(0.95, p.hotspotIntensity * 1.1);

        const h =
          0.35 +
          p.hotspotIntensity * 1.65 +
          Math.sin(elapsed * 14) * 0.04 * p.hotspotIntensity;
        hsHalo.scale.set(h * 1.6, h * 0.6, h * 1.3);
        hsHaloMat.opacity = 0.34 * p.hotspotIntensity;
        hotspotLight.intensity = 3.2 * p.hotspotIntensity;

        for (let i = 0; i < qpCount; i += 1) {
          const angle = (i / qpCount) * Math.PI * 2;
          const speed = 1.5 + (i % 4) * 0.4;
          const spread =
            0.05 + p.hotspotIntensity * (0.28 + Math.abs(Math.sin(elapsed * speed + i)) * 0.16);
          const yOff = ((i % 5) - 2) * 0.015 + Math.sin(elapsed * 4 + i) * 0.025;
          _dummy.position.set(
            Math.cos(angle + elapsed * 1.2) * spread,
            yOff,
            Math.sin(angle + elapsed * 1.2) * spread * 0.55
          );
          _dummy.rotation.set(0, 0, 0);
          _dummy.scale.setScalar(0.8 + p.hotspotIntensity * 0.5);
          _dummy.updateMatrix();
          qpInstanced.setMatrixAt(i, _dummy.matrix);
        }
        qpInstanced.instanceMatrix.needsUpdate = true;
      }

      // Project 3D label positions directly onto DOM elements (zero React re-renders)
      const cw = renderer.domElement.clientWidth;
      const ch = renderer.domElement.clientHeight;
      for (const entry of labelEntries) {
        const el = labelElsRef.current[entry.id];
        if (!el) continue;
        if (!p.showLabels || (entry.macroOnly && isMicro)) {
          el.style.display = 'none';
          continue;
        }
        _projVec.copy(entry.worldPos).project(camera);
        if (_projVec.z > 1) {
          el.style.display = 'none';
          continue;
        }
        const sx = ((_projVec.x + 1) / 2) * cw;
        const sy = ((-_projVec.y + 1) / 2) * ch;
        el.style.display = 'block';
        el.style.transform = `translate(-50%, -50%) translate(${sx.toFixed(1)}px, ${sy.toFixed(1)}px)`;

        if (entry.id === 'cryostat') {
          el.textContent = `Cryogenic Stage (${p.temperatureK.toFixed(1)} K)`;
        } else if (entry.id === 'nanowire') {
          el.textContent = `Meandering Nanowire (${p.widthNm} nm)`;
        }
      }

      renderer.render(scene, camera);

      if (isSoftwareGl) afterDraw(tick);
      else frameId = requestAnimationFrame(tick);
    }

    tick();

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      resizeObserver.disconnect();
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      renderer.domElement.removeEventListener('pointerup', onPointerUp);
      renderer.domElement.removeEventListener('webglcontextlost', handleContextLost);
      renderer.domElement.removeEventListener('webglcontextrestored', handleContextRestored);
      controls.dispose();
      wireGeo.dispose();
      disposables.forEach((d) => d.dispose());
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  if (contextLost) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-[#040814] p-6 text-center text-slate-300">
        <div>
          <p className="font-semibold text-slate-100">3D WebGL Context Paused</p>
          <p className="mt-1 text-sm text-slate-400">
            Graphics context was suspended by the browser. Reload or switch tabs to resume.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full overflow-hidden">
      <div ref={containerRef} className="h-full w-full" />

      {/* Projected 3D Labels (solid obsidian cards — no backdrop-blur over WebGL) */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {(
          [
            { id: 'cryostat', text: `Cryogenic Stage (${temperatureK.toFixed(1)} K)` },
            { id: 'substrate', text: 'SiO₂ / Si Substrate' },
            { id: 'contacts', text: 'Au Contact Pads' },
            { id: 'nanowire', text: `Meandering Nanowire (${widthNm} nm)` },
            { id: 'photonSource', text: 'Optical Fiber Source' },
            { id: 'readout', text: 'Bias Tee & 50 Ω Readout' },
          ] as const
        ).map((lbl) => (
          <div
            key={lbl.id}
            ref={(el) => {
              labelElsRef.current[lbl.id] = el;
            }}
            style={{ display: showLabels ? 'block' : 'none' }}
            className="absolute left-0 top-0 whitespace-nowrap rounded-md border border-cyan-500/45 bg-[#040918]/92 px-2 py-0.5 font-mono text-[11px] text-sky-100"
          >
            {lbl.text}
          </div>
        ))}
      </div>
    </div>
  );
}
