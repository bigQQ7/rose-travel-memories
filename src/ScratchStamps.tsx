import React, { useEffect, useRef, useState } from 'react';
import './scratch-stamps.css';

const stamps = [
  { title: '把初夏寄给你', place: 'HANGZHOU', date: '05 / 2021', color: '#a8b77c', image: 'hangzhou-3.png', note: '第一次一起出发，连走过的普通街道都变得特别。以后再想起杭州，先想起的总是身边的你。' },
  { title: '热闹里有我们', place: 'CHENGDU', date: '09 / 2021', color: '#c18b68', image: 'gallery-2-3.png', note: '把笑声留在街头，把快乐藏进合照。和你在一起，吃什么、去哪里，都能变成值得记很久的小事。' },
  { title: '海风替我说', place: 'SUMMER MAIL', date: '06 / 2023', color: '#819da1', image: 'gallery-3-3.jpg', note: '想把那天的海风和日落一起寄给你。照片装不下的，是我们一路上的笑声，还有下次再出发的期待。' },
  { title: '冬天也很温柔', place: 'WINTER POST', date: '02 / 2025', color: '#737766', image: 'gallery-5-4.jpg', note: '雪山很远，身边的你很近。愿我们以后还会一起看很多场雪，也一起把平常的日子过得亮晶晶。' }
];

function ScratchLayer({ color, saved, done, onSave, onReveal }: { color: string; saved?: string; done: boolean; onSave: (s:string)=>void; onReveal: ()=>void }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const last = useRef<{x:number;y:number}|null>(null);
  const completed = useRef(done);
  useEffect(() => {
    completed.current = done;
    const c = canvas.current!, ctx = c.getContext('2d')!;
    ctx.clearRect(0,0,600,760);
    if (done) return;
    if (saved) { const img = new Image(); img.onload=()=>ctx.drawImage(img,0,0); img.src=saved; return; }
    ctx.fillStyle=color;ctx.fillRect(0,0,600,760);
    const g=ctx.createRadialGradient(180,160,10,320,400,510);
    g.addColorStop(0,'#f4eccb99');g.addColorStop(.4,'#ffffff08');g.addColorStop(.7,'#263b342e');g.addColorStop(1,'#ebe6c455');
    ctx.fillStyle=g;ctx.fillRect(0,0,600,760);
    ctx.save();ctx.filter='blur(22px)';ctx.strokeStyle='#eee8c891';ctx.lineWidth=67;ctx.beginPath();ctx.moveTo(670,50);ctx.bezierCurveTo(420,250,100,140,150,450);ctx.bezierCurveTo(180,590,480,480,480,780);ctx.stroke();ctx.restore();
    const pixels=ctx.getImageData(0,0,600,760);for(let i=0;i<pixels.data.length;i+=4){const n=(Math.random()-.5)*17;for(let j=0;j<3;j++)pixels.data[i+j]+=n;}ctx.putImageData(pixels,0,0);
  }, []);
  function erase(e: React.PointerEvent<HTMLCanvasElement>) {
    if(!last.current || completed.current)return;
    const c=canvas.current!,r=c.getBoundingClientRect(),ctx=c.getContext('2d')!;
    const p={x:(e.clientX-r.left)*600/r.width,y:(e.clientY-r.top)*760/r.height};
    ctx.globalCompositeOperation='destination-out';ctx.lineWidth=64;ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();ctx.moveTo(last.current.x,last.current.y);ctx.lineTo(p.x,p.y);ctx.stroke();last.current=p;
  }
  function finish() {
    if(!last.current)return;last.current=null;
    const c=canvas.current!,ctx=c.getContext('2d')!,data=ctx.getImageData(0,0,600,760).data;
    let clear=0,total=0;for(let i=3;i<data.length;i+=64){total++;if(data[i]<64)clear++;}
    onSave(c.toDataURL());
    if(clear/total>.6){completed.current=true;onReveal();}
  }
  return <canvas ref={canvas} width={600} height={760} className={`stamp-scratch ${done?'is-revealed':''}`} aria-hidden="true" onPointerDown={e=>{if(done)return;e.currentTarget.setPointerCapture(e.pointerId);const r=e.currentTarget.getBoundingClientRect();last.current={x:(e.clientX-r.left)*600/r.width,y:(e.clientY-r.top)*760/r.height};erase(e);}} onPointerMove={erase} onPointerUp={finish} onPointerCancel={finish} />;
}

export default function ScratchStamps(){
  const [selected,setSelected]=useState<number|null>(null);
  const [revealed,setRevealed]=useState<boolean[]>([false,false,false,false]);
  const saved=useRef<Record<number,string>>({});
  const dialog=useRef<HTMLDialogElement>(null),paper=useRef<HTMLDivElement>(null);
  const buttons=useRef<(HTMLButtonElement|null)[]>([]);
  const origin=useRef<DOMRect|null>(null);
  useEffect(()=>{
    if(selected===null){dialog.current?.close();return;}
    dialog.current?.showModal();
    const el=paper.current,from=origin.current;
    if(el&&from&&!matchMedia('(prefers-reduced-motion: reduce)').matches){const to=el.getBoundingClientRect();el.animate([{transform:`translate(${from.x+from.width/2-to.x-to.width/2}px,${from.y+from.height/2-to.y-to.height/2}px) scale(${from.width/to.width})`},{transform:'none'}],{duration:650,easing:'cubic-bezier(.2,.8,.2,1)'});}
  },[selected]);
  const close=()=>{const prev=selected;setSelected(null);if(prev!==null)requestAnimationFrame(()=>buttons.current[prev]?.focus());};
  const reveal=()=>setRevealed(a=>a.map((v,i)=>i===selected?true:v));
  const s=selected===null?null:stamps[selected];
  return <section className={`memory-post ${selected!==null?'has-open-stamp':''}`} aria-labelledby="memory-post-title">
    <header><span className="post-eyebrow">LETTERS FROM OUR JOURNEY</span><h2 id="memory-post-title">寄给你的，沿途。</h2><p>选一枚邮票，刮开一段藏起来的回忆。</p></header>
    <div className="stamp-collection">{stamps.map((s,i)=><button key={s.place} ref={el=>{buttons.current[i]=el;}} className="stamp-choice" aria-label={`打开邮票：${s.title}`} onClick={()=>{origin.current=buttons.current[i]!.getBoundingClientRect();setSelected(i);}} style={{'--stamp-color':s.color,'--stamp-angle':`${[-3,2,-2,3][i]}deg`} as React.CSSProperties}>
      <div className="stamp-paper"><div className={`stamp-art ${revealed[i]?'uncovered':''}`} style={revealed[i]?{backgroundImage:`url(/assets/${s.image})`}:{}}><span className="stamp-place">{s.place.split(' ').map((v,j)=><React.Fragment key={j}>{v}<br/></React.Fragment>)}</span><span className="stamp-date">{s.date}</span></div></div><span className="stamp-caption">{s.title}{revealed[i]?' · 已收藏':''}</span>
    </button>)}</div>
    <footer className="post-footnote">把风景留在邮票上，把你留在每一程里。</footer>
    <dialog ref={dialog} className="stamp-dialog" aria-label={s?.title} onCancel={e=>{e.preventDefault();e.stopPropagation();close();}} onClick={e=>{if(e.target===e.currentTarget)close();}}>
      {s&&selected!==null&&<div className="stamp-focus"><button className="stamp-close" onClick={close} aria-label="收起邮票">×</button><div className="stamp-paper stamp-large" ref={paper} style={{'--stamp-color':s.color} as React.CSSProperties}><div className="stamp-reveal-art"><img src={`/assets/${s.image}`} alt={s.title}/><ScratchLayer key={selected} color={s.color} saved={saved.current[selected]} done={revealed[selected]} onSave={v=>{saved.current[selected]=v;}} onReveal={reveal}/><span className="stamp-place">{s.place}</span><span className="stamp-date">{s.date}</span></div></div>
        <div className="stamp-message" aria-live="polite"><h3>{s.title}</h3><p>{revealed[selected]?s.note:'用鼠标或手指轻轻刮开，看看这次寄来了什么。'}</p><button className="stamp-reveal-button" onClick={revealed[selected]?close:reveal}>{revealed[selected]?'收好这枚邮票':'直接揭晓'}</button></div>
      </div>}
    </dialog>
  </section>;
}
