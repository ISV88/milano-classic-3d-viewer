const viewer=document.querySelector('#viewer');
const modelSource=viewer.getAttribute('src');
const stage=document.querySelector('#stage');
const status=document.querySelector('#status');
const loading=document.querySelector('#loading');
const errorPanel=document.querySelector('#error');
const rotate=document.querySelector('#rotate');
const viewButtons=[...document.querySelectorAll('[data-view]')];
const presets={front:'0deg 90deg 105%',back:'180deg 90deg 105%',side:'-90deg 90deg 105%',top:'0deg 0deg 75%',bottom:'0deg 180deg 75%'};
let ready=false;
let toastTimer;
const interactive=[...viewButtons,...['zoom-in','zoom-out','reset','rotate'].map(id=>document.getElementById(id))];
interactive.forEach(button=>button.disabled=true);
function autoRotate(on){viewer.autoRotate=on;rotate.setAttribute('aria-pressed',String(on));}
function clearViews(){viewButtons.forEach(button=>button.setAttribute('aria-pressed','false'));}
function camera(orbit){viewer.setAttribute('camera-orbit',orbit);requestAnimationFrame(()=>viewer.jumpCameraToGoal());}
function reset(){autoRotate(false);viewer.cameraTarget='auto auto auto';camera('25deg 75deg 105%');viewer.fieldOfView='30deg';clearViews();}
viewer.addEventListener('load',()=>{ready=true;status.textContent='3D-модель готова';viewer.setAttribute('aria-busy','false');loading.hidden=true;errorPanel.hidden=true;interactive.forEach(button=>button.disabled=false);camera('25deg 75deg 105%');});
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
document.getElementById('share').addEventListener('click',async()=>{const url=location.origin+location.pathname;try{await navigator.clipboard.writeText(url);notify('Ссылка скопирована. Отправьте её коллегам.');}catch{const input=document.getElementById('share-url');input.value=url;document.getElementById('share-dialog').showModal();input.select();}});
document.getElementById('retry').addEventListener('click',()=>{errorPanel.hidden=true;loading.hidden=false;viewer.setAttribute('aria-busy','true');status.textContent='Загрузка модели…';const url=new URL(modelSource,location.href);url.searchParams.set('retry',Date.now());viewer.src=url.href;});
setTimeout(()=>{if(!customElements.get('model-viewer')){loading.hidden=true;errorPanel.hidden=false;status.textContent='Просмотр 3D недоступен';}},20000);
