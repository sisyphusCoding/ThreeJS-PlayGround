import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import gsap from 'gsap'

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

const ambientLight = new THREE.AmbientLight(0xffffff,0.1)

scene.add(ambientLight)
const light = new THREE.DirectionalLight(0xffffff, .7)
light.position.set(1,1,0)
light.position.set(-2,5,10)
light.castShadow = true
scene.add(light)

const material = new THREE.MeshPhongMaterial({
  color:0x1F4690,
})
const objectDistance = 6


const mesh1 = new THREE.Mesh(
  new  THREE.TorusGeometry(1,0.4,16,60),
  material
)
mesh1.position.x = 1.8
const mesh2 = new THREE.Mesh(
  new THREE.ConeGeometry(1,2,32),
  material
)

mesh2.position.x = -2
const mesh3 = new THREE.Mesh(
  new THREE.TorusKnotGeometry(0.8,0.35,100,16),
  material
)

mesh3.position.x = 1.8
mesh1.position.y = -objectDistance * 0
mesh2.position.y = -objectDistance * 1
mesh3.position.y = -objectDistance * 2



scene.add(mesh1,mesh2,mesh3)


const particlesCount  = 5000

const positions = new Float32Array(particlesCount*3)

for (let id = 0 ; id<particlesCount; id++){

  positions[id * 3 + 0] =  (Math.random() - 0.5) * 10

  positions[id * 3 + 1] = objectDistance * 0.5 - Math.random() * objectDistance *3

  positions[id * 3 + 2] =  (Math.random() - 0.5) * 10

}

const particlesGeometry = new THREE.BufferGeometry()

particlesGeometry.setAttribute('position',
new THREE.BufferAttribute(
positions,3
))

const particlesMaterial = new THREE.PointsMaterial({
    color:0xffffff,
    size:0.02,sizeAttenuation:true
})


const particles = new THREE.Points(particlesGeometry,particlesMaterial)

scene.add(particles)

const sectionMesh = [mesh1,mesh2,mesh3]
const group = new THREE.Group()

scene.add(group)

const camera  = new THREE.PerspectiveCamera(
  35,
  sizes.w / sizes.h,
  0.1,
  100)
camera.position.set(0,0,6)
group.add(camera)

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

let scrollY = mainWrap.scrollTop
let currentSection = 0
const cursor ={}
cursor.x = 0
cursor.y =0

window.addEventListener('mousemove',(_e)=>{

cursor.x = _e.clientX / sizes.w - 0.5
cursor.y = _e.clientY / sizes.h - 0.5

})


mainWrap.addEventListener('scroll',()=>{

  scrollY = mainWrap.scrollTop

  const newSection = Math.round(scrollY / sizes.h)
  if(newSection !== currentSection){
    currentSection = newSection
    gsap.to(
      sectionMesh[currentSection].rotation,
      {
        duration:1.5,
        ease:'power2.inOut',
        x:'+=6',
        y:'+=3',
        z:'+=1.5'
      }
    )


  }

  console.log(newSection)
})
const clock = new THREE.Clock()
let previousTime = 0
const tick  = ( ) =>{

  camera.position.y = - scrollY/sizes.h * objectDistance


  const parallax ={x:cursor.x , y:-cursor.y}
  const elTime = clock.getElapsedTime()

  const deltaTime = elTime - previousTime
  
  previousTime = elTime

  sectionMesh.forEach(thisMesh => {
    thisMesh.rotation.x += deltaTime * .3
    thisMesh.rotation.y += deltaTime * .3
  })

  group.position.x += (parallax.x - group.position.x) * 8 * deltaTime
  group.position.y += (parallax.y  - group.position.y) * 8 * deltaTime

  renderer.render(scene,camera)
  window.requestAnimationFrame(tick)
}
tick()
