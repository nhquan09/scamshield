var ssAc=null,ssOsc=null;
function ssScore(r){return Math.min(100,r.reduce(function(a,x){return a+x[0]},0))}
function ssStop(){try{if(ssOsc){ssOsc.stop();ssOsc=null}}catch(e){}}
function ssAlarm(){try{ssAc=ssAc||new(window.AudioContext||window.webkitAudioContext)();ssStop();var o=ssAc.createOscillator(),g=ssAc.createGain();o.type='square';g.gain.value=.15;o.connect(g);g.connect(ssAc.destination);var t=ssAc.currentTime;for(var k=0;k<12;k++)o.frequency.setValueAtTime(k%2?660:960,t+k*.25);o.start();o.stop(t+3);ssOsc=o}catch(e){}}
function ssWarn(u,s,r){
  var o=document.createElement('div');
  o.style.cssText='position:fixed;inset:0;z-index:2147483647;background:rgba(120,0,0,.85);display:flex;align-items:center;justify-content:center;font:16px system-ui,sans-serif;padding:16px';
  var b=document.createElement('div');
  b.style.cssText='background:#fff;color:#222;max-width:480px;width:100%;border-radius:14px;padding:20px;border-top:8px solid #d32f3f';
  var h=document.createElement('h2');h.textContent='🚨 CẢNH BÁO: LINK NGUY HIỂM';h.style.cssText='margin:0 0 8px;color:#d32f3f';
  var p=document.createElement('p');p.textContent='Điểm rủi ro '+s+'/100. '+r.slice(0,3).map(function(x){return x[1]}).join(' ');
  var a=document.createElement('button'),c=document.createElement('button');
  a.textContent='Quay lại an toàn';c.textContent='Vẫn mở (không khuyến nghị)';
  a.style.cssText='background:#2457d6;color:#fff;border:0;border-radius:10px;padding:10px 14px;margin:4px 8px 0 0;cursor:pointer';
  c.style.cssText='background:#eee;color:#444;border:0;border-radius:10px;padding:10px 14px;margin-top:4px;cursor:pointer';
  a.onclick=function(){ssStop();o.remove()};
  c.onclick=function(){ssStop();o.remove();window.open(u,'_blank','noopener')};
  b.append(h,p,a,c);o.append(b);document.documentElement.append(o);
}
document.addEventListener('click',function(e){
  var a=e.target.closest&&e.target.closest('a[href]');
  if(!a||!/^https?:/i.test(a.href))return;
  var r=[];checkUrl(a.href,r);var s=ssScore(r);
  if(s<25)return;
  e.preventDefault();e.stopPropagation();
  ssAlarm();try{navigator.vibrate&&navigator.vibrate([300,150,300])}catch(x){}
  ssWarn(a.href,s,r);
  try{chrome.runtime.sendMessage({t:'alert',s:s})}catch(x){}
},true);
function ssMark(){
  document.querySelectorAll('a[href]:not([data-ss])').forEach(function(a){
    a.setAttribute('data-ss','1');
    if(!/^https?:/i.test(a.href))return;
    var r=[];checkUrl(a.href,r);var s=ssScore(r);
    if(s>=25){a.style.outline='2px solid #d32f3f';a.title='ScamShield: link đáng ngờ ('+s+'/100)'}
  });
}
ssMark();
var ssT=null;
new MutationObserver(function(){clearTimeout(ssT);ssT=setTimeout(ssMark,500)}).observe(document.documentElement,{childList:true,subtree:true});
