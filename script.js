// Bản đồ điểm bầu cử khu phố - Lái Thiêu
const neighborhoods = ['Khu phố Chợ','Khu phố Bình Đức','Khu phố Bình Đức 1','Khu phố Bình Đức 2','Khu phố Bình Phước','Khu phố Bình Nhâm','Khu phố Bình Hòa','Khu phố Bình Thuận','Khu phố Hòa Long','Khu phố Long Thới','Khu phố Vĩnh Phú','Khu phố Tây','Khu phố Đông Tư','Khu phố Đông Nhì','Khu phố Nguyễn Trãi'];
let points=[], boundaryLayer=null, markerLayer=L.layerGroup(), selectedId=null, activeFilter='all', userLocation=null;
const map=L.map('map',{zoomControl:false}).setView([10.906,106.702],14);
const street=L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'© OpenStreetMap contributors'}).addTo(map);
const satellite=L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',{attribution:'Tiles © Esri'});
const terrain=L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',{attribution:'© OpenTopoMap'});
L.control.zoom({position:'topleft'}).addTo(map); markerLayer.addTo(map);
const listEl=document.getElementById('pointList'), detail=document.getElementById('detailCard');
function escapeHtml(s=''){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function coords(p){return Number.isFinite(Number(p.lat))&&Number.isFinite(Number(p.lng))&&p.lat!==''&&p.lng!=='';}
function renderList(query=''){
 listEl.innerHTML=''; const q=query.trim().toLocaleLowerCase('vi');
 let visible=neighborhoods.map(n=>({n,p:points.find(x=>x.neighborhood===n||x.khuPho===n||x.ward===n)}));
 if(activeFilter==='near' && userLocation) visible=visible.filter(x=>x.p&&coords(x.p));
 visible.forEach(({n,p})=>{const name=p?.name||p?.title||n, place=p?.place||p?.address||'Chưa cập nhật địa điểm cụ thể'; if(q&&!`${n} ${name} ${place}`.toLocaleLowerCase('vi').includes(q))return;
 const el=document.createElement('div'); el.className='point-item'+(selectedId===p?.id?' selected':''); el.innerHTML=`<div class="point-icon">🗳</div><div class="point-text"><strong>${escapeHtml(name)}</strong><small>📍 ${escapeHtml(place)}</small></div><div class="arrow">›</div>`;
 el.onclick=()=>p?showDetail(p):showNeighborhood(n); listEl.appendChild(el);
 });
 if(!listEl.children.length)listEl.innerHTML='<div class="empty-list">Không tìm thấy mục phù hợp.</div>';
}
function closeDetail(){detail.classList.remove('open');}
function showNeighborhood(n){detail.innerHTML=`<button class="close" id="closeDetail">×</button><h3>${escapeHtml(n)}</h3><p class="muted">Chưa có dữ liệu điểm bầu cử của khu phố này.</p><div class="detail-row">Khi có địa điểm và tọa độ chính thức, dữ liệu sẽ hiển thị tại đây.</div>`;detail.classList.add('open');document.getElementById('closeDetail').onclick=closeDetail;}
function showDetail(p){selectedId=p.id;renderList(document.getElementById('search').value);const lat=Number(p.lat),lng=Number(p.lng),hasCoords=coords(p);
 detail.innerHTML=`<button class="close" id="closeDetail">×</button><h3>Thông tin điểm bầu cử</h3><p><b>${escapeHtml(p.name||p.neighborhood||p.khuPho||'Điểm bầu cử')}</b></p><p>📍 ${escapeHtml(p.place||p.address||'Chưa cập nhật địa điểm')}</p><div class="detail-row"><b>Khu phố:</b> ${escapeHtml(p.neighborhood||p.khuPho||p.ward||'Chưa có dữ liệu')}</div><div class="detail-row"><b>Địa chỉ:</b> ${escapeHtml(p.address||'Chưa có dữ liệu')}</div><div class="detail-row"><b>Ghi chú:</b> ${escapeHtml(p.note||'')}</div>${hasCoords?`<button class="directions" id="directions">➤ Chỉ đường Google Maps</button>`:''}`;
 detail.classList.add('open');document.getElementById('closeDetail').onclick=closeDetail;if(hasCoords){map.flyTo([lat,lng],16);document.getElementById('directions').onclick=()=>window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,'_blank');}}
async function fetchFirst(paths){for(const path of paths){try{const r=await fetch(path);if(r.ok)return await r.json();}catch(e){}}return null;}
async function loadData(){
 const pts=await fetchFirst(['points.json','data/points.json']);points=Array.isArray(pts)?pts:[];
 markerLayer.clearLayers();points.forEach((p,i)=>{if(coords(p)){const marker=L.marker([Number(p.lat),Number(p.lng)]).addTo(markerLayer);marker.on('click',()=>showDetail(p));marker.bindTooltip(p.neighborhood||p.khuPho||p.name||`Điểm ${i+1}`);}});
 const geo=await fetchFirst(['boundaries.geojson','data/boundaries.geojson']);if(geo&&Array.isArray(geo.features)&&geo.features.length){if(boundaryLayer)map.removeLayer(boundaryLayer);boundaryLayer=L.geoJSON(geo,{style:()=>({color:'#e62d26',weight:2,fillColor:'#fff4a0',fillOpacity:.25}),onEachFeature:(feature,layer)=>{const n=feature.properties?.name||feature.properties?.ten||feature.properties?.khuPho;if(n)layer.bindTooltip(n);}}).addTo(map);try{map.fitBounds(boundaryLayer.getBounds(),{padding:[20,20]});}catch(e){}}
 document.getElementById('pointCount').textContent=`${points.length} điểm`;renderList();
}
document.getElementById('search').addEventListener('input',e=>renderList(e.target.value));document.getElementById('closeDetail').onclick=closeDetail;
document.querySelectorAll('.tabs button').forEach(b=>b.onclick=()=>{activeFilter=b.dataset.filter;document.querySelectorAll('.tabs button').forEach(x=>x.classList.remove('active'));b.classList.add('active');if(activeFilter==='near'&&!userLocation){if(!navigator.geolocation){alert('Trình duyệt không hỗ trợ định vị.');activeFilter='all';return;}navigator.geolocation.getCurrentPosition(pos=>{userLocation=[pos.coords.latitude,pos.coords.longitude];renderList(document.getElementById('search').value);map.setView(userLocation,15);},()=>{alert('Không lấy được vị trí. Hãy cho phép truy cập vị trí và thử lại.');activeFilter='all';document.querySelector('[data-filter="all"]').classList.add('active');b.classList.remove('active');});}else renderList(document.getElementById('search').value);});
document.getElementById('mapView').onclick=()=>{map.removeLayer(satellite);map.removeLayer(terrain);street.addTo(map);setMapBtn('mapView')};document.getElementById('satView').onclick=()=>{map.removeLayer(street);map.removeLayer(terrain);satellite.addTo(map);setMapBtn('satView')};document.getElementById('terrainView').onclick=()=>{map.removeLayer(street);map.removeLayer(satellite);terrain.addTo(map);setMapBtn('terrainView')};function setMapBtn(id){document.querySelectorAll('.map-controls button').forEach(b=>b.classList.remove('active'));document.getElementById(id).classList.add('active')}
document.getElementById('filterBtn').onclick=()=>{document.getElementById('search').focus();alert('Dùng ô tìm kiếm để lọc theo tên khu phố, địa điểm hoặc địa chỉ.');};
loadData();
