import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import {Pane} from 'tweakpane'
import { moveSyntheticComments } from 'typescript'

const pane = new Pane()

const canvas = document.querySelector('#canvas')

const scene = new THREE.Scene()
const sizes = {w:window.innerWidth,h:window.innerHeight}

window.addEventListener('resize',()=>{
  sizes.w = window.innerWidth
  sizes.h = window.innerHeight

  camera.aspect = sizes.w / sizes.h
  camera.updateProjectionMatrix()

  controls.update()
renderer.setSize(sizes.w,sizes.h)
renderer.setPixelRatio(Math.min(
  window.devicePixelRatio,
  2
))
})

const mouse = new THREE.Vector2()
window.addEventListener('mousemove',(_event)=>{
  mouse.x = _event.clientX / sizes.w * 2 - 1
  mouse.y = - (_event.clientY / sizes.h) * 2 + 1
})

window.addEventListener('click',()=>{
  if(currentIntersect){
    if(currentIntersect.object === sphere0){console.log('sphere0 clicked')}

    if(currentIntersect.object === sphere1){console.log('sphere1 clicked')}

    if(currentIntersect.object === sphere2){console.log('sphere2 clicked')}
  }else{
    console.log('click on outside')
  }
})

const ambientLight = new THREE.AmbientLight(0xffffff,0.2)
scene.add(ambientLight)
const light = new THREE.DirectionalLight(0xffffff, 0.5)
light.position.set(-2,5,10)
light.castShadow = true
scene.add(light)

const plane = new THREE.Mesh(
  new THREE.PlaneGeometry(10,5,),
  new THREE.MeshStandardMaterial({color:0x0078AA})
)
plane.receiveShadow= true
plane.rotation.x = -Math.PI * 0.5
plane.position.set(0,-.8,0)
scene.add(plane)


const geometry = new THREE.SphereGeometry(.5,16,16)

const sphere0 = new THREE.Mesh(
  geometry,

new THREE.MeshBasicMaterial({color:0xFF9F29})
)
sphere0.castShadow = true
sphere0.position.set(-2,0,0)

scene.add(sphere0)

const sphere1 = new THREE.Mesh(
  geometry,

new THREE.MeshBasicMaterial({color:0xFF9F29})
)

sphere1.castShadow = true
scene.add(sphere1)

const sphere2 = new THREE.Mesh(
  geometry,

new THREE.MeshBasicMaterial({color:0xFF9F29})
)

sphere2.castShadow = true
sphere2.position.set(2,0,0)

scene.add(sphere2)


const camera  = new THREE.PerspectiveCamera(
  75,
  sizes.w / sizes.h,
  0.1,
  100)
camera.position.set(3,1,4)
scene.add(camera)

const rayCaster  = new THREE.Raycaster()


const controls =  new OrbitControls(camera,canvas)
controls.enableDamping = true

const renderer = new THREE.WebGLRenderer({canvas:canvas})

renderer.setSize(sizes.w,sizes.h)
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFShadowMap
renderer.setPixelRatio(Math.min(
  window.devicePixelRatio,
  2
))

let currentIntersect = null

const clock = new THREE.Clock()
const tick  = ( ) =>{
  
  const elTime = clock.getElapsedTime()

  
  sphere0.position.y = Math.abs(Math.sin((elTime*0.3) *1.5))
  sphere1.position.y = Math.abs(Math.sin( (elTime*0.8) *1.5))
  sphere2.position.y = Math.abs(Math.sin( (elTime*1.4) *1.5))

  rayCaster.setFromCamera(mouse,camera)

 const objectsToCast = [sphere0,sphere1,sphere2] 

 const intersects = rayCaster.intersectObjects(objectsToCast) 

 objectsToCast.forEach(object=>{
   object.material.color.set('#FF9F29')
 })

  intersects.forEach(item=>{
    item.object.material.color.set('#0000ff')
  })

  if(intersects.length){
    if(currentIntersect === null){
      console.log('mouse enter')
    }
    currentIntersect = intersects[0]
  }else{
    if(currentIntersect !== null){
      console.log('mouse leave')
    }
    currentIntersect = null
  }

  controls.update()
  renderer.render(scene,camera)
  window.requestAnimationFrame(tick)
}
tick()


const cam = pane.addFolder({title:'Camera'})

cam.addInput(camera.position,'x',{
  min:-30,max:30,step:1
})

cam.addInput(camera.position,'y',{
  min:0,max:30,step:1
})

cam.addInput(camera.position,'z',{
  min:0,max:30,step:1
})
