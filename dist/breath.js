// Local spectral analysis only: no audio is recorded or sent to a server.
export function breathFeatures(wave,frequency,sampleRate){
 let square=0;for(const value of wave)square+=value*value;
 const rms=Math.sqrt(square/wave.length),binHz=sampleRate/(frequency.length*2);
 let energy=0,logEnergy=0,weighted=0,low=0,peak=0,count=0,entropySum=0;
 const start=Math.max(1,Math.ceil(20/binHz)),end=Math.min(frequency.length,Math.floor(6500/binHz));
 for(let i=start;i<end;i++){const power=Math.max(1e-14,10**(frequency[i]/10));energy+=power;logEnergy+=Math.log(power);weighted+=power*i*binHz;if(i*binHz<650)low+=power;peak=Math.max(peak,power);count++;}
 for(let i=start;i<end;i++){const p=Math.max(1e-14,10**(frequency[i]/10))/Math.max(energy,1e-14);entropySum-=p*Math.log(p);}
 return {rms,flatness:Math.exp(logEnergy/count)/(energy/count),entropy:entropySum/Math.log(count),lowRatio:low/energy,peakRatio:peak/energy,centroid:weighted/energy};
}
export function isBreath(f,noiseFloor){
 // Microphone gain and wind spectra vary widely; accept breath and voiced “hoo”.
 const textured=f.entropy>.20&&f.peakRatio<.82;
 const wind=f.lowRatio>.45&&f.entropy>.12&&f.peakRatio<.9;
 return f.rms>Math.max(.0018,noiseFloor*1.7)&&(textured||wind);
}
