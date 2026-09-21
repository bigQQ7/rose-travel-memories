// Local spectral analysis only: no audio is recorded or sent to a server.
export function breathFeatures(wave,frequency,sampleRate){
 let square=0;for(const value of wave)square+=value*value;
 const rms=Math.sqrt(square/wave.length),binHz=sampleRate/(frequency.length*2);
 let energy=0,logEnergy=0,weighted=0,low=0,peak=0,count=0,entropySum=0;
 const start=Math.max(1,Math.ceil(20/binHz)),end=Math.min(frequency.length,Math.floor(6500/binHz));
 for(let i=start;i<end;i++){const power=Math.max(1e-14,10**(frequency[i]/10));energy+=power;logEnergy+=Math.log(power);weighted+=power*i*binHz;if(i*binHz<650)low+=power;peak=Math.max(peak,power);count++;}
 for(let i=start;i<end;i++){const p=Math.max(1e-14,10**(frequency[i]/10))/Math.max(energy,1e-14);entropySum-=p*Math.log(p);}
 // Voiced speech has a repeating pitch; air noise generally does not.
 let periodicity=0;
 if(rms>.001){for(let lag=Math.floor(sampleRate/350);lag<sampleRate/85;lag+=4){let cross=0,a=0,b=0;for(let i=0;i<wave.length-lag;i+=4){cross+=wave[i]*wave[i+lag];a+=wave[i]*wave[i];b+=wave[i+lag]*wave[i+lag];}periodicity=Math.max(periodicity,cross/Math.max(1e-15,Math.sqrt(a*b)));}}
 return {rms,periodicity,flatness:Math.exp(logEnergy/count)/(energy/count),entropy:entropySum/Math.log(count),lowRatio:low/energy,peakRatio:peak/energy,centroid:weighted/energy};
}
export function isBreath(f,noiseFloor){
 // Require air-like noise above the measured room level, not just any sound.
 const air=f.flatness>.02&&f.entropy>.42&&f.peakRatio<.35;
 const wind=f.lowRatio>.6&&f.entropy>.28&&f.peakRatio<.45;
 return f.rms>Math.max(.0045,noiseFloor*2.5)&&f.periodicity<.55&&(air||wind);
}
