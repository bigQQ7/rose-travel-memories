import React, { useEffect, useRef, useState } from 'react';
import AccordionGallery from '../components/AccordionGallery';
import { tripDetails } from './trip-details';
import type { Step } from '../components/ui/how-it-works';

export default function TripDetail({ index, trip, onClose }: {index:number;trip:Step;onClose:()=>void}) {
  const modal=useRef<HTMLDialogElement>(null);
  const [mobile,setMobile]=useState(()=>matchMedia('(max-width:520px)').matches);
  useEffect(()=>{
    const focused=document.activeElement as HTMLElement|null;
    const el=modal.current!;el.showModal();
    const query=matchMedia('(max-width:520px)');const change=()=>setMobile(query.matches);query.addEventListener('change',change);
    return ()=>{query.removeEventListener('change',change);el.close();focused?.focus({preventScroll:true});};
  },[]);
  const detail=tripDetails[index];
  return <dialog className="trip-detail" ref={modal} aria-labelledby="trip-detail-title" onClose={e=>e.stopPropagation()} onCancel={e=>{e.preventDefault();e.stopPropagation();onClose();}} onClick={e=>{if(e.target===e.currentTarget){const r=e.currentTarget.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)onClose();}}}>
    <div className="trip-detail-top"><span>{trip.date} · 旅行手记</span><button type="button" aria-label="关闭旅行详情" onClick={onClose}>关闭 ×</button></div>
    <div className="trip-detail-content">
      <h2 id="trip-detail-title">{trip.title}</h2>
      <p className="trip-detail-subtitle">{trip.description}</p>
      <div className="trip-feeling">{detail.feeling.map((p,i)=><p key={i}>{p}</p>)}</div>
      <div className="trip-photo-heading"><h3>那时的我们</h3><span>{detail.photos.length} 张照片</span></div>
      {detail.photos.length>1&&<p className="trip-gallery-help">{mobile?'轻触照片，展开回忆':'移动鼠标到照片上，展开回忆'}</p>}
      <AccordionGallery key={`${index}-${mobile}`} items={detail.photos} defaultIndex={2} expandRatio={0.52} trigger="hover" orientation={mobile?'vertical':'horizontal'} grayscale={false} height={420} className={detail.photos.length===1?'trip-gallery-single':''}/>
    </div>
  </dialog>;
}
