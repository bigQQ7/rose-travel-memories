import type { ComponentType } from 'react';
export interface GalleryItem { image: string; label: string; alt?: string; link?: string }
declare const AccordionGallery: ComponentType<{items: GalleryItem[]; defaultIndex?:number; expandRatio?:number; trigger?:'hover'|'click'; orientation?:'horizontal'|'vertical'; height?:number; grayscale?:boolean; className?:string}>;
export default AccordionGallery;
