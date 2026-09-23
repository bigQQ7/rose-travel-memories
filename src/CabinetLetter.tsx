import React, {useEffect,useRef,useState} from 'react';
import './cabinet-letter.css';
import './letter-unfold.css';

export default function CabinetLetter(){
  const host=useRef<HTMLDivElement>(null),action=useRef<()=>void>(()=>{}),letter=useRef<HTMLDialogElement>(null);
  const [status,setStatus]=useState('loading'),[retry,setRetry]=useState(0);
  useEffect(()=>{
    const el=host.current!;let dispose=()=>{},cancelled=false;
    const observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){observer.disconnect();init();}},{rootMargin:'350px'});observer.observe(el);
    async function init(){
      try{
        const three='three',loaderPath='three/addons/loaders/GLTFLoader.js',decoderPath='/assets/meshopt_decoder.module.js';
        const [T,{GLTFLoader},{MeshoptDecoder}]=await Promise.all([import(three),import(loaderPath),import(decoderPath)]);
        if(cancelled)return;
        const renderer=new T.WebGLRenderer({antialias:true,alpha:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.3;el.appendChild(renderer.domElement);
        const scene=new T.Scene(),camera=new T.PerspectiveCamera(35,1,.1,60);camera.position.set(4,2.8,6.7);camera.lookAt(0,1.35,0);
        scene.add(new T.HemisphereLight(0xfff8e6,0x727582,2.8));const sun=new T.DirectionalLight(0xffe8cb,3);sun.position.set(3,6,5);scene.add(sun);const fill=new T.DirectionalLight(0xd2dfff,1.5);fill.position.set(-4,3,-2);scene.add(fill);
        const pivot=new T.Group();scene.add(pivot);
        const envelope=new T.Group();scene.add(envelope);envelope.visible=false;
        const paper=new T.Mesh(new T.BoxGeometry(1.05,.68,.045),new T.MeshStandardMaterial({color:0x9b211d,roughness:.85}));envelope.add(paper);
        const flapShape=new T.Shape();flapShape.moveTo(-.525,.34);flapShape.lineTo(.525,.34);flapShape.lineTo(0,-.05);flapShape.closePath();const flap=new T.Mesh(new T.ShapeGeometry(flapShape),new T.MeshStandardMaterial({color:0xbb342a,side:T.DoubleSide}));flap.position.z=.028;envelope.add(flap);
        const seal=new T.Mesh(new T.CylinderGeometry(.075,.075,.02,32),new T.MeshStandardMaterial({color:0x9c4846,roughness:.65}));seal.rotation.x=Math.PI/2;seal.position.set(0,-.05,.05);envelope.add(seal);
        const shadowCanvas=document.createElement('canvas');shadowCanvas.width=128;shadowCanvas.height=128;const ctx=shadowCanvas.getContext('2d')!,gradient=ctx.createRadialGradient(64,64,6,64,64,60);gradient.addColorStop(0,'#453a3060');gradient.addColorStop(1,'#453a3000');ctx.fillStyle=gradient;ctx.fillRect(0,0,128,128);const shadow=new T.Mesh(new T.PlaneGeometry(4,3),new T.MeshBasicMaterial({map:new T.CanvasTexture(shadowCanvas),transparent:true,depthWrite:false}));shadow.rotation.x=-Math.PI/2;shadow.position.y=-.01;scene.add(shadow);
        let phase='loading',start=0,raf=0,visible=true,front=.65,baseRotation=0;
        const resize=()=>{const w=el.clientWidth,h=el.clientHeight;renderer.setSize(w,h);camera.aspect=w/h;camera.position.set(w<600?3.6:4,2.8,w<600?8.3:6.7);camera.lookAt(0,1.35,0);camera.updateProjectionMatrix();};const ro=new ResizeObserver(resize);ro.observe(el);resize();
        const io=new IntersectionObserver(es=>{visible=es[0].isIntersecting;});io.observe(el);
        const open=()=>{if(!letter.current?.open)letter.current?.showModal();};
        const trigger=()=>{if(phase==='ready'){phase='shaking';start=performance.now();setStatus('shaking');}else if(phase==='delivered')open();};action.current=trigger;
        const ray=new T.Raycaster(),pointer=new T.Vector2();const click=(e:MouseEvent)=>{const r=renderer.domElement.getBoundingClientRect();pointer.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(pointer,camera);if(ray.intersectObjects(phase==='delivered'?envelope.children:pivot.children,true).length)trigger();};renderer.domElement.addEventListener('click',click);
        const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
        function animate(now:number){raf=requestAnimationFrame(animate);if(!visible)return;
          if(phase==='shaking'){
            const t=(now-start)/1000,duration=reduced?.25:1.65;
            const strength=Math.sin(Math.min(t/duration,1)*Math.PI)*.055;
            pivot.rotation.z=reduced?0:Math.sin(t*34)*strength;pivot.rotation.y=baseRotation+(reduced?0:Math.sin(t*25)*strength*.6);pivot.position.y=reduced?0:Math.abs(Math.sin(t*24))*.035;
            if(t>=duration){pivot.rotation.set(0,baseRotation,0);pivot.position.y=0;phase='ejecting';start=now;envelope.visible=true;setStatus('ejecting');}
          }else if(phase==='ejecting'){
            const p=Math.min((now-start)/(reduced?300:2200),1);
            const slide=Math.min(p/.45,1),fall=Math.max(0,(p-.45)/.55),ease=fall*fall*(3-2*fall);
            envelope.position.set(.035*Math.sin(p*20)*(1-p),1.94-1.34*ease,front-.4+.85*slide+.95*ease);envelope.rotation.set(-Math.PI/2*(1-ease)-.12*ease,Math.sin(p*13)*.08*(1-p),Math.sin(p*18)*.08*(1-p));envelope.scale.setScalar(.8+.2*ease);
            if(p===1){phase='delivered';setStatus('delivered');}
          }else if(phase==='delivered'&&!reduced){envelope.position.y=.6+Math.sin(now*.0018)*.025;}
          renderer.render(scene,camera);
        }raf=requestAnimationFrame(animate);
        dispose=()=>{cancelAnimationFrame(raf);ro.disconnect();io.disconnect();renderer.domElement.removeEventListener('click',click);scene.traverse((o:any)=>{o.geometry?.dispose();if(o.material){for(const m of Array.isArray(o.material)?o.material:[o.material]){for(const v of Object.values(m) as any[])if(v?.isTexture)v.dispose();m.dispose();}}});renderer.dispose();renderer.domElement.remove();};
        const gltf=await new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).loadAsync('/assets/letter-cabinet.glb');
        if(cancelled){gltf.scene.traverse((o:any)=>{o.geometry?.dispose();o.material?.dispose();});return;}
        const box=new T.Box3().setFromObject(gltf.scene),size=box.getSize(new T.Vector3()),center=box.getCenter(new T.Vector3());const scale=2.7/size.y;
        gltf.scene.scale.setScalar(scale);gltf.scene.position.set(-center.x*scale,-box.min.y*scale,-center.z*scale);pivot.add(gltf.scene);front=size.z*scale/2;phase='ready';setStatus('ready');
      }catch(e){if(!cancelled){dispose();setStatus('error');console.error('Cabinet load failed',e);}}
    }
    return()=>{cancelled=true;observer.disconnect();dispose();action.current=()=>{};};
  },[retry]);
  return <section className="cabinet-ending" aria-labelledby="cabinet-title">
    <div className="cabinet-heading"><p>最后，还有一封信。</p><h2 id="cabinet-title">有些话，想亲手交给你。</h2></div>
    <div ref={host} className="cabinet-scene" data-state={status} aria-label="装着一封信的三维柜子" />
    <div className="cabinet-action" aria-live="polite">{status==='loading'?<p>正在把小柜子搬过来…</p>:status==='error'?<button onClick={()=>{setStatus('loading');setRetry(v=>v+1);}}>重新加载柜子</button>:<button onClick={()=>action.current()} disabled={status==='shaking'||status==='ejecting'}>{status==='ready'?'轻轻点一下柜子':status==='shaking'?'好像有什么藏在里面…':status==='ejecting'?'是给你的信。':'拆开这封信'}</button>}</div>
    <dialog ref={letter} className="cabinet-letter-dialog" onCancel={e=>{e.preventDefault();e.stopPropagation();letter.current?.close();}} onClick={e=>{if(e.target===e.currentTarget)letter.current?.close();}} aria-labelledby="cabinet-letter-title">
      <button aria-label="收起信" className="cabinet-letter-close" onClick={()=>letter.current?.close()}>×</button>
      <div className="opened-envelope">
        <div className="envelope-back" aria-hidden="true"/><div className="envelope-open-flap" aria-hidden="true"/>
        <article className="cabinet-letter-paper"><span className="letter-postmark" aria-hidden="true">♡<small>WITH LOVE</small></span><span className="letter-from">From: 我<br/>To: 亲爱的你</span><p className="letter-dateline">写给一起走过这些路的你</p><h3 id="cabinet-letter-title">亲爱的你：</h3><p>翻到这里，我们又把那些日子走了一遍。原来最舍不得的，不只是某一座城市、某一次日落，而是每一张照片里，都有我们。</p><p>谢谢你陪我出发，也陪我把普通的小事变成了回忆。以后还想和你一起看海、看雪，走进没去过的街道，也在熟悉的地方慢慢散步。</p><p>这一页写到这里，下一程，我们一起。</p><p className="letter-signoff">把往后的好天气，也留给你。<br/>♡</p></article>
        <div className="envelope-front" aria-hidden="true"><div className="envelope-left"/><div className="envelope-right"/><div className="envelope-bottom"/><div className="letter-photo-stamp"><img src="/assets/hangzhou-3.png" alt=""/></div></div>
      </div>
    </dialog>
  </section>;
}
