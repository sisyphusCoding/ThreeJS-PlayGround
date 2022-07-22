import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import CANNON from 'cannon'
import{Pane} from 'tweakpane'

const pane = new Pane()
const canvas = document.querySelector('#canvas')

const mainWrap = document.querySelector('#mainWrap')
const hitSound = new Audio('/hit.mp3')

const playHit = (collision) => {

  const imapactStength = collision.contact.getImpactVelocityAlongNormal()

  if(imapactStength>1.5){
  const nullReset = 10 - imapactStength
  hitSound.volume = Math.random()
  hitSound.currentTime = 0
  hitSound.play()
  }


}

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
world.broadphase = new CANNON.SAPBroadphase(world)
world.allowSleep = true



const defaultMaterial = new CANNON.Material('default')
const conPlasMaterial =  new CANNON.ContactMaterial(
  defaultMaterial,defaultMaterial,{
    friction:0.1,
    restitution:.5
  })

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

const plane  = new THREE.Mesh(
  new THREE.PlaneGeometry(10,10),
  new THREE.MeshPhongMaterial({color:0xDFD8CA})
)

plane.rotation.x = - Math.PI * 0.5
plane.receiveShadow = true
scene.add( plane)


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

const objectUpdate = []

const sphereGeo =  new THREE.SphereGeometry(1,20,20)

const sphereMat = new THREE.MeshPhongMaterial({color:0xFF0063})


const boxGeo =  new THREE.BoxGeometry(1,1,1)


const createSphere = (radius,position) => {

  const mesh = new THREE.Mesh(sphereGeo,sphereMat)
  mesh.scale.set(radius,radius,radius) 
  mesh.castShadow = true
  mesh.position.copy(position)
  scene.add(mesh)


  const shape = new CANNON.Sphere(radius)


  const body = new CANNON.Body({
    mass:10,
    position: position,
    shape:shape,
    material:defaultMaterial
  })

  body.position.copy(position)
  world.add(body)

  body.apply

  body.addEventListener('collide',playHit)
  objectUpdate.push({
    mesh,
    body
  })

}



const createBox = (w,h,d,position) => {

  const mesh = new THREE.Mesh(boxGeo,sphereMat)
  mesh.scale.set(w,h,d) 
  mesh.castShadow = true
  mesh.position.copy(position)
  scene.add(mesh)


  const shape = new CANNON.Box(
    new CANNON.Vec3(w/2,h/2,d/2)
  )


  const body = new CANNON.Body({
    mass:10,
    position: position,
    shape:shape,
    material:defaultMaterial
  })

  body.position.copy(position)
  world.add(body)

  body.apply
  body.addEventListener('collide',playHit)
  objectUpdate.push({
    mesh,
    body
  })

}




createSphere(0.5,{x:2,y:5,z:0})



console.log(objectUpdate)


const clock = new THREE.Clock()
let oldElTime = 0
const tick  = ( ) =>{



  const elTime= clock.getElapsedTime()

  const deltaTime = elTime - oldElTime

  oldElTime = elTime


  //Physics Word
  


  world.step(1/60,deltaTime,3)

  objectUpdate.forEach(item=>{

    item.mesh.position.copy(item.body.position)

    item.mesh.quaternion.copy(item.body.quaternion)
  })

  //sphere.position.copy(sphereBody.position)


  controls.update() 

  //Physics Word


  renderer.render(scene,camera)
  window.requestAnimationFrame(tick)
}
tick()


const debugObject = {}

debugObject.reset = () => {

  objectUpdate.forEach(item=>{
    item.body.removeEventListener('collide',playHit)
    world.removeBody(item.body)

    scene.remove(item.mesh)

    objectUpdate.splice(0,objectUpdate.length)

  })

}

debugObject.createSphere = () => {
  createSphere(
    Math.random()* 0.5,
    {
    x:(Math.random() - 0.5 )*3,
    y:3,
    z:(Math.random() - 0.5 )*3
    })
}



debugObject.createBox = () => {
  createBox(
    Math.random()* 0.5,
    Math.random()* 0.5,
    Math.random()* 0.5,
    {
    x:(Math.random() - 0.5 )*3,
    y:3,
    z:(Math.random() - 0.5 )*3
    })
}


const toggleCreateSphere = pane.addButton({
  title:'Create Sphere'
})

toggleCreateSphere.on('click',()=>{
  debugObject.createSphere()
})

const toggleCreateBox = pane.addButton({
  title:'Create Box'
})


toggleCreateBox.on('click',()=>{
  debugObject.createBox()
})

const reset = pane.addButton({
  title:'RESET'
})

reset.on('click',()=>{
  debugObject.reset()
})
