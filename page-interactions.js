'use strict';
const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];

if ($('#step-panel')) {
const stages = [
 {tag:'01 / PHYSICAL MODEL',title:'Begin with transport, not a black box.',text:'A PyBaMM-based Li | electrolyte | Li symmetric-cell model links electrolyte transport to voltage and impedance. Two-sided solid–electrolyte interphase (SEI) growth follows the plating electrode when the current reverses.',formula:'θ = [ t₊, Dₑ, κ ]',facts:['25 / 40 / 60°C','Two-sided SEI','30-minute protocols'],note:'The inferred quantities are the Li⁺ transference number, electrolyte diffusivity, and ionic conductivity. Other model parameters, including initial SEI resistance, are fixed in this study.'},
 {tag:'02 / OBSERVATIONS',title:'Read complementary physical signals.',text:'Each candidate current waveform drives a forward simulation. The input combines a voltage time series with impedance spectra at the initial state and after the protocol. Current history, temperature, duration, and an EIS-derived peak frequency provide context.',formula:'Current → V(t) + Z(ω)',facts:['181 voltage samples','30 EIS frequencies','Early + late impedance'],note:'Synthetic noise: 1 mV voltage standard deviation; 0.5% of |Z| for each real and imaginary impedance component, with a small noise floor. The peak-frequency feature is derived from observed EIS, not the true diffusivity.'},
 {tag:'03 / PROPERTY INFERENCE',title:'Learn the inverse map.',text:'Three TabPFN regressors estimate normalized electrolyte properties from the observation features. Validation errors are averaged equally across waveform–temperature groups, then used to identify which properties remain difficult to infer.',formula:'[ V(t), Z(ω), context ] → θ̂',facts:['One regressor per target','Train-only feature scaling','Normalized target errors'],note:'Material parameter sets are separated between training, validation, and final testing. Diffusivity and conductivity use log-space normalization; the transference number uses linear normalization.'},
 {tag:'04 / INFORMATION-GUIDED SELECTION',title:'Ask the next informative question.',text:'Current validation errors determine property weights. Noise-scaled physical sensitivities estimate how much each candidate adds to the information already collected. Only the highest-ranked candidate is used to fit and validate an updated learner.',formula:'wⱼ = 0.2 / 3 + 0.8 eⱼ / Σe',facts:['Weighted A-optimal proxy','Full parameter-coupling matrix','One candidate fit per round'],note:'Accept only if weighted validation error improves and every target passes a degradation guard. Otherwise keep the previous model and stop. The physical information proxy is not a calibrated TabPFN uncertainty estimate.'},
 {tag:'05 / INDEPENDENT EVALUATION',title:'Keep the final test out of the loop.',text:'The evaluation plan compares the adaptive strategy with the initial model, additional measurements using the original waveform, and 20 repeated random selections. Final testing includes unseen material parameter sets and held-out waveforms.',formula:'Adaptive vs. matched-budget controls',facts:['20 random-selection repeats','Held-out waveform test','Material-level paired bootstrap'],note:'The full comparison is pending for this revision. All candidate simulation costs remain, and sensitivity calculations add cost; fewer learner fits do not establish a reduction in total computation.'}
];
function setStep(index, focus = false) {
 const n = Math.max(0,Math.min(stages.length-1,index)); const s=stages[n];
 $$('[data-step]').forEach((b,i)=>{b.setAttribute('aria-selected',String(i===n));b.tabIndex=i===n?0:-1;if(i===n&&focus)b.focus();});
 const panel=$('#step-panel'); panel.setAttribute('aria-labelledby',`step-tab-${n}`);
 panel.innerHTML=`<p class="eyebrow">${s.tag}</p><h3>${s.title}</h3><p>${s.text}</p><div class="stage-equation">${s.formula}</div><div class="stage-facts">${s.facts.map(f=>`<span>${f}</span>`).join('')}</div><p class="small-note">${s.note}</p>`;
}
$$('[data-step]').forEach(b=>{b.addEventListener('click',()=>setStep(Number(b.dataset.step)));b.addEventListener('keydown',e=>{let i=Number(b.dataset.step);if(['ArrowDown','ArrowRight','ArrowUp','ArrowLeft','Home','End'].includes(e.key)){e.preventDefault();if(e.key==='Home')i=0;else if(e.key==='End')i=4;else i=(i+(['ArrowDown','ArrowRight'].includes(e.key)?1:4))%5;setStep(i,true);}});});
setStep(0);
const familyInfo={
 bipolar_pulse:{title:'Bipolar pulses',text:'Positive and negative pulses with rest periods vary the excitation timescale and polarity. Six candidates change amplitude and cycle count.'},
 asymmetric:{title:'Asymmetric excitation',text:'Unequal positive and negative pulse durations are paired with compensating amplitudes. Four candidates include a polarity-reversed profile.'},
 sine:{title:'Sinusoidal excitation',text:'Three sinusoidal candidates vary amplitude and cycle count over 25 minutes, followed by five minutes of rest.'},
 chirp:{title:'Frequency-swept excitation',text:'A windowed chirp sweeps through frequencies during 25 minutes of excitation. A correction balances the net signed charge before the final rest.'},
 random_pulse:{title:'Random multilevel pulses',text:'Reproducible multilevel sequences use a shuffled, sign-reversed second half to balance charge. Four profiles change amplitude and segment count.'}
};
let activeFamily='bipolar_pulse';
function drawWaveform(){
 const p=window.PROTOCOLS.find(p=>p.name===$('#protocol-select').value); if(!p)return;
 const x=t=>48+(t/30)*714, y=v=>128-(v/60)*103;
 $('#wave-path').setAttribute('d',p.points.map(([t,v],i)=>`${i?'L':'M'}${x(t).toFixed(2)},${y(v).toFixed(2)}`).join(' '));
 $('#waveform-name').textContent=p.name;
 $('#wave-title').textContent=`${familyInfo[p.family].title}: ${p.name}`;
 $('#wave-desc').textContent=`Applied current density over 30 minutes. Peak absolute current density ${p.peak} amperes per square metre. The waveform is extracted from my research notebook.`;
}
function setFamily(family){
 activeFamily=family;
 $$('[data-family]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.family===family)));
 const info=familyInfo[family]; $('#family-title').textContent=info.title;$('#family-description').textContent=info.text;
 $('#protocol-select').innerHTML=window.PROTOCOLS.filter(p=>p.family===family).map((p,i)=>`<option value="${p.name}">${i+1}. ${p.peak} A m⁻² · ${p.name.replace('cand_','')}</option>`).join('');drawWaveform();
}
$('#wave-grid').innerHTML=[-60,-30,0,30,60].map(v=>{const y=128-(v/60)*103;return `<line x1="48" x2="762" y1="${y}" y2="${y}" stroke="${v===0?'#59737d':'#29434f'}" ${v!==0?'stroke-dasharray="3 5"':''}/><text x="36" y="${y+4}" text-anchor="end" fill="#a4bdc7" font-size="12" font-family="Arial">${v}</text>`;}).join('')+[0,10,20,30].map(t=>`<line x1="${48+t/30*714}" x2="${48+t/30*714}" y1="25" y2="231" stroke="#29434f" stroke-dasharray="3 5"/>`).join('');
$$('[data-family]').forEach(b=>b.addEventListener('click',()=>setFamily(b.dataset.family)));
$('#protocol-select').addEventListener('change',drawWaveform);setFamily(activeFamily);

}
function updateWeights(){const keys=['tp','de','ka'], errors=keys.map(k=>Number($(`#err-${k}`).value)/1000),sum=errors.reduce((a,b)=>a+b,0);keys.forEach((k,i)=>{const w=.2/3+.8*(sum>0?errors[i]/sum:1/3);$(`#val-${k}`).textContent=errors[i].toFixed(3);$(`#weight-${k}`).textContent=(w*100).toFixed(1)+'%';$(`#bar-${k}`).style.width=(w*100)+'%';$(`#err-${k}`).setAttribute('aria-valuetext',errors[i].toFixed(3)+' normalized MSE');});}
const endpoints={'4':{label:'4-hour run',c:[41.46,31.02],h:[4.33,17.02]},'10':{label:'10-hour run',c:[42.56,19.27],h:[5.79,18.14]},'21':{label:'77,000-second run (approximately 21.4 hours)',c:[42.44,6.73],h:[4.49,34.40]}};
function renderEndpoints(run){const d=endpoints[run];$$('[data-run]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.run===run)));$('#endpoint-results').innerHTML=`<div class="endpoint-chart" aria-label="${d.label}">${[['Gas-phase C₂+ FE',d.c,'carbon'],['H₂ FE',d.h,'hydrogen']].map(([name,values,cls])=>`<div class="${cls}"><h4>${name}</h4>${values.map((v,i)=>`<div class="endpoint-row"><span>${i?'Final':'Initial'} <b>${v.toFixed(2)}%</b></span><div class="endpoint-track"><div class="endpoint-fill" style="width:${v/50*100}%"></div></div></div>`).join('')}</div>`).join('')}</div><small>${d.label} · Reported endpoints, not a continuous time trace.</small>`;}

if ($('#endpoint-results')) {$$('[data-run]').forEach(b=>b.addEventListener('click',()=>renderEndpoints(b.dataset.run)));renderEndpoints('4');}
if ($('#err-tp')) {['tp','de','ka'].forEach(k=>$(`#err-${k}`).addEventListener('input',updateWeights));updateWeights();}
