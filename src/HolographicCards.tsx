import React, { useState } from 'react';
import './holographic-cards.css';
const messages=['谢谢你把第一次旅行，变成我们故事的开场。','和你一起，普通的街道也值得慢慢走。','照片会褪色，但我记得你笑起来的样子。','愿我们去看更多海，也把每一次日落留给彼此。','谢谢你在我身边，把狼狈也变成了可爱的回忆。','下一次出发，还是想坐在你旁边。'];
const questions=['你身上我最羡慕的一点？','我希望我们一起做的一件事？','爱心','最近的小争吵','我最喜欢你的地方？','祝我们下一个十年？'];
export default function HolographicCards(){
  const [flipped,setFlipped]=useState(messages.map(()=>false));
  const track=(e:React.PointerEvent<HTMLButtonElement>)=>{
    if(e.pointerType==='touch')return;
    const el=e.currentTarget,r=el.getBoundingClientRect();
    const x=Math.max(0,Math.min(1,(e.clientX-r.left)/r.width));
    const y=Math.max(0,Math.min(1,(e.clientY-r.top)/r.height));
    el.style.setProperty('--mx',`${x*100}%`);
    el.style.setProperty('--my',`${y*100}%`);
    el.style.setProperty('--rx',`${(0.5-y)*9}deg`);
    el.style.setProperty('--ry',`${(x-0.5)*12}deg`);
    el.style.setProperty('--light-angle',`${110+(x-.5)*32}deg`);
  };
  const reset=(e:React.PointerEvent<HTMLButtonElement>)=>{
    e.currentTarget.style.setProperty('--rx','0deg');
    e.currentTarget.style.setProperty('--ry','0deg');
  };
  return <section className="holo-cards" aria-labelledby="holo-cards-title"><p className="holo-kicker">A LITTLE SOMETHING</p><h2 id="holo-cards-title">翻开一张，看看我想说的话</h2><p className="holo-hint">轻轻翻开，里面有想对你说的话。</p><div className="holo-grid">{messages.map((m,i)=><button type="button" key={i} className={`holo-card ${flipped[i]?'is-flipped':''}`} onClick={()=>setFlipped(p=>p.map((v,j)=>j===i?!v:v))} onPointerEnter={track} onPointerMove={track} onPointerLeave={reset} onPointerCancel={reset} aria-pressed={flipped[i]} aria-label={`${flipped[i]?"收起":"翻开"}：${questions[i]}`}><span className="holo-lift"><span className="holo-card-inner"><span className="holo-face holo-back"><img className="card-art" src={`./assets/question-card-${i+1}.png`} alt="" draggable={false}/><span className="holo-shine"/></span><span className="holo-face holo-front"><span className="front-mark">✦</span><span className="front-number">{String(i+1).padStart(2,'0')} / {String(messages.length).padStart(2,'0')}</span><span className="front-message">{m}</span><span className="front-sign">写给一直在我身边的你</span><span className="front-mark bottom">✦</span></span></span></span></button>)}</div></section>;
}
