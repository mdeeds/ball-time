/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ 340:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Ball = void 0;
const THREE = __importStar(__webpack_require__(396));
const meshMaker_1 = __webpack_require__(147);
const ballMaterial_1 = __webpack_require__(141);
class Ball extends THREE.Object3D {
    ammo;
    physicsWorld;
    isFlying = false;
    btBody;
    constructor(ammo, physicsWorld) {
        super();
        this.ammo = ammo;
        this.physicsWorld = physicsWorld;
        const sphere = new THREE.Mesh(new THREE.IcosahedronGeometry(0.1, 4), new ballMaterial_1.BallMaterial());
        this.add(sphere);
        const shape = new ammo.btSphereShape(0.1);
        shape.setMargin(0.05);
        this.position.y = 1.0;
        this.btBody = meshMaker_1.MeshMaker.makeBody(this, ammo, shape, 0.5);
        this.btBody.setDamping(0.0, 0.9);
        this.btBody.setFriction(0.4);
        this.btBody.setCcdMotionThreshold(1e-1);
        this.btBody.setCcdSweptSphereRadius(0.1);
        // this.add(new THREE.AxesHelper(100));
    }
    moveToTarget(source, target, threePosition, threeQuaternion) {
        const iso = new THREE.Matrix4();
        iso.compose(threePosition, threeQuaternion, new THREE.Vector3(1, 1, 1));
        if (!!source) {
            source.updateMatrixWorld();
            iso.multiply(source.matrixWorld);
        }
        // iso is now in World Space.
        const targetMatrix = new THREE.Matrix4();
        target.updateMatrixWorld();
        targetMatrix.copy(target.matrixWorld);
        targetMatrix.invert();
        iso.multiply(targetMatrix);
        iso.decompose(this.position, this.quaternion, this.scale);
        this.matrix.compose(this.position, this.quaternion, this.scale);
        if (target != this.parent) {
            this.parent.remove(this);
            target.add(this);
        }
    }
    update() {
        if (!this.isFlying) {
            return;
        }
        const transform = new this.ammo.btTransform();
        this.btBody.getMotionState().getWorldTransform(transform);
        const position = transform.getOrigin();
        const quaternion = transform.getRotation();
        // Convert the position and quaternion to THREE.js vectors
        this.position.set(position.x(), position.y(), position.z());
        this.quaternion.set(quaternion.x(), quaternion.y(), quaternion.z(), quaternion.w());
        // const threePosition = new THREE.Vector3(position.x(), position.y(), position.z());
        // const threeQuaternion = new THREE.Quaternion(quaternion.x(), quaternion.y(), quaternion.z(), quaternion.w());
        // this.moveToTarget(null, this.parent, threePosition, threeQuaternion);
    }
    release(into, velocity) {
        this.isFlying = true;
        const worldPosition = new THREE.Vector3();
        this.getWorldPosition(worldPosition);
        into.worldToLocal(worldPosition);
        const worldQuaternion = new THREE.Quaternion();
        console.log(`Release at ${[worldPosition.x, worldPosition.y, worldPosition.z]}`);
        // TODO: This feels like it leaks.
        const transform = new this.ammo.btTransform(new this.ammo.btQuaternion(worldQuaternion.x, worldQuaternion.y, worldQuaternion.z, worldQuaternion.w), new this.ammo.btVector3(worldPosition.x, worldPosition.y, worldPosition.z));
        this.btBody.getMotionState().getWorldTransform(transform);
        const ms = this.btBody.getMotionState();
        transform.getRotation().setX(worldQuaternion.x);
        transform.getRotation().setY(worldQuaternion.y);
        transform.getRotation().setZ(worldQuaternion.z);
        transform.getRotation().setW(worldQuaternion.w);
        transform.getOrigin().setX(worldPosition.x);
        transform.getOrigin().setY(worldPosition.y);
        transform.getOrigin().setZ(worldPosition.z);
        const lin_vel = new this.ammo.btVector3(velocity.x, velocity.y, velocity.z);
        this.btBody.setLinearVelocity(lin_vel);
        ms.setWorldTransform(transform);
        this.btBody.setMotionState(ms);
        this.btBody.setActivationState(4);
        this.btBody.activate(true);
        // {
        //   const transform2 = new this.ammo.btTransform()
        //   this.btBody.getMotionState().getWorldTransform(transform2);
        // }
        // this.moveToTarget(this.parent, into, this.position, this.quaternion);
        // {
        //   const transform2 = new this.ammo.btTransform()
        //   this.btBody.getMotionState().getWorldTransform(transform2);
        // }
        into.add(this);
        this.physicsWorld.addRigidBody(this.btBody);
    }
    grab(target) {
        this.isFlying = false;
        this.moveToTarget(this.parent, target, this.position, this.quaternion);
        this.physicsWorld.removeRigidBody(this.btBody);
    }
    getIsFlying() {
        return this.isFlying;
    }
}
exports.Ball = Ball;
//# sourceMappingURL=ball.js.map

/***/ }),

/***/ 141:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.BallMaterial = void 0;
const THREE = __importStar(__webpack_require__(396));
class BallMaterial extends THREE.ShaderMaterial {
    constructor() {
        super({
            vertexShader: `
varying vec3 vNormal;
//varying float viewDot;
void main() {
  // vec4 worldPosition = modelMatrix * vec4(position, 1.0);
  // worldPosition /= worldPosition.w;
  // vec3 toCamera = normalize(cameraPosition - worldPosition.xyz);
  // viewDot = dot(normal, toCamera);

  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  vNormal = normalMatrix * normal;
}
        `,
            fragmentShader: `
varying vec3 vNormal;
//varying float viewDot;
void main() {
  float intensity = 0.5 + 0.5 * clamp(vNormal.y, 0.0, 1.0);
  // float directness = clamp(viewDot, 0.0, 1.0);
  // intensity *= directness;

  vec3 c = vec3(255.0/255.0, 105.0/255.0, 110.0/255.0);

  gl_FragColor = vec4(intensity * c, 1.0);
}  
        `
        });
    }
}
exports.BallMaterial = BallMaterial;
//# sourceMappingURL=ballMaterial.js.map

/***/ }),

/***/ 995:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Floor = void 0;
const THREE = __importStar(__webpack_require__(396));
const BufferGeometryUtils = __importStar(__webpack_require__(140));
const floorMaterial_1 = __webpack_require__(41);
class Floor extends THREE.Mesh {
    floorMaterial;
    constructor() {
        const floorMaterial = new floorMaterial_1.FloorMaterial();
        super(new THREE.PlaneGeometry(100, 100, 300, 300), floorMaterial);
        this.floorMaterial = floorMaterial;
        this.geometry.rotateX(-Math.PI / 2);
        const vertices = this.geometry.attributes.position;
        const v = new THREE.Vector3();
        for (let i = 0; i < vertices.count; ++i) {
            v.fromBufferAttribute(vertices, i);
            v.y = 2.0 * this.nnn(v.x * 0.1, v.z * 0.1);
            vertices.setXYZ(i, v.x, v.y, v.z);
        }
        this.geometry.computeVertexNormals();
        this.geometry = BufferGeometryUtils.mergeVertices(this.geometry, 0.01);
    }
    setBallPosition(p) {
        this.floorMaterial.setBallPosition(p);
    }
    mmm(x, y) {
        const a = 0.31;
        const b = 0.71;
        const c = 0.72;
        const d = 0.34;
        const mag = Math.sin(x + 1.3 * Math.sin(a * x) + 1.5 * Math.sin(b * y))
            * Math.sin(y + 1.3 * Math.sin(c * x) + 1.1 * Math.sin(d * y));
        return mag;
    }
    nnn(x, y) {
        let z = 0.0;
        let m = 1.0;
        let o = 1.0;
        for (let i = 0; i < 7; ++i) {
            z = z + m * this.mmm((x + 112) * o, (y + 112) * o);
            m *= 0.4;
            o *= 1.9;
        }
        return z * 0.5;
    }
}
exports.Floor = Floor;
//# sourceMappingURL=floor.js.map

/***/ }),

/***/ 41:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.FloorMaterial = void 0;
const THREE = __importStar(__webpack_require__(396));
class FloorMaterial extends THREE.ShaderMaterial {
    ballPosition;
    constructor() {
        const ballPosition = new THREE.Vector3();
        super({
            uniforms: {
                ballPosition: { value: ballPosition }
            },
            vertexShader: `
varying vec3 vNormal;
varying float viewDot;
varying vec3 worldPosition;
varying float vYHeight;
uniform vec3 ballPosition;
void main() {
  vec4 wp = modelMatrix * vec4(position, 1.0);
  wp /= wp.w;
  worldPosition = wp.xyz;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  vNormal = normalMatrix * normal;
  vec3 toCamera = cameraPosition - worldPosition;
  toCamera /= length(toCamera);
  viewDot = dot(normal, toCamera);
  vYHeight = max(0.0, ballPosition.y - worldPosition.y);
}
        `,
            fragmentShader: `
varying vec3 vNormal;
varying float viewDot;
varying vec3 worldPosition;
uniform vec3 ballPosition;
varying float vYHeight;
void main() {
  float intensity = pow((clamp(vNormal.y, 0.0, 1.0)), 3.0);
  float directness = 0.5 + 0.5 * smoothstep(0.05, 0.15, viewDot);
  intensity *= directness;

  // vec3 c = vec3(34.0/255.0, 139.0/255.0, 34.0/255.0);  // ForestGreen
  vec3 c = vec3(65.0/255.0, 105.0/255.0, 225.0/255.0);  // RoyalBlue

  intensity *= smoothstep(0.05, 0.15 + vYHeight * 0.5, 
    length(worldPosition.xz - ballPosition.xz));

  gl_FragColor = vec4(intensity * c, 1.0);
}  
        `
        });
        this.ballPosition = ballPosition;
    }
    setBallPosition(p) {
        this.ballPosition.copy(p);
        this.uniformsNeedUpdate = true;
    }
}
exports.FloorMaterial = FloorMaterial;
//# sourceMappingURL=floorMaterial.js.map

/***/ }),

/***/ 417:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Game = void 0;
const THREE = __importStar(__webpack_require__(396));
const VRButton_js_1 = __webpack_require__(18);
const three_1 = __webpack_require__(396);
const floor_1 = __webpack_require__(995);
const meshMaker_1 = __webpack_require__(147);
const unionControls_1 = __webpack_require__(87);
const keyControls_1 = __webpack_require__(26);
const ball_1 = __webpack_require__(340);
const gripControls_1 = __webpack_require__(474);
const launcher_1 = __webpack_require__(135);
const musicSource_1 = __webpack_require__(444);
class Game {
    ammo;
    audioCtx;
    // As is our convention, the universe is moved around the player, and the player is in world space:
    //
    // World (Scene)
    // +-- Player
    // | +-- Camera
    // |   + Ball (when caught)
    // + tail
    // +-- Universe
    //   + Ball (when flying)
    //   + Launcher
    renderer;
    camera;
    scene = new THREE.Scene();
    universe = new THREE.Group();
    tail = new THREE.Mesh(new THREE.IcosahedronGeometry(0.1, 2), new THREE.MeshBasicMaterial({ color: 'brown' }));
    antiTail = new THREE.Mesh(new THREE.IcosahedronGeometry(0.1, 2), new THREE.MeshBasicMaterial({ color: 'black' }));
    player = new THREE.Group();
    controls = new unionControls_1.UnionControls();
    ball;
    floor;
    music;
    physicsWorld;
    constructor(ammo, audioCtx) {
        this.ammo = ammo;
        this.audioCtx = audioCtx;
        document.body.innerHTML = "";
        this.setUpPhysics();
        this.setUpCamera();
        this.setUpSky();
        this.setUpFloor();
        this.setUpBall();
        this.setUpLauncher();
        this.setUpRenderer();
        this.setUpControls();
    }
    setUpPhysics() {
        // Physics configuration
        const collisionConfiguration = new this.ammo.btDefaultCollisionConfiguration();
        const dispatcher = new this.ammo.btCollisionDispatcher(collisionConfiguration);
        const broadphase = new this.ammo.btDbvtBroadphase();
        const solver = new this.ammo.btSequentialImpulseConstraintSolver();
        this.physicsWorld = new this.ammo.btDiscreteDynamicsWorld(dispatcher, broadphase, solver, collisionConfiguration);
        this.physicsWorld.setGravity(new this.ammo.btVector3(0, -9.8, 0));
    }
    setUpCamera() {
        this.camera = new THREE.PerspectiveCamera(75, /*aspect=*/ 1.0, /*near=*/ 0.1, 
        /*far=*/ 20000);
        this.camera.position.set(0, 1.7, 0);
        this.camera.lookAt(0, 1.7, -100);
        this.player.add(this.camera);
        this.scene.add(this.player);
        this.scene.add(this.tail);
        this.scene.add(this.antiTail);
        this.scene.add(this.universe);
        this.tail.position.set(0, 0, 1.0);
        this.antiTail.position.set(0, 0, -1.0);
    }
    setUpSky() {
        const texture = new THREE.TextureLoader().load('img/city-pano.png');
        const sky = new THREE.Mesh(new THREE.SphereGeometry(10000, 32, 16), new three_1.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide }));
        this.scene.add(sky);
    }
    setUpFloor() {
        this.floor = new floor_1.Floor();
        this.universe.add(this.floor);
        const floorBtBody = meshMaker_1.MeshMaker.makeStaticBody(this.floor, this.ammo);
        floorBtBody.setFriction(0.5);
        this.physicsWorld.addRigidBody(floorBtBody);
        this.rayCast();
    }
    zero = new THREE.Vector3(0, 0, 0);
    setUpBall() {
        this.ball = new ball_1.Ball(this.ammo, this.physicsWorld);
        this.universe.add(this.ball);
        this.ball.position.set(0, 3, -3);
        this.ball.updateMatrixWorld(true);
        this.ball.release(this.universe, this.zero);
        this.music = new musicSource_1.MusicSource('music/play ball.mp3', this.camera, this.audioCtx);
        this.ball.add(this.music);
    }
    launcher;
    setUpLauncher() {
        this.launcher = new launcher_1.Launcher();
        this.launcher.position.set(6.0, 0.0, -3.0);
        this.universe.add(this.launcher);
    }
    v = new THREE.Vector3();
    rayCast() {
        this.camera.getWorldPosition(this.v);
        this.v.sub(this.universe.position);
        const start = new this.ammo.btVector3(this.v.x, this.v.y, this.v.z);
        const end = new this.ammo.btVector3(this.v.x, -10, this.v.z);
        const callback = new this.ammo.ClosestRayResultCallback(start, end);
        //RayCallback.m_collisionFilterMask = FILTER_CAMERA;
        this.physicsWorld.rayTest(start, end, callback);
        if (callback.hasHit()) {
            const intersection = callback.get_m_hitPointWorld();
            this.universe.position.y = -intersection.y() + 1.0;
            // const normal = callback.get_m_hitNormalWorld();
            // intersection.op_sub(start);
            // console.log(`Distance to ground: ${intersection.length()}`);
            // console.log(`Normal: ${[normal.x(), normal.y(), normal.z()]}`);
        }
        else {
            // console.log('miss!');
        }
    }
    t0 = new THREE.Vector3();
    t1 = new THREE.Vector3();
    nm = new THREE.Matrix3();
    nextTimeS = 0;
    launchTimeS = 0;
    checkBall(currentTimeS) {
        if (currentTimeS < this.nextTimeS) {
            return;
        }
        this.camera.getWorldPosition(this.t0);
        if (this.ball.getIsFlying()) {
            this.ball.getWorldPosition(this.t1);
            this.t0.sub(this.t1);
            // console.log(`Range: ${this.t0.length()}, y=${this.t0.y}`);
            if (this.t0.length() < 0.8) {
                console.log(`Grabbed!`);
                this.ball.grab(this.camera);
                this.ball.position.set(0, -0.2, -0.4);
                this.nextTimeS = currentTimeS + 1.0;
            }
        }
        else {
            if (this.launchTimeS == 0) {
                this.launcher.getWorldPosition(this.t1);
                this.t0.sub(this.t1);
                this.t0.y = 0;
                if (this.t0.length() < 0.8) {
                    console.log(`Dropped!`);
                    this.ball.grab(this.launcher.getBody());
                    this.ball.position.set(0, 4.5, 0);
                    this.nextTimeS = currentTimeS + 1.0;
                    this.launchTimeS = currentTimeS + 3.0;
                }
            }
            else if (currentTimeS >= this.launchTimeS) {
                this.launchTimeS = 0;
                this.t1.set(0, 9 + Math.random() * 2, 0);
                this.launcher.getBody().updateMatrixWorld();
                this.nm.getNormalMatrix(this.launcher.getBody().matrixWorld);
                this.t1.applyMatrix3(this.nm);
                this.ball.release(this.universe, this.t1);
            }
        }
    }
    setUpRenderer() {
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.shadowMap.enabled = true;
        this.renderer.setSize(1024, 1024);
        document.body.appendChild(this.renderer.domElement);
        document.body.appendChild(VRButton_js_1.VRButton.createButton(this.renderer));
        this.renderer.xr.enabled = true;
        const clock = new THREE.Clock();
        let elapsedS = 0;
        let frameCount = 0;
        const delta = new THREE.Vector3();
        const tmp = new THREE.Vector3();
        this.renderer.setAnimationLoop(() => {
            const deltaS = Math.min(clock.getDelta(), 0.1);
            if (deltaS > 0) {
                this.physicsWorld.stepSimulation(deltaS, 10);
            }
            this.launcher.tick(deltaS);
            this.ball.update();
            this.music.update();
            this.checkBall(elapsedS);
            this.ball.getWorldPosition(tmp);
            this.floor.setBallPosition(tmp);
            elapsedS += deltaS;
            ++frameCount;
            this.renderer.render(this.scene, this.camera);
            this.controls.getDelta(delta);
            delta.y = 0;
            if (delta.length() > 0) {
                delta.applyQuaternion(this.player.quaternion);
                this.universe.position.sub(delta);
                // // Calculate the new position of the tail
                // console.log(`Tail: ${[this.tail.position.x, this.tail.position.z]}`);
                this.tail.position.sub(delta);
                this.tail.position.setLength(1.0);
                // console.log(`Tail: ${[this.tail.position.x, this.tail.position.z]}`);
                this.antiTail.position.copy(this.tail.position);
                this.antiTail.position.multiplyScalar(-1);
            }
            this.player.lookAt(this.tail.position);
            // this.antiTail.position.copy(tmp);
            this.rayCast();
        });
    }
    setUpControls() {
        this.controls.add(new keyControls_1.KeyControls());
        const p = gripControls_1.GripControls.make(this.renderer.xr, this.player);
        p.then((gripControls) => {
            this.controls.add(gripControls);
        });
    }
}
exports.Game = Game;
//# sourceMappingURL=game.js.map

/***/ }),

/***/ 474:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.GripControls = void 0;
const THREE = __importStar(__webpack_require__(396));
const rewardSound_1 = __webpack_require__(371);
class GripControls {
    g0;
    g1;
    last0 = new THREE.Vector3();
    last1 = new THREE.Vector3();
    // private arrow: THREE.ArrowHelper;
    constructor(session, g0, g1, playerGroup) {
        this.g0 = g0;
        this.g1 = g1;
        this.last0.copy(g0.position);
        this.last1.copy(g1.position);
        playerGroup.add(g0);
        playerGroup.add(g1);
        g0.add(new THREE.AxesHelper(0.3));
        g1.add(new THREE.AxesHelper(0.3));
        // this.arrow = new THREE.ArrowHelper(
        //   new THREE.Vector3(0, 0, -1), new THREE.Vector3(0, 0, 0),
        //   /*length=*/0.5);
        // this.g0.add(this.arrow);
        // const loader = new GLTFLoader();
        // loader.load(
        //   'models/paw.glb',
        //   function (gltf) {
        //     g0.add(gltf.scene.clone());
        //     g1.add(gltf.scene.clone());
        //   });
    }
    static gripResolver(resolve, xr, playerGroup) {
        const session = xr.getSession();
        const g0 = xr.getController(0);
        const g1 = xr.getController(1);
        if (session && g0 && g1) {
            const s = new rewardSound_1.RewardSound();
            s.start();
            resolve(new GripControls(session, g0, g1, playerGroup));
        }
        else {
            setTimeout(() => {
                GripControls.gripResolver(resolve, xr, playerGroup);
            }, 500);
        }
    }
    static async make(xr, playerGroup) {
        return new Promise((resolve, reject) => {
            GripControls.gripResolver(resolve, xr, playerGroup);
        });
    }
    t0 = new THREE.Vector3();
    t1 = new THREE.Vector3();
    t2 = new THREE.Vector3();
    getDelta(out) {
        this.t0.copy(this.g0.position);
        this.t1.copy(this.g1.position);
        if (this.t0.y < this.t1.y) {
            out.copy(this.last0);
            out.sub(this.t0);
            // this.g0.add(this.arrow);
        }
        else {
            out.copy(this.last1);
            out.sub(this.t1);
            // this.g1.add(this.arrow);
        }
        out.x *= 1.0;
        out.z *= 5.0;
        this.t2.copy(out);
        this.t2.normalize();
        // this.arrow.setDirection(this.t2);
        // const len = out.length();
        // this.arrow.setLength(5.0 * len);
        this.last0.copy(this.t0);
        this.last1.copy(this.t1);
    }
}
exports.GripControls = GripControls;
//# sourceMappingURL=gripControls.js.map

/***/ }),

/***/ 138:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const ammojs_typed_1 = __importDefault(__webpack_require__(840));
const game_1 = __webpack_require__(417);
const make = async function () {
    return new Promise((resolve) => {
        (0, ammojs_typed_1.default)().then((lib) => {
            resolve(lib);
        });
    });
};
const go = async function () {
    const ammo = await make();
    const game = new game_1.Game(ammo, new AudioContext());
};
document.body.onload = () => {
    const b = document.createElement('button');
    b.textContent = 'Go!';
    b.onclick = () => {
        go();
    };
    document.body.appendChild(b);
};
//# sourceMappingURL=index.js.map

/***/ }),

/***/ 26:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.KeyControls = void 0;
class KeyControls {
    lastCallMs;
    keysDown = new Set();
    constructor() {
        this.lastCallMs = window.performance.now();
        document.body.addEventListener('keydown', (ev) => { this.keysDown.add(ev.code); });
        document.body.addEventListener('keyup', (ev) => { this.keysDown.delete(ev.code); });
    }
    getDelta(out) {
        const dt = window.performance.now() - this.lastCallMs;
        this.lastCallMs += dt;
        out.set(0, 0, 0);
        if (this.keysDown.has('KeyA')) {
            out.x -= 0.003 * dt;
        }
        if (this.keysDown.has('KeyD')) {
            out.x += 0.003 * dt;
        }
        if (this.keysDown.has('KeyW')) {
            out.z -= 0.01 * dt;
        }
        if (this.keysDown.has('KeyS')) {
            out.z += 0.01 * dt;
        }
    }
}
exports.KeyControls = KeyControls;
//# sourceMappingURL=keyControls.js.map

/***/ }),

/***/ 135:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Launcher = void 0;
const THREE = __importStar(__webpack_require__(396));
class Launcher extends THREE.Object3D {
    body;
    constructor() {
        super();
        const height = 4.0;
        this.body = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.1, height, 16, 3, false), new THREE.MeshBasicMaterial({ color: '#f3e' }));
        this.body.geometry.translate(0, height / 2, 0);
        this.body.rotateOnAxis(new THREE.Vector3(1, 0, 0), 0.2);
        this.add(this.body);
    }
    yAxis = new THREE.Vector3(0, 1, 0);
    q = new THREE.Quaternion();
    tick(dt) {
        this.q.setFromAxisAngle(this.yAxis, 0.5 * dt);
        this.body.quaternion.premultiply(this.q);
    }
    getBody() {
        return this.body;
    }
}
exports.Launcher = Launcher;
//# sourceMappingURL=launcher.js.map

/***/ }),

/***/ 147:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MeshMaker = void 0;
const THREE = __importStar(__webpack_require__(396));
class MeshMaker {
    static addGeometryToShape(geometry, transform, mesh, ammo) {
        let numInward = 0;
        let numOutward = 0;
        const positionAttribute = geometry.attributes.position;
        if (!geometry.index) {
            throw new Error("Must have index.");
        }
        const index = geometry.index;
        for (var i = 0; i < index.count / 3; i++) {
            const vertexAIndex = index.getX(i * 3);
            const vertexBIndex = index.getX(i * 3 + 1);
            const vertexCIndex = index.getX(i * 3 + 2);
            const a = new THREE.Vector3();
            a.fromBufferAttribute(positionAttribute, vertexAIndex);
            a.applyMatrix4(transform);
            const b = new THREE.Vector3();
            b.fromBufferAttribute(positionAttribute, vertexBIndex);
            b.applyMatrix4(transform);
            const c = new THREE.Vector3();
            c.fromBufferAttribute(positionAttribute, vertexCIndex);
            c.applyMatrix4(transform);
            mesh.addTriangle(new ammo.btVector3(a.x, a.y, a.z), new ammo.btVector3(b.x, b.y, b.z), new ammo.btVector3(c.x, c.y, c.z), false);
            b.sub(a);
            c.sub(a);
            b.cross(c);
            let direction = a.dot(b);
            if (direction > 0) {
                ++numOutward;
            }
            else {
                ++numInward;
            }
        }
        console.log(`inward: ${numInward}; outward: ${numOutward}`);
    }
    static addToShapeFromObject(object, mesh, ammo) {
        if (object instanceof THREE.Mesh) {
            object.updateMatrix();
            const matrix = new THREE.Matrix4();
            matrix.copy(object.matrix);
            let o = object.parent;
            while (o) {
                o.updateMatrix();
                matrix.premultiply(o.matrix);
                o = o.parent;
            }
            const geometry = object.geometry;
            MeshMaker.addGeometryToShape(geometry, matrix, mesh, ammo);
        }
        for (const c of object.children) {
            MeshMaker.addToShapeFromObject(c, mesh, ammo);
        }
    }
    static createShapeFromObject(object, ammo) {
        const mesh = new ammo.btTriangleMesh(true, true);
        this.addToShapeFromObject(object, mesh, ammo);
        return mesh;
    }
    static makeStaticBody(object, ammo) {
        const btMesh = MeshMaker.createShapeFromObject(object, ammo);
        // const volume = Assets.getVolumeOfObject(object);
        const shape = new ammo.btBvhTriangleMeshShape(btMesh, true, true);
        shape.setMargin(0.05);
        const body = MeshMaker.makeBody(object, ammo, shape, /*mass=*/ 0);
        return body;
    }
    static makeBody(object, ammo, shape, mass) {
        const btTx = new ammo.btTransform();
        const btQ = new ammo.btQuaternion(0, 0, 0, 0);
        const btV1 = new ammo.btVector3();
        btTx.setIdentity();
        btV1.setValue(object.position.x, object.position.y, object.position.z);
        btTx.setOrigin(btV1);
        btQ.setValue(object.quaternion.x, object.quaternion.y, object.quaternion.z, object.quaternion.w);
        btTx.setRotation(btQ);
        const motionState = new ammo.btDefaultMotionState(btTx);
        btV1.setValue(0, 0, 0);
        shape.calculateLocalInertia(mass, btV1);
        const body = new ammo.btRigidBody(new ammo.btRigidBodyConstructionInfo(mass, motionState, shape, btV1));
        body.setActivationState(4); // Disable deactivation
        body.activate(true);
        body.setFriction(0.3);
        body.setRestitution(0.1);
        if (mass == 0) {
            body.setCollisionFlags(body.getCollisionFlags() | 1);
        }
        return body;
    }
}
exports.MeshMaker = MeshMaker;
//# sourceMappingURL=meshMaker.js.map

/***/ }),

/***/ 371:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.RewardSound = void 0;
class RewardSound {
    context;
    oscillator1;
    oscillator2;
    lfo;
    filter;
    gain;
    detunAmt;
    constructor() {
        this.context = new AudioContext();
        this.oscillator1 = this.context.createOscillator();
        this.oscillator2 = this.context.createOscillator();
        this.lfo = this.context.createOscillator();
        this.filter = this.context.createBiquadFilter();
        this.gain = this.context.createGain();
        this.detunAmt = this.context.createGain();
        this.detunAmt.gain.value = 50;
    }
    start() {
        // Set the first oscillator to a sine wave and the second oscillator to a triangle wave
        this.oscillator1.type = 'sine';
        this.oscillator2.type = 'triangle';
        this.gain.gain.value = 0.3;
        this.lfo.type = 'sine';
        // Set the frequency of the oscillators to different values
        this.oscillator1.frequency.value = 880;
        this.oscillator2.frequency.value =
            this.oscillator1.frequency.value * 5 / 2;
        this.lfo.frequency.value = 7;
        this.lfo.connect(this.detunAmt);
        this.detunAmt.connect(this.oscillator1.detune);
        this.detunAmt.connect(this.oscillator2.detune);
        // Start the oscillators
        this.oscillator1.start();
        this.oscillator2.start();
        // Create and configure a low-pass filter
        this.filter.type = 'lowpass';
        this.filter.frequency.value = 1000;
        this.filter.Q.value = 1;
        // Connect the oscillators to the filter and the filter to the destination
        this.oscillator1.connect(this.filter);
        this.oscillator2.connect(this.filter);
        this.filter.connect(this.gain);
        this.gain.connect(this.context.destination);
        // Set a sweep time of 2 seconds for the filter's cutoff frequency
        this.filter.frequency.setTargetAtTime(10, this.context.currentTime, 0.7);
        // Stop the sound after 2.5 seconds
        setTimeout(() => this.stop(), 2500);
    }
    stop() {
        this.oscillator1.stop();
        this.oscillator2.stop();
        this.filter.disconnect(this.context.destination);
    }
}
exports.RewardSound = RewardSound;
//# sourceMappingURL=rewardSound.js.map

/***/ }),

/***/ 381:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AudioSource = void 0;
const THREE = __importStar(__webpack_require__(396));
class AudioSource extends THREE.Object3D {
    audioCtx;
    leftEar = new THREE.Object3D();
    rightEar = new THREE.Object3D();
    leftIn;
    rightIn;
    delayLeft;
    delayRight;
    lowPassLeft;
    lowPassRight;
    constructor(listener, audioCtx) {
        super();
        this.audioCtx = audioCtx;
        this.leftEar.position.set(-0.15, 0, 0);
        this.leftEar.rotateY(75 * Math.PI / 180);
        listener.add(this.leftEar);
        this.rightEar.position.set(0.15, 0, 0);
        this.rightEar.rotateY(-75 * Math.PI / 180);
        listener.add(this.rightEar);
        this.leftIn = this.audioCtx.createGain();
        this.rightIn = this.audioCtx.createGain();
        this.delayLeft = this.audioCtx.createDelay();
        this.delayRight = this.audioCtx.createDelay();
        this.lowPassLeft = this.audioCtx.createBiquadFilter();
        this.lowPassRight = this.audioCtx.createBiquadFilter();
        this.leftIn.connect(this.delayLeft);
        this.rightIn.connect(this.delayRight);
        this.delayLeft.connect(this.lowPassLeft);
        this.delayRight.connect(this.lowPassRight);
        const merger = this.audioCtx.createChannelMerger(2);
        this.lowPassLeft.connect(merger, 0, 0);
        this.lowPassRight.connect(merger, 0, 1);
        merger.connect(this.audioCtx.destination);
    }
    l = new THREE.Vector3();
    getDistance(o) {
        o.getWorldPosition(this.l);
        this.l.sub(this.thisWorldPosition);
        return this.l.length();
    }
    setDelayAndGain(o, d, g) {
        const len = this.getDistance(o);
        let delay = len / 343; // 343 = speed of sound
        if (delay > 1.0) {
            console.log(`Delay: ${delay}; len: ${len}`);
            delay = 1.0;
        }
        const targetTime = this.audioCtx.currentTime;
        d.delayTime.setTargetAtTime(delay, targetTime, 0.01);
        if (len < 2.0) {
            g.gain.setTargetAtTime(1.0, targetTime, 0.01);
        }
        else {
            g.gain.setTargetAtTime(4.0 / (len * len), targetTime, 0.01);
        }
    }
    t = new THREE.Vector3();
    getCutoff(observer) {
        this.t.copy(this.thisWorldPosition);
        observer.worldToLocal(this.t);
        const r2 = this.t.lengthSq();
        const r = Math.sqrt(r2);
        if (r < 0.1) {
            return 80000;
        }
        const cosTheta = -this.t.z / r;
        const q = (cosTheta + 1.1) / (2.1);
        const m = 200.0 * q / r2;
        const ln20 = Math.log(20);
        const ln20000 = Math.log(20000);
        const lnf = m * (ln20000 - ln20) + ln20;
        const cutoff = Math.exp(lnf);
        return cutoff > 80000 ? 80000 : cutoff;
    }
    oPosition = new THREE.Vector3();
    setFilter(o, f) {
        const cutoff = this.getCutoff(o);
        f.frequency.linearRampToValueAtTime(cutoff, this.audioCtx.currentTime + 0.01);
    }
    headForward = new THREE.Vector3(0, 0, -1);
    getAngle(o) {
        o.getWorldPosition(this.l);
        this.l.sub(this.thisWorldPosition);
        // Need to take into account the orientation of `o` which is the head.
        return this.l.angleTo(this.headForward);
    }
    setChannel(ear, delay, filter, gain) {
        this.setDelayAndGain(ear, delay, gain);
        this.setFilter(ear, filter);
    }
    thisWorldPosition = new THREE.Vector3();
    // Sets the delayLeft and delayRight to match the time it takes
    // sound to travel from the WorldPosition of `this` to the
    // `leftEar` and `rightEar`.  Also updates `lowPassLeft` and
    // `lowPassRight` to close when `this` is on the opposite side of
    // the head.
    update() {
        this.getWorldPosition(this.thisWorldPosition);
        this.setChannel(this.leftEar, this.delayLeft, this.lowPassLeft, this.leftIn);
        this.setChannel(this.rightEar, this.delayRight, this.lowPassRight, this.rightIn);
    }
    connect(input) {
        input.connect(this.leftIn);
        input.connect(this.rightIn);
    }
}
exports.AudioSource = AudioSource;
//# sourceMappingURL=audioSource.js.map

/***/ }),

/***/ 444:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MusicSource = void 0;
const audioSource_1 = __webpack_require__(381);
class MusicSource extends audioSource_1.AudioSource {
    constructor(url, listener, audioCtx) {
        console.log('Construct source');
        super(listener, audioCtx);
        const audioElement = document.createElement('audio');
        // audioElement.setAttribute('controls', '');
        audioElement.src = url;
        audioElement.setAttribute('type', 'audio/ogg');
        audioElement.loop = true;
        let mse = null;
        audioElement.addEventListener('canplay', () => {
            if (mse != null) {
                // Already playing.
                return;
            }
            mse = audioCtx.createMediaElementSource(audioElement);
            // source.connect(audioCtx.destination);
            this.connect(mse);
            audioElement.play();
            console.log('Playing');
        });
        document.body.appendChild(audioElement);
    }
}
exports.MusicSource = MusicSource;
//# sourceMappingURL=musicSource.js.map

/***/ }),

/***/ 87:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UnionControls = void 0;
const THREE = __importStar(__webpack_require__(396));
class UnionControls {
    controls = [];
    constructor() {
    }
    add(control) {
        this.controls.push(control);
    }
    v = new THREE.Vector3();
    getDelta(out) {
        out.set(0, 0, 0);
        for (const c of this.controls) {
            c.getDelta(this.v);
            out.add(this.v);
        }
    }
}
exports.UnionControls = UnionControls;
//# sourceMappingURL=unionControls.js.map

/***/ }),

/***/ 840:
/***/ ((module) => {

module.exports = Ammo;

/***/ }),

/***/ 396:
/***/ ((module) => {

module.exports = THREE;

/***/ }),

/***/ 140:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "computeMikkTSpaceTangents": () => (/* binding */ computeMikkTSpaceTangents),
/* harmony export */   "computeMorphedAttributes": () => (/* binding */ computeMorphedAttributes),
/* harmony export */   "computeTangents": () => (/* binding */ computeTangents),
/* harmony export */   "deepCloneAttribute": () => (/* binding */ deepCloneAttribute),
/* harmony export */   "deinterleaveAttribute": () => (/* binding */ deinterleaveAttribute),
/* harmony export */   "deinterleaveGeometry": () => (/* binding */ deinterleaveGeometry),
/* harmony export */   "estimateBytesUsed": () => (/* binding */ estimateBytesUsed),
/* harmony export */   "interleaveAttributes": () => (/* binding */ interleaveAttributes),
/* harmony export */   "mergeBufferAttributes": () => (/* binding */ mergeBufferAttributes),
/* harmony export */   "mergeBufferGeometries": () => (/* binding */ mergeBufferGeometries),
/* harmony export */   "mergeGroups": () => (/* binding */ mergeGroups),
/* harmony export */   "mergeVertices": () => (/* binding */ mergeVertices),
/* harmony export */   "toCreasedNormals": () => (/* binding */ toCreasedNormals),
/* harmony export */   "toTrianglesDrawMode": () => (/* binding */ toTrianglesDrawMode)
/* harmony export */ });
/* harmony import */ var three__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(396);


function computeTangents() {

	throw new Error( 'BufferGeometryUtils: computeTangents renamed to computeMikkTSpaceTangents.' );

}

function computeMikkTSpaceTangents( geometry, MikkTSpace, negateSign = true ) {

	if ( ! MikkTSpace || ! MikkTSpace.isReady ) {

		throw new Error( 'BufferGeometryUtils: Initialized MikkTSpace library required.' );

	}

	if ( ! geometry.hasAttribute( 'position' ) || ! geometry.hasAttribute( 'normal' ) || ! geometry.hasAttribute( 'uv' ) ) {

		throw new Error( 'BufferGeometryUtils: Tangents require "position", "normal", and "uv" attributes.' );

	}

	function getAttributeArray( attribute ) {

		if ( attribute.normalized || attribute.isInterleavedBufferAttribute ) {

			const dstArray = new Float32Array( attribute.getCount() * attribute.itemSize );

			for ( let i = 0, j = 0; i < attribute.getCount(); i ++ ) {

				dstArray[ j ++ ] = attribute.getX( i );
				dstArray[ j ++ ] = attribute.getY( i );

				if ( attribute.itemSize > 2 ) {

					dstArray[ j ++ ] = attribute.getZ( i );

				}

			}

			return dstArray;

		}

		if ( attribute.array instanceof Float32Array ) {

			return attribute.array;

		}

		return new Float32Array( attribute.array );

	}

	// MikkTSpace algorithm requires non-indexed input.

	const _geometry = geometry.index ? geometry.toNonIndexed() : geometry;

	// Compute vertex tangents.

	const tangents = MikkTSpace.generateTangents(

		getAttributeArray( _geometry.attributes.position ),
		getAttributeArray( _geometry.attributes.normal ),
		getAttributeArray( _geometry.attributes.uv )

	);

	// Texture coordinate convention of glTF differs from the apparent
	// default of the MikkTSpace library; .w component must be flipped.

	if ( negateSign ) {

		for ( let i = 3; i < tangents.length; i += 4 ) {

			tangents[ i ] *= - 1;

		}

	}

	//

	_geometry.setAttribute( 'tangent', new three__WEBPACK_IMPORTED_MODULE_0__.BufferAttribute( tangents, 4 ) );

	if ( geometry !== _geometry ) {

		geometry.copy( _geometry );

	}

	return geometry;

}

/**
 * @param  {Array<BufferGeometry>} geometries
 * @param  {Boolean} useGroups
 * @return {BufferGeometry}
 */
function mergeBufferGeometries( geometries, useGroups = false ) {

	const isIndexed = geometries[ 0 ].index !== null;

	const attributesUsed = new Set( Object.keys( geometries[ 0 ].attributes ) );
	const morphAttributesUsed = new Set( Object.keys( geometries[ 0 ].morphAttributes ) );

	const attributes = {};
	const morphAttributes = {};

	const morphTargetsRelative = geometries[ 0 ].morphTargetsRelative;

	const mergedGeometry = new three__WEBPACK_IMPORTED_MODULE_0__.BufferGeometry();

	let offset = 0;

	for ( let i = 0; i < geometries.length; ++ i ) {

		const geometry = geometries[ i ];
		let attributesCount = 0;

		// ensure that all geometries are indexed, or none

		if ( isIndexed !== ( geometry.index !== null ) ) {

			console.error( 'THREE.BufferGeometryUtils: .mergeBufferGeometries() failed with geometry at index ' + i + '. All geometries must have compatible attributes; make sure index attribute exists among all geometries, or in none of them.' );
			return null;

		}

		// gather attributes, exit early if they're different

		for ( const name in geometry.attributes ) {

			if ( ! attributesUsed.has( name ) ) {

				console.error( 'THREE.BufferGeometryUtils: .mergeBufferGeometries() failed with geometry at index ' + i + '. All geometries must have compatible attributes; make sure "' + name + '" attribute exists among all geometries, or in none of them.' );
				return null;

			}

			if ( attributes[ name ] === undefined ) attributes[ name ] = [];

			attributes[ name ].push( geometry.attributes[ name ] );

			attributesCount ++;

		}

		// ensure geometries have the same number of attributes

		if ( attributesCount !== attributesUsed.size ) {

			console.error( 'THREE.BufferGeometryUtils: .mergeBufferGeometries() failed with geometry at index ' + i + '. Make sure all geometries have the same number of attributes.' );
			return null;

		}

		// gather morph attributes, exit early if they're different

		if ( morphTargetsRelative !== geometry.morphTargetsRelative ) {

			console.error( 'THREE.BufferGeometryUtils: .mergeBufferGeometries() failed with geometry at index ' + i + '. .morphTargetsRelative must be consistent throughout all geometries.' );
			return null;

		}

		for ( const name in geometry.morphAttributes ) {

			if ( ! morphAttributesUsed.has( name ) ) {

				console.error( 'THREE.BufferGeometryUtils: .mergeBufferGeometries() failed with geometry at index ' + i + '.  .morphAttributes must be consistent throughout all geometries.' );
				return null;

			}

			if ( morphAttributes[ name ] === undefined ) morphAttributes[ name ] = [];

			morphAttributes[ name ].push( geometry.morphAttributes[ name ] );

		}

		if ( useGroups ) {

			let count;

			if ( isIndexed ) {

				count = geometry.index.count;

			} else if ( geometry.attributes.position !== undefined ) {

				count = geometry.attributes.position.count;

			} else {

				console.error( 'THREE.BufferGeometryUtils: .mergeBufferGeometries() failed with geometry at index ' + i + '. The geometry must have either an index or a position attribute' );
				return null;

			}

			mergedGeometry.addGroup( offset, count, i );

			offset += count;

		}

	}

	// merge indices

	if ( isIndexed ) {

		let indexOffset = 0;
		const mergedIndex = [];

		for ( let i = 0; i < geometries.length; ++ i ) {

			const index = geometries[ i ].index;

			for ( let j = 0; j < index.count; ++ j ) {

				mergedIndex.push( index.getX( j ) + indexOffset );

			}

			indexOffset += geometries[ i ].attributes.position.count;

		}

		mergedGeometry.setIndex( mergedIndex );

	}

	// merge attributes

	for ( const name in attributes ) {

		const mergedAttribute = mergeBufferAttributes( attributes[ name ] );

		if ( ! mergedAttribute ) {

			console.error( 'THREE.BufferGeometryUtils: .mergeBufferGeometries() failed while trying to merge the ' + name + ' attribute.' );
			return null;

		}

		mergedGeometry.setAttribute( name, mergedAttribute );

	}

	// merge morph attributes

	for ( const name in morphAttributes ) {

		const numMorphTargets = morphAttributes[ name ][ 0 ].length;

		if ( numMorphTargets === 0 ) break;

		mergedGeometry.morphAttributes = mergedGeometry.morphAttributes || {};
		mergedGeometry.morphAttributes[ name ] = [];

		for ( let i = 0; i < numMorphTargets; ++ i ) {

			const morphAttributesToMerge = [];

			for ( let j = 0; j < morphAttributes[ name ].length; ++ j ) {

				morphAttributesToMerge.push( morphAttributes[ name ][ j ][ i ] );

			}

			const mergedMorphAttribute = mergeBufferAttributes( morphAttributesToMerge );

			if ( ! mergedMorphAttribute ) {

				console.error( 'THREE.BufferGeometryUtils: .mergeBufferGeometries() failed while trying to merge the ' + name + ' morphAttribute.' );
				return null;

			}

			mergedGeometry.morphAttributes[ name ].push( mergedMorphAttribute );

		}

	}

	return mergedGeometry;

}

/**
 * @param {Array<BufferAttribute>} attributes
 * @return {BufferAttribute}
 */
function mergeBufferAttributes( attributes ) {

	let TypedArray;
	let itemSize;
	let normalized;
	let arrayLength = 0;

	for ( let i = 0; i < attributes.length; ++ i ) {

		const attribute = attributes[ i ];

		if ( attribute.isInterleavedBufferAttribute ) {

			console.error( 'THREE.BufferGeometryUtils: .mergeBufferAttributes() failed. InterleavedBufferAttributes are not supported.' );
			return null;

		}

		if ( TypedArray === undefined ) TypedArray = attribute.array.constructor;
		if ( TypedArray !== attribute.array.constructor ) {

			console.error( 'THREE.BufferGeometryUtils: .mergeBufferAttributes() failed. BufferAttribute.array must be of consistent array types across matching attributes.' );
			return null;

		}

		if ( itemSize === undefined ) itemSize = attribute.itemSize;
		if ( itemSize !== attribute.itemSize ) {

			console.error( 'THREE.BufferGeometryUtils: .mergeBufferAttributes() failed. BufferAttribute.itemSize must be consistent across matching attributes.' );
			return null;

		}

		if ( normalized === undefined ) normalized = attribute.normalized;
		if ( normalized !== attribute.normalized ) {

			console.error( 'THREE.BufferGeometryUtils: .mergeBufferAttributes() failed. BufferAttribute.normalized must be consistent across matching attributes.' );
			return null;

		}

		arrayLength += attribute.array.length;

	}

	const array = new TypedArray( arrayLength );
	let offset = 0;

	for ( let i = 0; i < attributes.length; ++ i ) {

		array.set( attributes[ i ].array, offset );

		offset += attributes[ i ].array.length;

	}

	return new three__WEBPACK_IMPORTED_MODULE_0__.BufferAttribute( array, itemSize, normalized );

}

/**
 * @param {BufferAttribute}
 * @return {BufferAttribute}
 */
function deepCloneAttribute( attribute ) {

	if ( attribute.isInstancedInterleavedBufferAttribute || attribute.isInterleavedBufferAttribute ) {

		return deinterleaveAttribute( attribute );

	}

	if ( attribute.isInstancedBufferAttribute ) {

		return new three__WEBPACK_IMPORTED_MODULE_0__.InstancedBufferAttribute().copy( attribute );

	}

	return new three__WEBPACK_IMPORTED_MODULE_0__.BufferAttribute().copy( attribute );

}

/**
 * @param {Array<BufferAttribute>} attributes
 * @return {Array<InterleavedBufferAttribute>}
 */
function interleaveAttributes( attributes ) {

	// Interleaves the provided attributes into an InterleavedBuffer and returns
	// a set of InterleavedBufferAttributes for each attribute
	let TypedArray;
	let arrayLength = 0;
	let stride = 0;

	// calculate the length and type of the interleavedBuffer
	for ( let i = 0, l = attributes.length; i < l; ++ i ) {

		const attribute = attributes[ i ];

		if ( TypedArray === undefined ) TypedArray = attribute.array.constructor;
		if ( TypedArray !== attribute.array.constructor ) {

			console.error( 'AttributeBuffers of different types cannot be interleaved' );
			return null;

		}

		arrayLength += attribute.array.length;
		stride += attribute.itemSize;

	}

	// Create the set of buffer attributes
	const interleavedBuffer = new three__WEBPACK_IMPORTED_MODULE_0__.InterleavedBuffer( new TypedArray( arrayLength ), stride );
	let offset = 0;
	const res = [];
	const getters = [ 'getX', 'getY', 'getZ', 'getW' ];
	const setters = [ 'setX', 'setY', 'setZ', 'setW' ];

	for ( let j = 0, l = attributes.length; j < l; j ++ ) {

		const attribute = attributes[ j ];
		const itemSize = attribute.itemSize;
		const count = attribute.count;
		const iba = new three__WEBPACK_IMPORTED_MODULE_0__.InterleavedBufferAttribute( interleavedBuffer, itemSize, offset, attribute.normalized );
		res.push( iba );

		offset += itemSize;

		// Move the data for each attribute into the new interleavedBuffer
		// at the appropriate offset
		for ( let c = 0; c < count; c ++ ) {

			for ( let k = 0; k < itemSize; k ++ ) {

				iba[ setters[ k ] ]( c, attribute[ getters[ k ] ]( c ) );

			}

		}

	}

	return res;

}

// returns a new, non-interleaved version of the provided attribute
function deinterleaveAttribute( attribute ) {

	const cons = attribute.data.array.constructor;
	const count = attribute.count;
	const itemSize = attribute.itemSize;
	const normalized = attribute.normalized;

	const array = new cons( count * itemSize );
	let newAttribute;
	if ( attribute.isInstancedInterleavedBufferAttribute ) {

		newAttribute = new three__WEBPACK_IMPORTED_MODULE_0__.InstancedBufferAttribute( array, itemSize, normalized, attribute.meshPerAttribute );

	} else {

		newAttribute = new three__WEBPACK_IMPORTED_MODULE_0__.BufferAttribute( array, itemSize, normalized );

	}

	for ( let i = 0; i < count; i ++ ) {

		newAttribute.setX( i, attribute.getX( i ) );

		if ( itemSize >= 2 ) {

			newAttribute.setY( i, attribute.getY( i ) );

		}

		if ( itemSize >= 3 ) {

			newAttribute.setZ( i, attribute.getZ( i ) );

		}

		if ( itemSize >= 4 ) {

			newAttribute.setW( i, attribute.getW( i ) );

		}

	}

	return newAttribute;

}

// deinterleaves all attributes on the geometry
function deinterleaveGeometry( geometry ) {

	const attributes = geometry.attributes;
	const morphTargets = geometry.morphTargets;
	const attrMap = new Map();

	for ( const key in attributes ) {

		const attr = attributes[ key ];
		if ( attr.isInterleavedBufferAttribute ) {

			if ( ! attrMap.has( attr ) ) {

				attrMap.set( attr, deinterleaveAttribute( attr ) );

			}

			attributes[ key ] = attrMap.get( attr );

		}

	}

	for ( const key in morphTargets ) {

		const attr = morphTargets[ key ];
		if ( attr.isInterleavedBufferAttribute ) {

			if ( ! attrMap.has( attr ) ) {

				attrMap.set( attr, deinterleaveAttribute( attr ) );

			}

			morphTargets[ key ] = attrMap.get( attr );

		}

	}

}

/**
 * @param {Array<BufferGeometry>} geometry
 * @return {number}
 */
function estimateBytesUsed( geometry ) {

	// Return the estimated memory used by this geometry in bytes
	// Calculate using itemSize, count, and BYTES_PER_ELEMENT to account
	// for InterleavedBufferAttributes.
	let mem = 0;
	for ( const name in geometry.attributes ) {

		const attr = geometry.getAttribute( name );
		mem += attr.count * attr.itemSize * attr.array.BYTES_PER_ELEMENT;

	}

	const indices = geometry.getIndex();
	mem += indices ? indices.count * indices.itemSize * indices.array.BYTES_PER_ELEMENT : 0;
	return mem;

}

/**
 * @param {BufferGeometry} geometry
 * @param {number} tolerance
 * @return {BufferGeometry}
 */
function mergeVertices( geometry, tolerance = 1e-4 ) {

	tolerance = Math.max( tolerance, Number.EPSILON );

	// Generate an index buffer if the geometry doesn't have one, or optimize it
	// if it's already available.
	const hashToIndex = {};
	const indices = geometry.getIndex();
	const positions = geometry.getAttribute( 'position' );
	const vertexCount = indices ? indices.count : positions.count;

	// next value for triangle indices
	let nextIndex = 0;

	// attributes and new attribute arrays
	const attributeNames = Object.keys( geometry.attributes );
	const tmpAttributes = {};
	const tmpMorphAttributes = {};
	const newIndices = [];
	const getters = [ 'getX', 'getY', 'getZ', 'getW' ];
	const setters = [ 'setX', 'setY', 'setZ', 'setW' ];

	// Initialize the arrays, allocating space conservatively. Extra
	// space will be trimmed in the last step.
	for ( let i = 0, l = attributeNames.length; i < l; i ++ ) {

		const name = attributeNames[ i ];
		const attr = geometry.attributes[ name ];

		tmpAttributes[ name ] = new three__WEBPACK_IMPORTED_MODULE_0__.BufferAttribute(
			new attr.array.constructor( attr.count * attr.itemSize ),
			attr.itemSize,
			attr.normalized
		);

		const morphAttr = geometry.morphAttributes[ name ];
		if ( morphAttr ) {

			tmpMorphAttributes[ name ] = new three__WEBPACK_IMPORTED_MODULE_0__.BufferAttribute(
				new morphAttr.array.constructor( morphAttr.count * morphAttr.itemSize ),
				morphAttr.itemSize,
				morphAttr.normalized
			);

		}

	}

	// convert the error tolerance to an amount of decimal places to truncate to
	const decimalShift = Math.log10( 1 / tolerance );
	const shiftMultiplier = Math.pow( 10, decimalShift );
	for ( let i = 0; i < vertexCount; i ++ ) {

		const index = indices ? indices.getX( i ) : i;

		// Generate a hash for the vertex attributes at the current index 'i'
		let hash = '';
		for ( let j = 0, l = attributeNames.length; j < l; j ++ ) {

			const name = attributeNames[ j ];
			const attribute = geometry.getAttribute( name );
			const itemSize = attribute.itemSize;

			for ( let k = 0; k < itemSize; k ++ ) {

				// double tilde truncates the decimal value
				hash += `${ ~ ~ ( attribute[ getters[ k ] ]( index ) * shiftMultiplier ) },`;

			}

		}

		// Add another reference to the vertex if it's already
		// used by another index
		if ( hash in hashToIndex ) {

			newIndices.push( hashToIndex[ hash ] );

		} else {

			// copy data to the new index in the temporary attributes
			for ( let j = 0, l = attributeNames.length; j < l; j ++ ) {

				const name = attributeNames[ j ];
				const attribute = geometry.getAttribute( name );
				const morphAttr = geometry.morphAttributes[ name ];
				const itemSize = attribute.itemSize;
				const newarray = tmpAttributes[ name ];
				const newMorphArrays = tmpMorphAttributes[ name ];

				for ( let k = 0; k < itemSize; k ++ ) {

					const getterFunc = getters[ k ];
					const setterFunc = setters[ k ];
					newarray[ setterFunc ]( nextIndex, attribute[ getterFunc ]( index ) );

					if ( morphAttr ) {

						for ( let m = 0, ml = morphAttr.length; m < ml; m ++ ) {

							newMorphArrays[ m ][ setterFunc ]( nextIndex, morphAttr[ m ][ getterFunc ]( index ) );

						}

					}

				}

			}

			hashToIndex[ hash ] = nextIndex;
			newIndices.push( nextIndex );
			nextIndex ++;

		}

	}

	// generate result BufferGeometry
	const result = geometry.clone();
	for ( const name in geometry.attributes ) {

		const tmpAttribute = tmpAttributes[ name ];

		result.setAttribute( name, new three__WEBPACK_IMPORTED_MODULE_0__.BufferAttribute(
			tmpAttribute.array.slice( 0, nextIndex * tmpAttribute.itemSize ),
			tmpAttribute.itemSize,
			tmpAttribute.normalized,
		) );

		if ( ! ( name in tmpMorphAttributes ) ) continue;

		for ( let j = 0; j < tmpMorphAttributes[ name ].length; j ++ ) {

			const tmpMorphAttribute = tmpMorphAttributes[ name ][ j ];

			result.morphAttributes[ name ][ j ] = new three__WEBPACK_IMPORTED_MODULE_0__.BufferAttribute(
				tmpMorphAttribute.array.slice( 0, nextIndex * tmpMorphAttribute.itemSize ),
				tmpMorphAttribute.itemSize,
				tmpMorphAttribute.normalized,
			);

		}

	}

	// indices

	result.setIndex( newIndices );

	return result;

}

/**
 * @param {BufferGeometry} geometry
 * @param {number} drawMode
 * @return {BufferGeometry}
 */
function toTrianglesDrawMode( geometry, drawMode ) {

	if ( drawMode === three__WEBPACK_IMPORTED_MODULE_0__.TrianglesDrawMode ) {

		console.warn( 'THREE.BufferGeometryUtils.toTrianglesDrawMode(): Geometry already defined as triangles.' );
		return geometry;

	}

	if ( drawMode === three__WEBPACK_IMPORTED_MODULE_0__.TriangleFanDrawMode || drawMode === three__WEBPACK_IMPORTED_MODULE_0__.TriangleStripDrawMode ) {

		let index = geometry.getIndex();

		// generate index if not present

		if ( index === null ) {

			const indices = [];

			const position = geometry.getAttribute( 'position' );

			if ( position !== undefined ) {

				for ( let i = 0; i < position.count; i ++ ) {

					indices.push( i );

				}

				geometry.setIndex( indices );
				index = geometry.getIndex();

			} else {

				console.error( 'THREE.BufferGeometryUtils.toTrianglesDrawMode(): Undefined position attribute. Processing not possible.' );
				return geometry;

			}

		}

		//

		const numberOfTriangles = index.count - 2;
		const newIndices = [];

		if ( drawMode === three__WEBPACK_IMPORTED_MODULE_0__.TriangleFanDrawMode ) {

			// gl.TRIANGLE_FAN

			for ( let i = 1; i <= numberOfTriangles; i ++ ) {

				newIndices.push( index.getX( 0 ) );
				newIndices.push( index.getX( i ) );
				newIndices.push( index.getX( i + 1 ) );

			}

		} else {

			// gl.TRIANGLE_STRIP

			for ( let i = 0; i < numberOfTriangles; i ++ ) {

				if ( i % 2 === 0 ) {

					newIndices.push( index.getX( i ) );
					newIndices.push( index.getX( i + 1 ) );
					newIndices.push( index.getX( i + 2 ) );

				} else {

					newIndices.push( index.getX( i + 2 ) );
					newIndices.push( index.getX( i + 1 ) );
					newIndices.push( index.getX( i ) );

				}

			}

		}

		if ( ( newIndices.length / 3 ) !== numberOfTriangles ) {

			console.error( 'THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unable to generate correct amount of triangles.' );

		}

		// build final geometry

		const newGeometry = geometry.clone();
		newGeometry.setIndex( newIndices );
		newGeometry.clearGroups();

		return newGeometry;

	} else {

		console.error( 'THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unknown draw mode:', drawMode );
		return geometry;

	}

}

/**
 * Calculates the morphed attributes of a morphed/skinned BufferGeometry.
 * Helpful for Raytracing or Decals.
 * @param {Mesh | Line | Points} object An instance of Mesh, Line or Points.
 * @return {Object} An Object with original position/normal attributes and morphed ones.
 */
function computeMorphedAttributes( object ) {

	if ( object.geometry.isBufferGeometry !== true ) {

		console.error( 'THREE.BufferGeometryUtils: Geometry is not of type BufferGeometry.' );
		return null;

	}

	const _vA = new three__WEBPACK_IMPORTED_MODULE_0__.Vector3();
	const _vB = new three__WEBPACK_IMPORTED_MODULE_0__.Vector3();
	const _vC = new three__WEBPACK_IMPORTED_MODULE_0__.Vector3();

	const _tempA = new three__WEBPACK_IMPORTED_MODULE_0__.Vector3();
	const _tempB = new three__WEBPACK_IMPORTED_MODULE_0__.Vector3();
	const _tempC = new three__WEBPACK_IMPORTED_MODULE_0__.Vector3();

	const _morphA = new three__WEBPACK_IMPORTED_MODULE_0__.Vector3();
	const _morphB = new three__WEBPACK_IMPORTED_MODULE_0__.Vector3();
	const _morphC = new three__WEBPACK_IMPORTED_MODULE_0__.Vector3();

	function _calculateMorphedAttributeData(
		object,
		attribute,
		morphAttribute,
		morphTargetsRelative,
		a,
		b,
		c,
		modifiedAttributeArray
	) {

		_vA.fromBufferAttribute( attribute, a );
		_vB.fromBufferAttribute( attribute, b );
		_vC.fromBufferAttribute( attribute, c );

		const morphInfluences = object.morphTargetInfluences;

		if ( morphAttribute && morphInfluences ) {

			_morphA.set( 0, 0, 0 );
			_morphB.set( 0, 0, 0 );
			_morphC.set( 0, 0, 0 );

			for ( let i = 0, il = morphAttribute.length; i < il; i ++ ) {

				const influence = morphInfluences[ i ];
				const morph = morphAttribute[ i ];

				if ( influence === 0 ) continue;

				_tempA.fromBufferAttribute( morph, a );
				_tempB.fromBufferAttribute( morph, b );
				_tempC.fromBufferAttribute( morph, c );

				if ( morphTargetsRelative ) {

					_morphA.addScaledVector( _tempA, influence );
					_morphB.addScaledVector( _tempB, influence );
					_morphC.addScaledVector( _tempC, influence );

				} else {

					_morphA.addScaledVector( _tempA.sub( _vA ), influence );
					_morphB.addScaledVector( _tempB.sub( _vB ), influence );
					_morphC.addScaledVector( _tempC.sub( _vC ), influence );

				}

			}

			_vA.add( _morphA );
			_vB.add( _morphB );
			_vC.add( _morphC );

		}

		if ( object.isSkinnedMesh ) {

			object.boneTransform( a, _vA );
			object.boneTransform( b, _vB );
			object.boneTransform( c, _vC );

		}

		modifiedAttributeArray[ a * 3 + 0 ] = _vA.x;
		modifiedAttributeArray[ a * 3 + 1 ] = _vA.y;
		modifiedAttributeArray[ a * 3 + 2 ] = _vA.z;
		modifiedAttributeArray[ b * 3 + 0 ] = _vB.x;
		modifiedAttributeArray[ b * 3 + 1 ] = _vB.y;
		modifiedAttributeArray[ b * 3 + 2 ] = _vB.z;
		modifiedAttributeArray[ c * 3 + 0 ] = _vC.x;
		modifiedAttributeArray[ c * 3 + 1 ] = _vC.y;
		modifiedAttributeArray[ c * 3 + 2 ] = _vC.z;

	}

	const geometry = object.geometry;
	const material = object.material;

	let a, b, c;
	const index = geometry.index;
	const positionAttribute = geometry.attributes.position;
	const morphPosition = geometry.morphAttributes.position;
	const morphTargetsRelative = geometry.morphTargetsRelative;
	const normalAttribute = geometry.attributes.normal;
	const morphNormal = geometry.morphAttributes.position;

	const groups = geometry.groups;
	const drawRange = geometry.drawRange;
	let i, j, il, jl;
	let group;
	let start, end;

	const modifiedPosition = new Float32Array( positionAttribute.count * positionAttribute.itemSize );
	const modifiedNormal = new Float32Array( normalAttribute.count * normalAttribute.itemSize );

	if ( index !== null ) {

		// indexed buffer geometry

		if ( Array.isArray( material ) ) {

			for ( i = 0, il = groups.length; i < il; i ++ ) {

				group = groups[ i ];

				start = Math.max( group.start, drawRange.start );
				end = Math.min( ( group.start + group.count ), ( drawRange.start + drawRange.count ) );

				for ( j = start, jl = end; j < jl; j += 3 ) {

					a = index.getX( j );
					b = index.getX( j + 1 );
					c = index.getX( j + 2 );

					_calculateMorphedAttributeData(
						object,
						positionAttribute,
						morphPosition,
						morphTargetsRelative,
						a, b, c,
						modifiedPosition
					);

					_calculateMorphedAttributeData(
						object,
						normalAttribute,
						morphNormal,
						morphTargetsRelative,
						a, b, c,
						modifiedNormal
					);

				}

			}

		} else {

			start = Math.max( 0, drawRange.start );
			end = Math.min( index.count, ( drawRange.start + drawRange.count ) );

			for ( i = start, il = end; i < il; i += 3 ) {

				a = index.getX( i );
				b = index.getX( i + 1 );
				c = index.getX( i + 2 );

				_calculateMorphedAttributeData(
					object,
					positionAttribute,
					morphPosition,
					morphTargetsRelative,
					a, b, c,
					modifiedPosition
				);

				_calculateMorphedAttributeData(
					object,
					normalAttribute,
					morphNormal,
					morphTargetsRelative,
					a, b, c,
					modifiedNormal
				);

			}

		}

	} else {

		// non-indexed buffer geometry

		if ( Array.isArray( material ) ) {

			for ( i = 0, il = groups.length; i < il; i ++ ) {

				group = groups[ i ];

				start = Math.max( group.start, drawRange.start );
				end = Math.min( ( group.start + group.count ), ( drawRange.start + drawRange.count ) );

				for ( j = start, jl = end; j < jl; j += 3 ) {

					a = j;
					b = j + 1;
					c = j + 2;

					_calculateMorphedAttributeData(
						object,
						positionAttribute,
						morphPosition,
						morphTargetsRelative,
						a, b, c,
						modifiedPosition
					);

					_calculateMorphedAttributeData(
						object,
						normalAttribute,
						morphNormal,
						morphTargetsRelative,
						a, b, c,
						modifiedNormal
					);

				}

			}

		} else {

			start = Math.max( 0, drawRange.start );
			end = Math.min( positionAttribute.count, ( drawRange.start + drawRange.count ) );

			for ( i = start, il = end; i < il; i += 3 ) {

				a = i;
				b = i + 1;
				c = i + 2;

				_calculateMorphedAttributeData(
					object,
					positionAttribute,
					morphPosition,
					morphTargetsRelative,
					a, b, c,
					modifiedPosition
				);

				_calculateMorphedAttributeData(
					object,
					normalAttribute,
					morphNormal,
					morphTargetsRelative,
					a, b, c,
					modifiedNormal
				);

			}

		}

	}

	const morphedPositionAttribute = new three__WEBPACK_IMPORTED_MODULE_0__.Float32BufferAttribute( modifiedPosition, 3 );
	const morphedNormalAttribute = new three__WEBPACK_IMPORTED_MODULE_0__.Float32BufferAttribute( modifiedNormal, 3 );

	return {

		positionAttribute: positionAttribute,
		normalAttribute: normalAttribute,
		morphedPositionAttribute: morphedPositionAttribute,
		morphedNormalAttribute: morphedNormalAttribute

	};

}

function mergeGroups( geometry ) {

	if ( geometry.groups.length === 0 ) {

		console.warn( 'THREE.BufferGeometryUtils.mergeGroups(): No groups are defined. Nothing to merge.' );
		return geometry;

	}

	let groups = geometry.groups;

	// sort groups by material index

	groups = groups.sort( ( a, b ) => {

		if ( a.materialIndex !== b.materialIndex ) return a.materialIndex - b.materialIndex;

		return a.start - b.start;

	} );

	// create index for non-indexed geometries

	if ( geometry.getIndex() === null ) {

		const positionAttribute = geometry.getAttribute( 'position' );
		const indices = [];

		for ( let i = 0; i < positionAttribute.count; i += 3 ) {

			indices.push( i, i + 1, i + 2 );

		}

		geometry.setIndex( indices );

	}

	// sort index

	const index = geometry.getIndex();

	const newIndices = [];

	for ( let i = 0; i < groups.length; i ++ ) {

		const group = groups[ i ];

		const groupStart = group.start;
		const groupLength = groupStart + group.count;

		for ( let j = groupStart; j < groupLength; j ++ ) {

			newIndices.push( index.getX( j ) );

		}

	}

	geometry.dispose(); // Required to force buffer recreation
	geometry.setIndex( newIndices );

	// update groups indices

	let start = 0;

	for ( let i = 0; i < groups.length; i ++ ) {

		const group = groups[ i ];

		group.start = start;
		start += group.count;

	}

	// merge groups

	let currentGroup = groups[ 0 ];

	geometry.groups = [ currentGroup ];

	for ( let i = 1; i < groups.length; i ++ ) {

		const group = groups[ i ];

		if ( currentGroup.materialIndex === group.materialIndex ) {

			currentGroup.count += group.count;

		} else {

			currentGroup = group;
			geometry.groups.push( currentGroup );

		}

	}

	return geometry;

}


// Creates a new, non-indexed geometry with smooth normals everywhere except faces that meet at
// an angle greater than the crease angle.
function toCreasedNormals( geometry, creaseAngle = Math.PI / 3 /* 60 degrees */ ) {

	const creaseDot = Math.cos( creaseAngle );
	const hashMultiplier = ( 1 + 1e-10 ) * 1e2;

	// reusable vertors
	const verts = [ new three__WEBPACK_IMPORTED_MODULE_0__.Vector3(), new three__WEBPACK_IMPORTED_MODULE_0__.Vector3(), new three__WEBPACK_IMPORTED_MODULE_0__.Vector3() ];
	const tempVec1 = new three__WEBPACK_IMPORTED_MODULE_0__.Vector3();
	const tempVec2 = new three__WEBPACK_IMPORTED_MODULE_0__.Vector3();
	const tempNorm = new three__WEBPACK_IMPORTED_MODULE_0__.Vector3();
	const tempNorm2 = new three__WEBPACK_IMPORTED_MODULE_0__.Vector3();

	// hashes a vector
	function hashVertex( v ) {

		const x = ~ ~ ( v.x * hashMultiplier );
		const y = ~ ~ ( v.y * hashMultiplier );
		const z = ~ ~ ( v.z * hashMultiplier );
		return `${x},${y},${z}`;

	}

	const resultGeometry = geometry.toNonIndexed();
	const posAttr = resultGeometry.attributes.position;
	const vertexMap = {};

	// find all the normals shared by commonly located vertices
	for ( let i = 0, l = posAttr.count / 3; i < l; i ++ ) {

		const i3 = 3 * i;
		const a = verts[ 0 ].fromBufferAttribute( posAttr, i3 + 0 );
		const b = verts[ 1 ].fromBufferAttribute( posAttr, i3 + 1 );
		const c = verts[ 2 ].fromBufferAttribute( posAttr, i3 + 2 );

		tempVec1.subVectors( c, b );
		tempVec2.subVectors( a, b );

		// add the normal to the map for all vertices
		const normal = new three__WEBPACK_IMPORTED_MODULE_0__.Vector3().crossVectors( tempVec1, tempVec2 ).normalize();
		for ( let n = 0; n < 3; n ++ ) {

			const vert = verts[ n ];
			const hash = hashVertex( vert );
			if ( ! ( hash in vertexMap ) ) {

				vertexMap[ hash ] = [];

			}

			vertexMap[ hash ].push( normal );

		}

	}

	// average normals from all vertices that share a common location if they are within the
	// provided crease threshold
	const normalArray = new Float32Array( posAttr.count * 3 );
	const normAttr = new three__WEBPACK_IMPORTED_MODULE_0__.BufferAttribute( normalArray, 3, false );
	for ( let i = 0, l = posAttr.count / 3; i < l; i ++ ) {

		// get the face normal for this vertex
		const i3 = 3 * i;
		const a = verts[ 0 ].fromBufferAttribute( posAttr, i3 + 0 );
		const b = verts[ 1 ].fromBufferAttribute( posAttr, i3 + 1 );
		const c = verts[ 2 ].fromBufferAttribute( posAttr, i3 + 2 );

		tempVec1.subVectors( c, b );
		tempVec2.subVectors( a, b );

		tempNorm.crossVectors( tempVec1, tempVec2 ).normalize();

		// average all normals that meet the threshold and set the normal value
		for ( let n = 0; n < 3; n ++ ) {

			const vert = verts[ n ];
			const hash = hashVertex( vert );
			const otherNormals = vertexMap[ hash ];
			tempNorm2.set( 0, 0, 0 );

			for ( let k = 0, lk = otherNormals.length; k < lk; k ++ ) {

				const otherNorm = otherNormals[ k ];
				if ( tempNorm.dot( otherNorm ) > creaseDot ) {

					tempNorm2.add( otherNorm );

				}

			}

			tempNorm2.normalize();
			normAttr.setXYZ( i3 + n, tempNorm2.x, tempNorm2.y, tempNorm2.z );

		}

	}

	resultGeometry.setAttribute( 'normal', normAttr );
	return resultGeometry;

}




/***/ }),

/***/ 18:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "VRButton": () => (/* binding */ VRButton)
/* harmony export */ });
class VRButton {

	static createButton( renderer ) {

		const button = document.createElement( 'button' );

		function showEnterVR( /*device*/ ) {

			let currentSession = null;

			async function onSessionStarted( session ) {

				session.addEventListener( 'end', onSessionEnded );

				await renderer.xr.setSession( session );
				button.textContent = 'EXIT VR';

				currentSession = session;

			}

			function onSessionEnded( /*event*/ ) {

				currentSession.removeEventListener( 'end', onSessionEnded );

				button.textContent = 'ENTER VR';

				currentSession = null;

			}

			//

			button.style.display = '';

			button.style.cursor = 'pointer';
			button.style.left = 'calc(50% - 50px)';
			button.style.width = '100px';

			button.textContent = 'ENTER VR';

			button.onmouseenter = function () {

				button.style.opacity = '1.0';

			};

			button.onmouseleave = function () {

				button.style.opacity = '0.5';

			};

			button.onclick = function () {

				if ( currentSession === null ) {

					// WebXR's requestReferenceSpace only works if the corresponding feature
					// was requested at session creation time. For simplicity, just ask for
					// the interesting ones as optional features, but be aware that the
					// requestReferenceSpace call will fail if it turns out to be unavailable.
					// ('local' is always available for immersive sessions and doesn't need to
					// be requested separately.)

					const sessionInit = { optionalFeatures: [ 'local-floor', 'bounded-floor', 'hand-tracking', 'layers' ] };
					navigator.xr.requestSession( 'immersive-vr', sessionInit ).then( onSessionStarted );

				} else {

					currentSession.end();

				}

			};

		}

		function disableButton() {

			button.style.display = '';

			button.style.cursor = 'auto';
			button.style.left = 'calc(50% - 75px)';
			button.style.width = '150px';

			button.onmouseenter = null;
			button.onmouseleave = null;

			button.onclick = null;

		}

		function showWebXRNotFound() {

			disableButton();

			button.textContent = 'VR NOT SUPPORTED';

		}

		function showVRNotAllowed( exception ) {

			disableButton();

			console.warn( 'Exception when trying to call xr.isSessionSupported', exception );

			button.textContent = 'VR NOT ALLOWED';

		}

		function stylizeElement( element ) {

			element.style.position = 'absolute';
			element.style.bottom = '20px';
			element.style.padding = '12px 6px';
			element.style.border = '1px solid #fff';
			element.style.borderRadius = '4px';
			element.style.background = 'rgba(0,0,0,0.1)';
			element.style.color = '#fff';
			element.style.font = 'normal 13px sans-serif';
			element.style.textAlign = 'center';
			element.style.opacity = '0.5';
			element.style.outline = 'none';
			element.style.zIndex = '999';

		}

		if ( 'xr' in navigator ) {

			button.id = 'VRButton';
			button.style.display = 'none';

			stylizeElement( button );

			navigator.xr.isSessionSupported( 'immersive-vr' ).then( function ( supported ) {

				supported ? showEnterVR() : showWebXRNotFound();

				if ( supported && VRButton.xrSessionIsGranted ) {

					button.click();

				}

			} ).catch( showVRNotAllowed );

			return button;

		} else {

			const message = document.createElement( 'a' );

			if ( window.isSecureContext === false ) {

				message.href = document.location.href.replace( /^http:/, 'https:' );
				message.innerHTML = 'WEBXR NEEDS HTTPS'; // TODO Improve message

			} else {

				message.href = 'https://immersiveweb.dev/';
				message.innerHTML = 'WEBXR NOT AVAILABLE';

			}

			message.style.left = 'calc(50% - 90px)';
			message.style.width = '180px';
			message.style.textDecoration = 'none';

			stylizeElement( message );

			return message;

		}

	}

	static xrSessionIsGranted = false;

	static registerSessionGrantedListener() {

		if ( 'xr' in navigator ) {

			// WebXRViewer (based on Firefox) has a bug where addEventListener
			// throws a silent exception and aborts execution entirely.
			if ( /WebXRViewer\//i.test( navigator.userAgent ) ) return;

			navigator.xr.addEventListener( 'sessiongranted', () => {

				VRButton.xrSessionIsGranted = true;

			} );

		}

	}

}

VRButton.registerSessionGrantedListener();




/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__(138);
/******/ 	
/******/ })()
;
//# sourceMappingURL=index.js.map