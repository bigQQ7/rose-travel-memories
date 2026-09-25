import React, { useEffect, useRef, useState } from 'react';
import './scratch-stamps.css';

const stamps = [
  { title: '创口贴上的心电图', place: 'HANGZHOU', date: '05 / 2021', color: '#fff8bc', cover: 'stamp-cover-1.png', image: 'stamp-photo-1.png', note: '其实在翻到这张照片之前我好像已经忘记这件事儿了，依稀记得好像是我们在广场那里我手被划了一下然后一起去买创口贴结果突发奇想整了个心电图哈哈哈哈' },
  { title: '那年操场上的雪', place: 'CHENGDU', date: '09 / 2021', color: '#d4f5ff', cover: 'stamp-cover-2.png', image: 'stamp-photo-2.png', note: '17年底某一个雪天，好像是班级在操场打雪仗玩雪，好像这是我对高中生活为数不多的快乐记忆' },
  { title: '每次跨年都去多客士', place: 'SUMMER MAIL', date: '06 / 2023', color: '#fce5f8', cover: 'stamp-cover-3.png', image: 'stamp-photo-3.png', note: '每次跨年都回去多客士吃饭！' },
  { title: '在院子里跨年', place: 'WINTER POST', date: '02 / 2025', color: '#e7d7ff', cover: 'stamp-cover-4.png', image: 'stamp-photo-4.png', note: '疫情刚放开，难得能赶在新年前回家，但是刚刚放开我们也没去别的地方，就在院子里跨年啦！' }
];

function ScratchLayer({ color, cover, saved, done, onSave, onReveal }: { color: string; cover: string; saved?: string; done: boolean; onSave: (s:string)=>void; onReveal: ()=>void }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const last = useRef<{x:number;y:number}|null>(null);
  const completed = useRef(done);
  useEffect(() => {
    completed.current = done;
    const c = canvas.current!, ctx = c.getContext('2d')!;
    ctx.clearRect(0,0,600,760);
    if (done) return;
    ctx.globalCompositeOperation='source-over';
    ctx.fillStyle=color;ctx.fillRect(0,0,600,760);
    const img = new Image();
    img.onload=()=>{
      if(saved){ctx.clearRect(0,0,600,760);ctx.drawImage(img,0,0);return;}
      const scale=Math.max(600/img.width,760/img.height);
      const width=img.width*scale,height=img.height*scale;
      ctx.drawImage(img,(600-width)/2,(760-height)/2,width,height);
    };
    img.src=saved||`./assets/${cover}`;
    return ()=>{img.onload=null;};
  }, [cover, saved, done, color]);
  function erase(e: React.PointerEvent<HTMLCanvasElement>) {
    if(!last.current || completed.current)return;
    const c=canvas.current!,r=c.getBoundingClientRect(),ctx=c.getContext('2d')!;
    const p={x:(e.clientX-r.left)*600/r.width,y:(e.clientY-r.top)*760/r.height};
    ctx.globalCompositeOperation='destination-out';ctx.lineWidth=128;ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();ctx.moveTo(last.current.x,last.current.y);ctx.lineTo(p.x,p.y);ctx.stroke();last.current=p;
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
  return <section className={`memory-post ${selected!==null?'has-open-stamp':''}`} aria-label="邮票回忆">
    <header><p>选一枚邮票，刮开一段藏起来的回忆。</p></header>
    <div className="stamp-collection">{stamps.map((s,i)=><button key={s.place} ref={el=>{buttons.current[i]=el;}} className="stamp-choice" aria-label={`打开邮票：${s.title}`} onClick={()=>{origin.current=buttons.current[i]!.getBoundingClientRect();setSelected(i);}} style={{'--stamp-color':s.color,'--stamp-angle':`${[-3,2,-2,3][i]}deg`} as React.CSSProperties}>
      <div className="stamp-paper"><div className={`stamp-art ${revealed[i]?'uncovered':''}`} style={{backgroundImage:`url(./assets/${revealed[i]?s.image:s.cover})`}}><span className="stamp-place">{s.place.split(' ').map((v,j)=><React.Fragment key={j}>{v}<br/></React.Fragment>)}</span><span className="stamp-date">{s.date}</span></div></div><span className="stamp-caption">{s.title}{revealed[i]?' · 已收藏':''}</span>
    </button>)}</div>
    <footer className="post-footnote">把风景留在邮票上，把你留在每一程里。</footer>
    <dialog ref={dialog} className="stamp-dialog" aria-label={s?.title} onCancel={e=>{e.preventDefault();e.stopPropagation();close();}} onClick={e=>{if(e.target===e.currentTarget)close();}}>
      {s&&selected!==null&&<div className="stamp-focus"><button className="stamp-close" onClick={close} aria-label="收起邮票">×</button><div className="stamp-paper stamp-large" ref={paper} style={{'--stamp-color':s.color} as React.CSSProperties}><div className={`stamp-reveal-art ${revealed[selected]?'uncovered':''}`}><img src={`./assets/${s.image}`} alt={s.title}/><ScratchLayer key={selected} color={s.color} cover={s.cover} saved={saved.current[selected]} done={revealed[selected]} onSave={v=>{saved.current[selected]=v;}} onReveal={reveal}/><span className="stamp-place">{s.place}</span><span className="stamp-date">{s.date}</span></div></div>
        <div className="stamp-message" aria-live="polite"><h3>{s.title}</h3><p>{revealed[selected]?s.note:'用鼠标或手指轻轻刮开，看看这次寄来了什么。'}</p><button className="stamp-reveal-button" onClick={revealed[selected]?close:reveal}>{revealed[selected]?'收好这枚邮票':'直接揭晓'}</button></div>
      </div>}
    </dialog>
  </section>;
}
