import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import CANNON from 'cannon'
import { ObjectLoader } from 'three'



const canvas = document.querySelector('#canvas')

const mainWrap = document.querySelector('#mainWrap')


const scene = new THREE.Scene()
const sizes = {w:window.innerWidth,h:window.innerHeight}


window.addEventListener('resize',()=>{
  sizes.w = window.innerWidth
  sizes.h = window.innerHeight

  camera.aspect = sizes.w / sizes.h
  camera.updateProjectionMatrix()

  renderer.setSize(sizes.w,sizes.h)
  renderer.setPixelRatio(Math.min(
  window.devicePixelRatio,
  2
))
})

const ambientLight = new THREE.AmbientLight(0xffffff,0.4)

scene.add(ambientLight)

const light = new THREE.DirectionalLight(0xffffff, .7)
light.shadow.mapSize.set(1024,1024)
light.shadow.camera.far = 15
light.shadow.camera.right = 7
light.shadow.camera.left = -7
light.shadow.camera.top = 7
light.shadow.camera.bottom = -7

light.position.set(1,1,0)
light.position.set(5,5,5)
light.castShadow = true
scene.add(light)


/**
 Physics
 **/


const world = new CANNON.World()
world.gravity.set(0,-9.82,0)


const defaultMaterial = new CANNON.Material('default')

const conPlasMaterial =  new CANNON.ContactMaterial(
  defaultMaterial,defaultMaterial,{
    friction:0.1,
    restitution:.5
  })

const sphereShape = new CANNON.Sphere(0.5)
const sphereBody = new CANNON.Body({
  mass:1,
  position:new CANNON.Vec3(0,3,0),
  shape:sphereShape,
  material:defaultMaterial
})

world.add(sphereBody)
world.addContactMaterial(conPlasMaterial)

const floorShape = new CANNON.Plane()
const floorBody = new CANNON.Body()
floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(-1,0,0),Math.PI*0.5)
floorBody.mass  = 0
floorBody.addShape(floorShape)
floorBody.material = defaultMaterial
world.addBody(floorBody)


/**
 THREE.JS
 **/
const material = new THREE.MeshPhongMaterial({
  color:0xB91646,
})

const sphere = new THREE.Mesh(
  new  THREE.SphereGeometry(0.5,32,32),
  material
)

sphere.position.y = 0.6
sphere.castShadow = true
const plane  = new THREE.Mesh(
  new THREE.PlaneGeometry(10,10),
  new THREE.MeshPhongMaterial({color:0xDFD8CA})
)

plane.rotation.x = - Math.PI * 0.5
plane.receiveShadow = true
scene.add(sphere, plane)


const camera  = new THREE.PerspectiveCamera(
  75,
  sizes.w / sizes.h,
  0.1,
  1000)
camera.position.set(-3,5,6)
scene.add(camera)

const controls = new OrbitControls(camera,canvas)
controls.enableDamping = true

const renderer = new THREE.WebGLRenderer({
  canvas:canvas,
  alpha:true
})

renderer.setSize(sizes.w,sizes.h)
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFShadowMap
renderer.setPixelRatio(Math.min(
  window.devicePixelRatio,
  2
))

const clock = new THREE.Clock()
let oldElTime = 0
const tick  = ( ) =>{



  const elTime= clock.getElapsedTime()

  const deltaTime = elTime - oldElTime

  oldElTime = elTime


  //Physics Word
  
   world.step(1/60,deltaTime,3)
  
  console.log(sphereBody.position.y)


  sphere.position.copy(sphereBody.position)

  controls.update() 

  //Physics Word


  renderer.render(scene,camera)
  window.requestAnimationFrame(tick)
}
tick()

