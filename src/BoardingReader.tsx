import React, { useEffect, useRef, useState } from 'react';

export type ReaderStatus = 'ready' | 'reading' | 'error' | 'accepted';
const labels = { ready: 'READY', reading: 'READING', error: 'TRY AGAIN', accepted: 'WELCOME' };
const colors = { ready: '#bed4b2', reading: '#ffda73', error: '#ff8c87', accepted: '#adf5a0' };

/** Real geometry: a recessed slot between two shells, with a separate screen and indicator. */
export function createBoardingReaderModel(T: any) {
  const model = new T.Group();
  model.name = 'boarding-reader';
  const materials = {
    shell: new T.MeshPhysicalMaterial({ color: 0xd4c9a8, roughness: .34, metalness: .22, clearcoat: .3, clearcoatRoughness: .4 }),
    face: new T.MeshStandardMaterial({ color: 0xc8bea0, roughness: .48, metalness: .15 }),
    edge: new T.MeshStandardMaterial({ color: 0xe7ddbd, roughness: .3, metalness: .28 }),
    dark: new T.MeshStandardMaterial({ color: 0x33382e, roughness: .54, metalness: .2 }),
    recess: new T.MeshStandardMaterial({ color: 0x34342a, roughness: .9 }),
    rubber: new T.MeshStandardMaterial({ color: 0x575347, roughness: .95 }),
  };
  function rounded(w: number, h: number, d: number, r: number) {
    const shape = new T.Shape(), x = -w / 2, y = -h / 2;
    shape.moveTo(x+r,y);shape.lineTo(x+w-r,y);shape.quadraticCurveTo(x+w,y,x+w,y+r);
    shape.lineTo(x+w,y+h-r);shape.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
    shape.lineTo(x+r,y+h);shape.quadraticCurveTo(x,y+h,x,y+h-r);
    shape.lineTo(x,y+r);shape.quadraticCurveTo(x,y,x+r,y);
    const bevel = Math.min(.045,d*.22,r*.3);
    const geometry = new T.ExtrudeGeometry(shape,{depth:d-2*bevel,bevelEnabled:true,bevelSegments:3,steps:1,bevelSize:bevel,bevelThickness:bevel,curveSegments:8});
    geometry.translate(0,0,-d/2+bevel);
    return geometry;
  }
  function part(name: string, w: number, h: number, d: number, r: number, x: number, y: number, z: number, material: any) {
    const pivot = new T.Group();pivot.name=name;pivot.position.set(x,y,z);
    const mesh=new T.Mesh(rounded(w,h,d,r),material);mesh.castShadow=true;pivot.add(mesh);model.add(pivot);
    pivot.userData={partId:name,restPosition:[x,y,z],detachable:true};
    return pivot;
  }
  part('lower-housing',8,1.7,1.1,.17,0,-.2,0,materials.shell);
  part('rear-shell',7.94,.65,.3,.12,0,.54,-.4,materials.shell);
  part('upper-rounded-rail',8,.31,1.15,.14,0,.94,0,materials.edge);
  part('slot-interior',7.5,.13,.035,.025,0,.719,.1,materials.recess);
  part('slot-floor',7.5,.035,.61,.013,0,.657,.26,materials.dark);
  part('slot-left-end',.2,.18,.86,.045,-3.86,.72,-.03,materials.shell);
  part('slot-right-end',.2,.18,.86,.045,3.86,.72,-.03,materials.shell);
  part('front-recess-border',7.49,1.39,.04,.07,0,-.2,.56,materials.edge);
  part('front-panel',7.43,1.33,.045,.07,0,-.22,.595,materials.face);
  part('display-bezel',3.58,.99,.14,.08,-.15,-.15,.675,materials.dark);
  const displayCanvas=document.createElement('canvas');displayCanvas.width=768;displayCanvas.height=192;
  const context=displayCanvas.getContext('2d')!;
  const texture=new T.CanvasTexture(displayCanvas);texture.colorSpace=T.SRGBColorSpace;
  const screenMaterial=new T.MeshBasicMaterial({map:texture,toneMapped:false});
  part('glass-display',3.34,.76,.024,.02,-.15,-.15,.755,materials.recess);
  const display=new T.Mesh(new T.PlaneGeometry(3.28,.7),screenMaterial);display.name='display-content';display.position.set(-.15,-.15,.769);model.add(display);
  const indicatorRim=new T.Mesh(new T.CylinderGeometry(.108,.108,.07,32),materials.dark);
  indicatorRim.name='indicator-rim';indicatorRim.rotation.x=Math.PI/2;indicatorRim.position.set(3.44,-.24,.66);model.add(indicatorRim);
  const indicatorMaterial=new T.MeshStandardMaterial({color:0xbed4b2,emissive:0xbed4b2,emissiveIntensity:.25,roughness:.24});
  const indicator=new T.Mesh(new T.SphereGeometry(.062,24,16),indicatorMaterial);indicator.scale.z=.5;indicator.position.set(3.44,-.24,.713);indicator.name='status-light';model.add(indicator);
  // Two banks of inset ventilation slots follow the curved front lip.
  const ventGeometry=rounded(.035,.105,.016,.012);
  const vents=new T.InstancedMesh(ventGeometry,materials.dark,26);vents.name='ventilation-slots';
  const matrix=new T.Matrix4(),rotation=new T.Quaternion().setFromAxisAngle(new T.Vector3(0,0,1),-.13);
  for(let bank=0;bank<2;bank++)for(let i=0;i<13;i++)matrix.compose(new T.Vector3((bank?2.03:-3.54)+i*.12,.94,.58),rotation,new T.Vector3(1,1,1)),vents.setMatrixAt(bank*13+i,matrix);
  model.add(vents);
  for(const x of [-3.2,3.2])for(const z of [-.32,.32])part(`rubber-foot-${x}-${z}`,.55,.1,.23,.04,x,-1.09,z,materials.rubber);
  function setStatus(status: ReaderStatus) {
    context.fillStyle='#10170f';context.fillRect(0,0,768,192);
    const sheen=context.createLinearGradient(0,0,0,192);sheen.addColorStop(0,'#ffffff0b');sheen.addColorStop(.45,'#ffffff00');context.fillStyle=sheen;context.fillRect(0,0,768,192);
    context.font='600 76px monospace';context.textAlign='center';context.textBaseline='middle';context.fillStyle=colors[status];context.shadowColor=colors[status];context.shadowBlur=10;context.fillText(labels[status],384,101);context.shadowBlur=0;
    texture.needsUpdate=true;indicatorMaterial.color.set(colors[status]);indicatorMaterial.emissive.set(colors[status]);indicatorMaterial.emissiveIntensity=status==='ready'?.25:1;
  }
  setStatus('ready');
  return {model,setStatus};
}

export default function BoardingReader({status}:{status:ReaderStatus}) {
  const host=useRef<HTMLDivElement>(null), update=useRef<(status:ReaderStatus)=>void>(()=>{}), current=useRef(status);
  const [loaded,setLoaded]=useState(false);
  current.current=status;
  useEffect(()=>{update.current(status);},[status]);
  useEffect(()=>{
    let cancelled=false,dispose=()=>{};
    async function init(){
      try {
        const moduleName='three',T=await import(moduleName);
        if(cancelled||!host.current)return;
        const el=host.current,renderer=new T.WebGLRenderer({alpha:true,antialias:true});
        renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;
        renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;
        el.appendChild(renderer.domElement);
        const scene=new T.Scene(),camera=new T.OrthographicCamera(-4.65,4.65,1.85,-1.85,.1,40);
        camera.position.set(1.7,3.4,12);camera.lookAt(0,0,0);
        scene.add(new T.HemisphereLight(0xfff6e6,0x756c67,2.25));
        const key=new T.DirectionalLight(0xfff5df,3.1);key.position.set(-3,7,6);key.castShadow=true;key.shadow.mapSize.set(1024,1024);key.shadow.camera.left=-6;key.shadow.camera.right=6;key.shadow.camera.top=4;key.shadow.camera.bottom=-4;key.shadow.normalBias=.025;key.shadow.bias=-.0002;key.shadow.radius=3;scene.add(key);
        const fill=new T.DirectionalLight(0xe8e8ff,1.2);fill.position.set(5,3,-3);scene.add(fill);
        const {model,setStatus}=createBoardingReaderModel(T);scene.add(model);
        const floor=new T.Mesh(new T.PlaneGeometry(20,12),new T.ShadowMaterial({opacity:.15}));floor.rotation.x=-Math.PI/2;floor.position.y=-1.15;floor.receiveShadow=true;scene.add(floor);
        const render=()=>renderer.render(scene,camera);
        update.current=(value)=>{setStatus(value);render();};
        const resize=()=>{const w=el.clientWidth,h=el.clientHeight;renderer.setSize(w,h);const aspect=w/h;camera.left=-4.55;camera.right=4.55;camera.top=4.55/aspect;camera.bottom=-4.55/aspect;camera.updateProjectionMatrix();render();};
        const observer=new ResizeObserver(resize);observer.observe(el);resize();update.current(current.current);setLoaded(true);
        dispose=()=>{observer.disconnect();update.current=()=>{};const geometries=new Set<any>(),materials=new Set<any>(),textures=new Set<any>();scene.traverse((o:any)=>{if(o.geometry)geometries.add(o.geometry);if(o.material)for(const m of Array.isArray(o.material)?o.material:[o.material])materials.add(m);});for(const m of materials){for(const value of Object.values(m) as any[])if(value?.isTexture)textures.add(value);m.dispose();}textures.forEach(t=>t.dispose());geometries.forEach(g=>g.dispose());renderer.dispose();renderer.domElement.remove();};
      }catch(error){console.error('Reader model unavailable',error);}
    }
    init();return()=>{cancelled=true;dispose();};
  },[]);
  return <><div ref={host} className="reader-model" aria-hidden="true" />{!loaded&&<div className="reader-fallback"><div className="reader-top"><i/><i/></div><div className="reader-slot"/><div className="reader-front"><div className="reader-display">{labels[status]}</div><span className="reader-light"/></div></div>}<span className="reader-status-text" role="status" aria-live="polite">{labels[status]}</span></>;
}
