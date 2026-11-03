const viewer=document.querySelector('#viewer');
let modelSource=viewer.getAttribute('src');
let currentModel='classic';
let defaultOrbit='25deg 75deg 105%';
const stage=document.querySelector('#stage');
const status=document.querySelector('#status');
const loading=document.querySelector('#loading');
const errorPanel=document.querySelector('#error');
const rotate=document.querySelector('#rotate');
const viewButtons=[...document.querySelectorAll('[data-view]')];
const presets={front:'0deg 90deg 105%',back:'180deg 90deg 105%',side:'-90deg 90deg 105%',top:'0deg 0deg 75%',bottom:'0deg 180deg 75%',detail:'0deg 90deg 26%'};
let ready=false;
let toastTimer;
const interactive=[...viewButtons,...['zoom-in','zoom-out','reset','rotate'].map(id=>document.getElementById(id))];
interactive.forEach(button=>button.disabled=true);
function autoRotate(on){viewer.autoRotate=on;rotate.setAttribute('aria-pressed',String(on));}
function clearViews(){viewButtons.forEach(button=>button.setAttribute('aria-pressed','false'));}
function camera(orbit){viewer.setAttribute('camera-orbit',orbit);requestAnimationFrame(()=>viewer.jumpCameraToGoal());}
function reset(){autoRotate(false);viewer.cameraTarget='auto auto auto';camera(defaultOrbit);viewer.fieldOfView='30deg';clearViews();}
viewer.addEventListener('load',()=>{ready=true;status.textContent='3D-модель готова';viewer.setAttribute('aria-busy','false');loading.hidden=true;errorPanel.hidden=true;interactive.forEach(button=>button.disabled=false);camera(defaultOrbit);});
viewer.addEventListener('progress',event=>{document.getElementById('progress').textContent=`Загрузка модели · ${Math.round(event.detail.totalProgress*100)}%`;});
viewer.addEventListener('error',()=>{ready=false;loading.hidden=true;errorPanel.hidden=false;status.textContent='Ошибка загрузки';viewer.setAttribute('aria-busy','false');interactive.forEach(button=>button.disabled=true);});
viewButtons.forEach(button=>button.addEventListener('click',()=>{if(!ready)return;autoRotate(false);camera(presets[button.dataset.view]);clearViews();button.setAttribute('aria-pressed','true');}));
viewer.addEventListener('camera-change',event=>{if(event.detail.source==='user-interaction')clearViews();});
rotate.addEventListener('click',()=>{autoRotate(!viewer.autoRotate);clearViews();});
document.getElementById('reset').addEventListener('click',reset);
function zoom(factor){if(!ready)return;const orbit=viewer.getCameraOrbit();camera(`${orbit.theta}rad ${orbit.phi}rad ${orbit.radius*factor}m`);}
document.getElementById('zoom-in').addEventListener('click',()=>zoom(.82));
document.getElementById('zoom-out').addEventListener('click',()=>zoom(1.22));
document.getElementById('background').addEventListener('click',event=>{const light=stage.classList.toggle('light');event.currentTarget.setAttribute('aria-label',light?'Включить тёмный фон':'Включить светлый фон');});
document.getElementById('fullscreen').addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else if(stage.requestFullscreen)await stage.requestFullscreen();else notify('Полноэкранный режим недоступен в этом браузере');}catch{notify('Полноэкранный режим недоступен в этом браузере');}});
document.addEventListener('fullscreenchange',()=>{document.getElementById('fullscreen').setAttribute('aria-label',document.fullscreenElement?'Выйти из полноэкранного режима':'На весь экран');});
function notify(message){const toast=document.getElementById('toast');toast.textContent=message;toast.hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.hidden=true,3200);}
document.getElementById('share').addEventListener('click',async()=>{const url=location.origin+location.pathname+'#'+currentModel;try{await navigator.clipboard.writeText(url);notify('Ссылка скопирована. Отправьте её коллегам.');}catch{const input=document.getElementById('share-url');input.value=url;document.getElementById('share-dialog').showModal();input.select();}});
document.getElementById('retry').addEventListener('click',()=>{errorPanel.hidden=true;loading.hidden=false;viewer.setAttribute('aria-busy','true');status.textContent='Загрузка модели…';const url=new URL(modelSource,location.href);url.searchParams.set('retry',Date.now());viewer.src=url.href;});
setTimeout(()=>{if(!customElements.get('model-viewer')){loading.hidden=true;errorPanel.hidden=false;status.textContent='Просмотр 3D недоступен';}},20000);

const models={
 classic:{name:'Classic',version:'v9',src:'classic.glb?v=9',poster:'poster.png?v=9',file:'milano-classic-v9.glb',source:'Оформление по предоставленному макету MILANO Classic.',dimensions:'Рабочий габарит QS: 50 × 86 × 21 мм. Размер Classic уточняется.'},
 'urban-mirage':{name:'Urban Mirage',version:'v2',src:'urban-mirage.glb?v=2',poster:'urban-mirage-poster.png?v=2',file:'milano-urban-mirage-v2.glb',source:'Оформление по макету Urban Mirage. Пробная модель с исправленными углами.',dimensions:'Рабочий габарит QS: 50 × 86 × 21 мм. Размер и отделка требуют сверки.'},
 cabinet:{name:'Шкаф с пачками',version:'v1',src:'cabinet-stock.glb?v=1',poster:'cabinet-poster.jpg?v=1',file:'milano-cabinet-stock.glb',source:'10 полок × 10 рядов × 11 пачек в глубину. Геометрическая раскладка — 1100 пачек.',dimensions:'Габарит: 700 × 350 × 1930 мм. Внутренние размеры и вместимость — реконструкция.'}
};
function selectModel(key){
 if(!models[key])key='classic';
 const m=models[key],cabinet=key==='cabinet';currentModel=key;
 defaultOrbit=cabinet?'25deg 78deg 105%':'25deg 75deg 105%';
 ready=false;autoRotate(false);clearViews();interactive.forEach(b=>b.disabled=true);
 loading.hidden=false;errorPanel.hidden=true;status.textContent='Загрузка модели…';viewer.setAttribute('aria-busy','true');
 document.getElementById('model-version').textContent=m.name+' · '+m.version;
 document.getElementById('model-source').textContent=m.source;
 document.getElementById('model-dimensions').textContent=m.dimensions;
 document.title='MILANO — '+m.name+' · 3D';
 document.querySelectorAll('[data-model]').forEach(a=>{if(a.dataset.model===key)a.setAttribute('aria-current','true');else a.removeAttribute('aria-current');});
 const download=document.getElementById('download-model');download.href='./assets/'+m.src;download.download=m.file;
 viewer.alt='3D-модель MILANO '+m.name;viewer.poster='./assets/'+m.poster;
 viewer.setAttribute('min-camera-orbit',cabinet?'auto 0deg 8%':'auto 0deg 45%');
 if(cabinet)viewer.removeAttribute('disable-pan');else viewer.setAttribute('disable-pan','');
 viewButtons.forEach(b=>b.hidden=b.dataset.view===(cabinet?'bottom':'detail'));
 const sameLoaded=viewer.loaded && viewer.getAttribute('src')==='./assets/'+m.src;
 reset();modelSource='./assets/'+m.src;viewer.src=modelSource;
 // Selecting the already loaded model does not emit a second load event.
 if(sameLoaded){ready=true;loading.hidden=true;interactive.forEach(b=>b.disabled=false);status.textContent='3D-модель готова';viewer.setAttribute('aria-busy','false');}
}
window.addEventListener('hashchange',()=>selectModel(location.hash.slice(1)));
selectModel(location.hash.slice(1)||'classic');
