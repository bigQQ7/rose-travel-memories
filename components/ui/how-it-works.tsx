"use client";

import React from 'react';
import { LazyMotion, domAnimation, m, useReducedMotion } from 'motion/react';

export interface Step {
  date?: string;
  image?: string;
  title: string;
  description: string;
  colorTheme?: 'orange' | 'blue' | 'purple';
  colors?: { bg: string; text: string; border: string };
}
export interface StepPosition { className?: string; rotate?: string }
export interface HowItWorksProps { features?: Step[]; className?: string; stepPositions?: StepPosition[]; onSelect?: (index: number) => void }

export default function HowItWorks({ features = [], className = '', stepPositions, onSelect }: HowItWorksProps) {
  const reducedMotion = useReducedMotion();
  return <LazyMotion features={domAnimation}>
    <div className={`storybook-path ${className}`}>
      <div className="storybook-track">
        <svg className="memory-thread" viewBox="0 0 1000 1750" preserveAspectRatio="none" aria-hidden="true">
          <m.path d="M 260 180 C 590 120 840 240 730 470 S 220 560 260 820 S 880 940 730 1160 S 160 1350 260 1520" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="5 10" strokeLinecap="round" initial={{strokeDashoffset:0}} animate={{strokeDashoffset:reducedMotion ? 0 : -150}} transition={{duration:12,repeat:Infinity,ease:'linear'}} />
        </svg>
        {features.map((step,index) => <article className={`memory-card memory-card-${index+1} ${stepPositions?.[index]?.className || ''}`} key={`${step.date}-${step.title}`}>
          <button className="memory-open" type="button" aria-label={`查看 ${step.date} ${step.title} 的旅行回忆`} onClick={() => onSelect?.(index)} />
          <div className="memory-art" aria-hidden="true"><img src={step.image || './assets/storybook-clouds.png'} alt="" loading={index<2?'eager':'lazy'} /><span className="memory-order">{String(index+1).padStart(2,'0')}</span></div>
          <div className="memory-paper">
            <time className="memory-date" dateTime={step.date?.replace('.', '-')}>{step.date}</time>
            <h3>{step.title}</h3>
            <p>{step.description}</p>
            <span className="memory-star" aria-hidden="true">✦</span>
          </div>
        </article>)}
      </div>
    </div>
  </LazyMotion>;
}
