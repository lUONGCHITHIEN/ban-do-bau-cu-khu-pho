(async function(){
 const response=await fetch('./data/points.json');
 const points=await response.json();
 const map=L.map('map',{zoomControl:true}).setView([10.905,106.706],13);
 L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; OpenStreetMap contributors'}).addTo(map);
 const markers=new Map(); let selected=null;
 const list=document.getElementById('place-list'), search=document.getElementById('search'), count=document.getElementById('count'), detail=document.getElementById('detail-panel');
 const markerIcon=(id,active=false)=>L.divIcon({className:'custom-pin',html:`<div style="width:30px;height:30px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:${active?'#0f4dc4':'#2563eb'};border:2px solid white;box-shadow:0 2px 7px #26354b55;display:grid;place-items:center"><span style="transform:rotate(45deg);color:#fff;font-size:11px;font-weight:800">${id}</span></div>`,iconSize:[30,30],iconAnchor:[15,30]});
 function selectPoint(p){selected=p; renderList(search.value); detail.innerHTML=`<div class="detail-card"><div class="detail-number">● ĐIỂM MÔ PHỎNG ${String(p.id).padStart(2,'0')}</div><h2>${p.name}</h2><p class="sub">Thông tin điểm bầu cử minh họa</p><div class="detail-field"><div class="field-label">Tên điểm</div><div class="field-value">${p.venue}</div></div><div class="detail-field"><div class="field-label">Địa chỉ / khu vực</div><div class="field-value">${p.address}</div></div><div class="detail-field"><div class="field-label">Ghi chú</div><div class="field-value">${p.note}</div></div><a class="directions" target="_blank" rel="noopener" href="https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}">Mở chỉ đường Google Maps ↗</a></div>`;
 markers.forEach((m,id)=>m.setIcon(markerIcon(id,id===p.id))); map.flyTo([p.lat,p.lng],15,{duration:.45});
 }
 function renderList(filter=''){const f=filter.trim().toLocaleLowerCase('vi');const shown=points.filter(p=>p.name.toLocaleLowerCase('vi').includes(f)||p.address.toLocaleLowerCase('vi').includes(f));list.innerHTML='';count.textContent=`${shown.length} địa điểm mô phỏng`;shown.forEach(p=>{const li=document.createElement('li');li.className='place-item'+(selected?.id===p.id?' active':'');li.innerHTML=`<div class="pin-number">${p.id}</div><div class="place-text"><div class="place-name">${p.name}</div><div class="place-address">${p.address}</div></div>`;li.onclick=()=>selectPoint(p);list.appendChild(li);});}
 points.forEach(p=>{const m=L.marker([p.lat,p.lng],{icon:markerIcon(p.id)}).addTo(map);m.bindTooltip(p.name);m.on('click',()=>selectPoint(p));markers.set(p.id,m);});
 search.addEventListener('input',()=>renderList(search.value));renderList();
 const bounds=L.latLngBounds(points.map(p=>[p.lat,p.lng]));map.fitBounds(bounds.pad(.15));
})();
