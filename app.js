import * as THREE from 'three';
import {breathFeatures,isBreath} from './breath.js';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {MeshoptDecoder} from './assets/meshopt_decoder.module.js';

const box=document.querySelector('#viewer'),load=document.querySelector('#load');
const stage=document.querySelector('.site'),sky=document.querySelector('#stars'),skyContext=sky.getContext('2d');
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(36,1,.01,1000);
const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.2;
renderer.domElement.className='model-canvas';box.appendChild(renderer.domElement);
const controls=new OrbitControls(camera,renderer.domElement);
controls.enableDamping=true;controls.dampingFactor=.06;controls.enablePan=false;controls.enableZoom=false;
const ambient=new THREE.HemisphereLight(0xe6d6ff,0x522e58,.03);scene.add(ambient);
function light(color,x,y,z){const l=new THREE.DirectionalLight(color,0);l.position.set(x,y,z);scene.add(l);return l;}
const key=light(0xffdedc,4,6,7),fill=light(0x7974ff,-5,2,3),rim=light(0xee8fca,2,4,-5);
let model,bounds,unit=1,center=new THREE.Vector3(),tip=new THREE.Vector3(),initialCamera,initialTarget;
let match,matchFire,candleFire,matchLight,candleLight,ignitionAt=null,hoverSince=null;
let travelTimer=null;
const travelStart=document.querySelector("#travelStart");
travelStart.onclick=()=>window.dispatchEvent(new Event("travel:open"));
let wishAt=null,extinguishedAt=null,micEpoch=0,micStream=null,audioContext=null,audioSource=null,analyser=null,wave=null,frequency=null,micStarted=0,lastAudioTime=0,noiseFloor=.001,breathDuration=0,breathGap=0,audioSink=null,audioTimer=null,calibration=[],lastSoundAt=0;
const ritual=document.querySelector('#ritual'),ritualTitle=document.querySelector('#ritualTitle'),ritualStatus=document.querySelector('#ritualStatus'),wishDone=document.querySelector('#wishDone'),manualBlow=document.querySelector('#manualBlow'),breathMeter=document.querySelector('#breathMeter');
const pointer={x:0,y:0,active:false,down:false,touch:false};
const raycaster=new THREE.Raycaster(),pointerNdc=new THREE.Vector2(),pointerPlane=new THREE.Plane(),viewDirection=new THREE.Vector3();
const targetHint=document.querySelector('#igniteTarget'),instruction=document.querySelector('#instruction');
function trackPointer(e){const rect=renderer.domElement.getBoundingClientRect();pointer.x=e.clientX-rect.left;pointer.y=e.clientY-rect.top;pointer.active=true;pointer.touch=e.pointerType==='touch';}
renderer.domElement.addEventListener('pointermove',trackPointer);
renderer.domElement.addEventListener('pointerdown',e=>{trackPointer(e);pointer.down=true;hoverSince=null;});
window.addEventListener('pointerup',()=>{pointer.down=false;if(pointer.touch){pointer.active=false;hoverSince=null;}});
renderer.domElement.addEventListener('pointerleave',()=>{pointer.active=false;hoverSince=null;});
renderer.domElement.addEventListener('pointercancel',()=>{pointer.active=false;pointer.down=false;hoverSince=null;});
const clamp=THREE.MathUtils.clamp,smooth=(a,b,x)=>{let t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t);};
let seed=9127;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
const stars=Array.from({length:78},(_,i)=>({x:random(),y:random()*.9,r:.45+random()*1.1,phase:random()*6.28,spark:i%12===0}));
function resize(){
 const w=box.clientWidth,h=box.clientHeight;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();
 const dpr=Math.min(devicePixelRatio,2);sky.width=w*dpr;sky.height=h*dpr;skyContext.setTransform(dpr,0,0,dpr,0,0);
 if(model)frame();
}
function frame(){
 const size=bounds.getSize(new THREE.Vector3()),halfFov=Math.tan(THREE.MathUtils.degToRad(camera.fov/2));
 const distance=Math.max(size.y/(2*halfFov),size.x/(2*halfFov*camera.aspect))*(box.clientWidth<700?1.25:2.2);
 camera.near=Math.max(.001,distance/100);camera.far=distance*20;camera.updateProjectionMatrix();
 camera.position.set(center.x,center.y+distance*.48,center.z+distance*1.1);controls.target.copy(center);
 const polar=new THREE.Spherical().setFromVector3(camera.position.clone().sub(center)).phi;
 controls.minPolarAngle=polar;controls.maxPolarAngle=polar;controls.update();
 initialCamera=camera.position.clone();initialTarget=center.clone();camera.updateMatrixWorld();
 const pts=[];for(const x of [bounds.min.x,bounds.max.x])for(const y of [bounds.min.y,bounds.max.y])for(const z of [bounds.min.z,bounds.max.z]){let v=new THREE.Vector3(x,y,z).project(camera);pts.push({x:(v.x*.5+.5)*box.clientWidth,y:(.5-v.y*.5)*box.clientHeight});}
 const left=Math.min(...pts.map(p=>p.x)),right=Math.max(...pts.map(p=>p.x)),top=Math.min(...pts.map(p=>p.y)),bottom=Math.max(...pts.map(p=>p.y));
 const h=(bottom-top)*1.26,w=(right-left)*1.1;
 box.style.setProperty('--arch-width',w+'px');box.style.setProperty('--arch-height',h+'px');box.style.setProperty('--arch-top',(bottom-h)+'px');
 box.style.setProperty('--horizon',(bottom/box.clientHeight*100)+'%');
}
window.addEventListener('resize',resize);resize();

const fireVertex=`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`;
const fireFragment=`varying vec2 vUv;uniform float time;uniform float alpha;void main(){
 float y=vUv.y;float bend=sin(y*7.-time*4.)*.045*y+sin(time*8.)*.025*y*y;
 float x=abs(vUv.x-.5-bend);float width=.26*pow(max(.001,1.-y),.72)*(.82+.18*sin(y*3.14));
 float edge=1.-smoothstep(width*.55,width,x);float a=edge*smoothstep(0.,.08,y)*(1.-smoothstep(.87,1.,y));
 vec3 c=mix(vec3(1.,.20,.045),vec3(1.,.72,.30),pow(edge,2.));c=mix(c,vec3(1.,.98,.85),pow(edge,7.)*(1.-y*.7));
 gl_FragColor=vec4(c*1.7,a*alpha);
}`;
const glowCanvas=document.createElement('canvas');glowCanvas.width=glowCanvas.height=128;
const gctx=glowCanvas.getContext('2d'),gradient=gctx.createRadialGradient(64,64,0,64,64,64);
gradient.addColorStop(0,'rgba(255,237,204,0.9)');gradient.addColorStop(.13,'rgba(255,157,95,0.5)');gradient.addColorStop(.38,'rgba(249,107,137,0.14)');gradient.addColorStop(1,'rgba(255,84,131,0)');gctx.fillStyle=gradient;gctx.fillRect(0,0,128,128);
const glowTexture=new THREE.CanvasTexture(glowCanvas);glowTexture.colorSpace=THREE.SRGBColorSpace;
function makeFire(height,overlay=false){
 const group=new THREE.Group();const mat=new THREE.ShaderMaterial({vertexShader:fireVertex,fragmentShader:fireFragment,uniforms:{time:{value:0},alpha:{value:1}},transparent:true,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending,toneMapped:false});
 const geometry=new THREE.PlaneGeometry(height*.62,height);geometry.translate(0,height*.47,0);const flame=new THREE.Mesh(geometry,mat);group.add(flame);
 const halo=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTexture,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,toneMapped:false}));halo.position.y=height*.36;halo.scale.setScalar(height*3.7);group.add(halo);
 if(overlay){flame.material.depthTest=false;halo.material.depthTest=false;flame.renderOrder=102;halo.renderOrder=101;}
 group.userData={flame,halo};scene.add(group);return group;
}
function updateFire(fire,time,opacity){fire.visible=opacity>.001;fire.userData.flame.quaternion.copy(camera.quaternion);fire.userData.flame.material.uniforms.time.value=time;fire.userData.flame.material.uniforms.alpha.value=opacity;fire.userData.halo.material.opacity=opacity*(.75+.1*Math.sin(time*7.1));}
function setupEffect(){
 // Find the highest point of the supplied mesh, so the flame stays attached to its tip.
 tip.set(0,-Infinity,0);model.updateWorldMatrix(true,true);const v=new THREE.Vector3();
 model.traverse(o=>{if(!o.isMesh)return;const p=o.geometry.attributes.position;for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i).applyMatrix4(o.matrixWorld);if(v.y>tip.y)tip.copy(v);}});
 tip.y+=unit*.005;
 match=new THREE.Group();scene.add(match);
 const stick=new THREE.Mesh(new THREE.CylinderGeometry(unit*.004,unit*.0035,unit*.17,8),new THREE.MeshStandardMaterial({color:0xc89479,roughness:.7,emissive:0x6b251c,emissiveIntensity:.25}));stick.position.y=-unit*.083;match.add(stick);
 const head=new THREE.Mesh(new THREE.SphereGeometry(unit*.006,12,8),new THREE.MeshBasicMaterial({color:0xffbb70}));match.add(head);
 match.traverse(o=>{if(o.isMesh){o.material.depthTest=false;o.material.depthWrite=false;o.renderOrder=100;}});
 matchFire=makeFire(unit*.065,true);candleFire=makeFire(unit*.067);candleFire.position.copy(tip);
 matchLight=new THREE.PointLight(0xffa968,0,unit*2.1,2);candleLight=new THREE.PointLight(0xffb97e,0,unit*2.4,2);candleLight.position.copy(tip);scene.add(matchLight,candleLight);
 replay();
}
function replay(){
 if(!model)return;clearTimeout(travelTimer);travelStart.hidden=true;window.dispatchEvent(new Event("travel:reset"));stopMicrophone();wishAt=null;extinguishedAt=null;ritual.hidden=true;manualBlow.hidden=true;breathMeter.hidden=true;candleFire.scale.setScalar(1);ignitionAt=null;hoverSince=null;pointer.active=false;pointer.down=false;pointer.touch=false;
 controls.autoRotate=false;document.querySelector('#rotate').setAttribute('aria-pressed','false');
 controls.enableRotate=false;controls.touches.ONE=THREE.TOUCH.PAN;
 document.querySelector('#replay').disabled=true;box.dataset.phase='awaiting';
 instruction.textContent=matchMedia('(pointer: coarse)').matches?'拖动火柴到顶部，停留片刻点亮':'移动鼠标，将火柴靠近顶部点亮';
}
function ignite(now){
 ignitionAt=now-(reducedMotion?3000:0);hoverSince=null;box.dataset.phase='igniting';
 controls.enableRotate=true;controls.touches.ONE=THREE.TOUCH.ROTATE;instruction.textContent='正在点亮…';
}
function stopMicrophone(){
 micEpoch++;if(audioTimer!==null){clearInterval(audioTimer);audioTimer=null;}if(audioSink){audioSink.disconnect();audioSink=null;}if(micStream){micStream.getTracks().forEach(t=>t.stop());micStream=null;}
 if(audioSource){audioSource.disconnect();audioSource=null;}analyser=null;wave=null;frequency=null;
 const old=audioContext;audioContext=null;if(old&&old.state!=='closed')old.close().catch(()=>{});
 breathDuration=0;breathGap=0;breathMeter.hidden=true;
}
function beginWish(now){
 wishAt=now;box.dataset.phase='wishing';controls.autoRotate=false;document.querySelector('#rotate').setAttribute('aria-pressed','false');
 ritual.hidden=false;ritualTitle.textContent='闭个眼睛，许个愿吧';ritualStatus.textContent='';wishDone.textContent='许好了';wishDone.hidden=false;wishDone.disabled=false;manualBlow.hidden=true;
 document.querySelector('#replay').disabled=false;instruction.textContent='闭个眼睛，许个愿吧';
}
function microphoneError(message){
 stopMicrophone();box.dataset.phase='mic-error';ritualStatus.textContent=message;wishDone.textContent='重试麦克风';wishDone.hidden=false;wishDone.disabled=false;manualBlow.hidden=false;
}
async function listenForBreath(){
 stopMicrophone();const epoch=micEpoch;box.dataset.phase='requesting';ritualTitle.textContent='吹灭蜡烛';ritualStatus.textContent='请允许使用麦克风，听见吹气声后蜡烛就会熄灭。';wishDone.disabled=true;manualBlow.hidden=true;
 let stream=null,ctx=null;
 try{
  if(!navigator.mediaDevices?.getUserMedia)throw Object.assign(new Error(),{name:'Unsupported'});
  ctx=new (window.AudioContext||window.webkitAudioContext)();audioContext=ctx;await ctx.resume();
  stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:false,noiseSuppression:false,autoGainControl:false},video:false});
  if(epoch!==micEpoch){stream.getTracks().forEach(t=>t.stop());if(ctx.state!=='closed')await ctx.close();return;}
  micStream=stream;analyser=ctx.createAnalyser();analyser.fftSize=2048;analyser.smoothingTimeConstant=.35;
  audioSource=ctx.createMediaStreamSource(stream);audioSource.connect(analyser);audioSink=ctx.createGain();audioSink.gain.value=0;analyser.connect(audioSink);audioSink.connect(ctx.destination);if(ctx.state!=='running')await ctx.resume();if(epoch!==micEpoch)return;wave=new Float32Array(analyser.fftSize);frequency=new Float32Array(analyser.frequencyBinCount);
  micStarted=lastAudioTime=lastSoundAt=performance.now();noiseFloor=.001;breathDuration=0;breathGap=0;calibration=[];box.dataset.phase='listening';wishDone.hidden=true;breathMeter.hidden=false;ritualStatus.textContent='请先安静一秒，正在适应环境声音…';audioTimer=setInterval(()=>sampleBreath(performance.now()),50);
  stream.getAudioTracks().forEach(track=>track.onended=()=>{if(epoch===micEpoch)microphoneError('麦克风连接已中断，请重试。');});
 }catch(error){
  if(stream)stream.getTracks().forEach(t=>t.stop());if(epoch!==micEpoch)return;
  const message=error.name==='NotAllowedError'?'未获得麦克风权限，请在浏览器中允许后重试。':error.name==='NotFoundError'?'没有找到麦克风。你也可以轻触按钮吹灭。':error.name==='Unsupported'?'当前浏览器无法使用麦克风，你也可以轻触按钮吹灭。':'麦克风暂时无法使用，请重试或轻触吹灭。';microphoneError(message);
 }
}
function extinguish(){
 if(extinguishedAt!==null)return;travelStart.hidden=false;travelTimer=setTimeout(()=>window.dispatchEvent(new Event('travel:open')),1200);extinguishedAt=performance.now();stopMicrophone();box.dataset.phase='blown';ritualTitle.textContent='蜡烛已熄灭';ritualStatus.textContent='愿你的心愿慢慢实现。';wishDone.hidden=true;manualBlow.hidden=true;instruction.textContent='蜡烛已熄灭';document.querySelector('#replay').disabled=false;
}
function sampleBreath(now){
 if(!analyser||box.dataset.phase!=='listening')return;
 analyser.getFloatTimeDomainData(wave);analyser.getFloatFrequencyData(frequency);const f=breathFeatures(wave,frequency,audioContext.sampleRate),dt=Math.min(.15,(now-lastAudioTime)/1000);lastAudioTime=now;
 const elapsed=now-micStarted;
 breathMeter.style.setProperty('--breath',clamp((20*Math.log10(Math.max(f.rms,1e-6))+75)/55,0,1).toFixed(3));
 if(elapsed<1000){calibration.push(f.rms);const sorted=[...calibration].sort((a,b)=>a-b);noiseFloor=Math.max(.0006,sorted[Math.floor(sorted.length*.65)]||.0006);return;}
 if(f.rms>.00005)lastSoundAt=now;
 if(audioContext.state!=='running'){ritualStatus.textContent='声音检测已暂停，请点击重新检测。';wishDone.textContent='重新检测';wishDone.hidden=false;wishDone.disabled=false;manualBlow.hidden=false;return;}
 ritualStatus.textContent=now-lastSoundAt>2500?'麦克风没有收到声音，请检查输入设备或重新检测。':'对着麦克风持续吹气约一秒，像吹蜡烛一样';
 const blowing=isBreath(f,noiseFloor);if(blowing){breathDuration+=dt;breathGap=0;}else{breathGap+=dt;if(breathGap>.12)breathDuration=0;}
 if(!blowing&&f.rms<noiseFloor*1.2)noiseFloor=Math.max(.0006,noiseFloor*.995+f.rms*.005);
 if(elapsed>6500){wishDone.textContent='重新检测';wishDone.hidden=false;wishDone.disabled=false;manualBlow.hidden=false;}
 if(breathDuration>=.7)extinguish();
}

wishDone.onclick=listenForBreath;manualBlow.onclick=extinguish;
window.addEventListener('pagehide',stopMicrophone);
document.addEventListener('visibilitychange',()=>{if(document.hidden&&['requesting','listening'].includes(box.dataset.phase))microphoneError('检测已暂停，返回后点击重试麦克风。');});
function renderStars(time,reveal){
 const w=box.clientWidth,h=box.clientHeight;skyContext.clearRect(0,0,w,h);if(reveal<=0)return;
 for(const s of stars){if(s.x<.25&&s.y<.26)continue;const x=s.x*w,y=s.y*h,alpha=reveal*(.25+.65*(.5+.5*Math.sin(time*.8+s.phase)));
 skyContext.fillStyle=`rgba(230,216,255,${alpha})`;skyContext.beginPath();skyContext.arc(x,y,s.r,0,Math.PI*2);skyContext.fill();
 if(s.spark){skyContext.strokeStyle=`rgba(222,207,255,${alpha*.7})`;skyContext.lineWidth=.65;skyContext.beginPath();skyContext.moveTo(x-4,y);skyContext.lineTo(x+4,y);skyContext.moveTo(x,y-5);skyContext.lineTo(x,y+5);skyContext.stroke();}
 }
}
const manager=new THREE.LoadingManager();manager.onProgress=(_url,loaded,total)=>{document.querySelector('#bar').style.width=Math.min(99,Math.round(loaded/total*100))+'%';};
new GLTFLoader(manager).setMeshoptDecoder(MeshoptDecoder).load('./assets/original/model.gltf',gltf=>{
 model=gltf.scene;scene.add(model);bounds=new THREE.Box3().setFromObject(model);bounds.getCenter(center);unit=bounds.max.y-bounds.min.y;
 frame();setupEffect();load.style.display='none';document.querySelector('#rotate').disabled=false;document.querySelector('#reset').disabled=false;
},undefined,e=>{console.error(e);document.querySelector('#loadText').textContent='载入失败';document.querySelector('#error').style.display='block';document.querySelector('#bar').style.display='none';});
document.querySelector('#rotate').onclick=e=>{controls.autoRotate=!controls.autoRotate;controls.autoRotateSpeed=1.1;e.currentTarget.setAttribute('aria-pressed',String(controls.autoRotate));};
document.querySelector('#reset').onclick=()=>{if(initialCamera){camera.position.copy(initialCamera);controls.target.copy(initialTarget);controls.update();}};
document.querySelector('#replay').onclick=replay;
function animate(now){
 requestAnimationFrame(animate);controls.update();
 if(model&&candleFire){
 const ft=reducedMotion?2:now/1000;
 const targetScreen=tip.clone().project(camera),tx=(targetScreen.x*.5+.5)*box.clientWidth,ty=(.5-targetScreen.y*.5)*box.clientHeight;
 targetHint.style.left=tx+'px';targetHint.style.top=ty+'px';
 if(ignitionAt===null){
   // Keep the cursor's match and light outside the mesh, even when hovering over its front.
   camera.getWorldDirection(viewDirection);
   const size=bounds.getSize(new THREE.Vector3());
   const extent=(Math.abs(viewDirection.x)*size.x+Math.abs(viewDirection.y)*size.y+Math.abs(viewDirection.z)*size.z)*.5;
   const front=center.clone().addScaledVector(viewDirection,-extent-unit*.08);
   pointerPlane.setFromNormalAndCoplanarPoint(viewDirection,front);
   if(pointer.active){pointerNdc.set(pointer.x/box.clientWidth*2-1,1-pointer.y/box.clientHeight*2);}
   else{const parked=new THREE.Vector3(center.x-unit*.34,center.y+unit*.2,center.z+unit*.4).project(camera);pointerNdc.set(parked.x,parked.y);}
   raycaster.setFromCamera(pointerNdc,camera);raycaster.ray.intersectPlane(pointerPlane,match.position);
   // Accept contact anywhere along the visible flame, including while dragging.
   const flameTop=match.position.clone().add(new THREE.Vector3(0,unit*.065*.9,0).applyQuaternion(camera.quaternion)).project(camera);
   const fx=(flameTop.x*.5+.5)*box.clientWidth,fy=(.5-flameTop.y*.5)*box.clientHeight;
   const dx=fx-pointer.x,dy=fy-pointer.y,lengthSq=dx*dx+dy*dy;
   const along=lengthSq?clamp(((tx-pointer.x)*dx+(ty-pointer.y)*dy)/lengthSq,0,1):0;
   const radius=pointer.touch?32:24;
   const near=pointer.active&&Math.hypot(pointer.x+along*dx-tx,pointer.y+along*dy-ty)<radius;
   if(near){hoverSince??=now;if(now-hoverSince>=420)ignite(now);}else hoverSince=null;
   targetHint.style.setProperty('--hold',hoverSince===null?0:Math.min(1,(now-hoverSince)/420));
 }
 const age=ignitionAt===null?-1:(now-ignitionAt)/1000,dim=wishAt===null?1:1-.82*(reducedMotion?1:smooth(0,1.8,(now-wishAt)/1000)),reveal=smooth(.25,2.8,age)*dim,ignition=smooth(0,.35,age),out=extinguishedAt===null?1:1-smooth(0,reducedMotion?.01:.65,(now-extinguishedAt)/1000);
 stage.style.setProperty('--reveal',reveal.toFixed(4));
 ambient.intensity=.075+reveal*.81;key.intensity=.045+reveal*.75;fill.intensity=.05+reveal*1.05;rim.intensity=.015+reveal*1.2;
 if(ignitionAt!==null)match.position.lerp(tip,.18);
 match.quaternion.copy(camera.quaternion);match.rotateZ(-.3);
 const matchOpacity=1-smooth(.12,.7,age);match.visible=matchOpacity>.01;match.scale.setScalar(Math.max(.001,matchOpacity));
 matchFire.position.copy(match.position);matchLight.position.copy(match.position);matchLight.intensity=matchOpacity*unit*unit*.22;
 updateFire(matchFire,ft,matchOpacity);updateFire(candleFire,ft,ignition*out);candleFire.scale.y=.25+.75*out;
 candleLight.intensity=ignition*out*unit*unit*(.11+.014*Math.sin(ft*7.2));renderStars(ft,reveal);
 if(age>=2.8&&box.dataset.phase==='igniting')beginWish(now);

 }
 renderer.render(scene,camera);
}
requestAnimationFrame(animate);
