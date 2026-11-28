
'use strict';

// ================================================
// DATA 15 KHU PHỐ - GIỮ NGUYÊN TỌA ĐỘ
// ================================================
const points = [
  {id:1,name:'Khu phố Tây',vote:1,lat:10.876407136323156,lng:106.69612008718514},
  {id:2,name:'Khu phố Vĩnh Phú',vote:2,lat:10.885751522270438,lng:106.69662730517221},
  {id:3,name:'Khu phố Long Thới',vote:3,lat:10.90180742108323,lng:106.6994672171841},
  {id:4,name:'Khu phố Hòa Long',vote:4,lat:10.889986664256268,lng:106.70111094427688},
  {id:5,name:'Khu phố Nguyễn Trãi',vote:5,lat:10.902404320516261,lng:106.70520441165449},
  {id:6,name:'Khu phố Chợ',vote:6,lat:10.903975660397565,lng:106.69815306867224},
  {id:7,name:'Khu phố Bình Đức 1',vote:7,lat:10.90541713585694,lng:106.69839246722789},
  {id:8,name:'Khu phố Bình Đức 2',vote:8,lat:10.908746104516728,lng:106.69653966724684},
  {id:9,name:'Khu phố Bình Hòa',vote:9,lat:10.918472457880995,lng:106.71109283788044},
  {id:10,name:'Khu phố Đông Nhì',vote:10,lat:10.907390927850985,lng:106.7083366614026},
  {id:11,name:'Khu phố Đông Tư',vote:11,lat:10.916629066039674,lng:106.70246479407608},
  {id:12,name:'Khu phố Bình Thuận',vote:12,lat:10.925924886793004,lng:106.68535404001115},
  {id:13,name:'Khu phố Bình Nhâm',vote:13,lat:10.934938506778733,lng:106.69985178855553},
  {id:14,name:'Khu phố Bình Phước',vote:14,lat:10.91938888888889,lng:106.69522222222221},
  {id:15,name:'Khu phố Bình Đức',vote:15,lat:10.916429322611153,lng:106.69166063900626}
];

// ================================================
// MÀU MARKER
// ================================================
const markerColors = [
  '#087f8c','#1680d8','#42a85a','#ff9d20','#8b45b5',
  '#e44b43','#16a6c4','#ff8c00','#ed7900','#a947bd',
  '#1c8e86','#4058b9','#009c88','#925f4c','#1685db'
];

// ================================================
// BIẾN
// ================================================
const markers = {};
let selectedId = null;
let userPos = null;
let wardBoundary = null;

// ================================================
// KHỞI TẠO MAP
// ================================================
const leafletMap = L.map('map', {
  zoomControl:true
}).setView([10.9095,106.6995],13);

// ================================================
// MAP LAYERS
// ================================================
const baseLayers = {
  sat: L.tileLayer(
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    {maxZoom:19,attribution:'© Esri'}
  ),

  street: L.tileLayer(
    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    {maxZoom:19,attribution:'© OpenStreetMap'}
  ),

  terrain: L.tileLayer(
    'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    {maxZoom:17,attribution:'© OpenTopoMap'}
  )
};

// Mặc định vệ tinh
baseLayers.sat.addTo(leafletMap);

// ================================================
// MARKER ICON
// ================================================
function markerIcon(p) {
  return L.divIcon({
    className:'',
    html:`
      <div class="markerNumber" style="background:${markerColors[p.id-1]}">
        ${p.vote}
      </div>
    `,
    iconSize:[32,32],
    iconAnchor:[16,16]
  });
}

// ================================================
// RANH GIỚI
// GIỮ NGUYÊN NGUỒN RELATION HIỆN TẠI
// ================================================
const boundaryUrl =
  'https://polygons.openstreetmap.fr/get_geojson.py?id=13470501&params=0';

async function loadWardBoundary() {
  try {
    const response = await fetch(boundaryUrl);
    if(!response.ok) throw new Error('HTTP '+response.status);

    const geojson = await response.json();

    wardBoundary = L.geoJSON(geojson,{
      style:{
        color:'#FFD700',
        weight:4,
        opacity:1,
        fillColor:'#FFD700',
        fillOpacity:0.08
      },
      interactive:false
    }).addTo(leafletMap);

    wardBoundary.bringToBack();

    console.log('Đã tải đường ranh giới');
  } catch(err) {
    console.error('Lỗi tải ranh giới:',err);
  }
}

loadWardBoundary();

// ================================================
// POPUP
// ================================================
function popupHTML(p) {
  return `
    <div style="min-width:220px">
      <div style="font-size:16px;font-weight:bold;margin-bottom:8px">
        <span style="color:${markerColors[p.id-1]}">●</span>
        ${p.name}
      </div>

      <div style="margin-bottom:6px">
        <b>Điểm bầu cử số ${p.vote}</b>
      </div>

      <div style="margin-bottom:6px">
        <b>Địa điểm:</b> ${p.name}, phường Lái Thiêu
      </div>

      <div style="font-size:12px;margin-bottom:8px">
        <b>GPS:</b> ${p.lat.toFixed(6)}, ${p.lng.toFixed(6)}
      </div>

      <a class="directions"
         target="_blank"
         rel="noopener"
         href="https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}">
        📍 Chỉ đường Google Maps
      </a>
    </div>
  `;
}

// ================================================
// TẠO 15 MARKER
// ================================================
points.forEach(p => {
  const marker = L.marker([p.lat,p.lng],{
    icon:markerIcon(p),
    zIndexOffset:1000
  }).addTo(leafletMap);

  marker.bindPopup(popupHTML(p));

  marker.on('click',()=>{
    selectPoint(p,false);
  });

  markers[p.id] = marker;
});

// ================================================
// TÍNH DISTANCE
// ================================================
function distKm(a,b) {
  const rad=Math.PI/180;
  const R=6371;

  const dLat=(b.lat-a.lat)*rad;
  const dLng=(b.lng-a.lng)*rad;

  const h=
    Math.sin(dLat/2)**2+
    Math.cos(a.lat*rad)*
    Math.cos(b.lat*rad)*
    Math.sin(dLng/2)**2;

  return 2*R*Math.atan2(Math.sqrt(h),Math.sqrt(1-h));
}

// ================================================
// CHỌN KHU PHỐ
// ================================================
function selectPoint(p,openPopup=true) {
  selectedId=p.id;
  renderList();

  leafletMap.flyTo([p.lat,p.lng],16,{duration:0.8});

  if(openPopup) {
    setTimeout(()=>{
      markers[p.id]?.openPopup();
    },450);
  }
}

// ================================================
// HIỂN THỊ DANH SÁCH
// ================================================
function renderList() {
  const searchEl=document.getElementById('search');
  const countEl=document.getElementById('count');
  const listEl=document.getElementById('list');

  if(!searchEl||!countEl||!listEl) {
    console.error('Không tìm thấy vùng danh sách');
    return;
  }

  const query=searchEl.value.trim().toLocaleLowerCase('vi');
  const filter=document.querySelector('.filters button.active')?.dataset.filter||'all';

  let items=points.filter(p=>
    p.name.toLocaleLowerCase('vi').includes(query)
  );

  if(filter==='coords') {
    items=items.filter(p=>
      Number.isFinite(p.lat)&&Number.isFinite(p.lng)
    );
  }

  if(filter==='near'&&userPos) {
    items.sort((a,b)=>distKm(a,userPos)-distKm(b,userPos));
  }

  countEl.textContent=items.length;

  if(!items.length) {
    listEl.innerHTML='<div style="padding:20px;text-align:center">Không tìm thấy khu phố</div>';
    return;
  }

  listEl.innerHTML=items.map(p=>`
    <div class="place ${selectedId===p.id?'selected':''}"
         data-id="${p.id}"
         tabindex="0">

      <div class="placeNumber" style="background:${markerColors[p.id-1]}">
        ${p.vote}
      </div>

      <div class="placeText">
        <div class="placeName">${p.name}</div>
        <div class="placeVote">Điểm bầu cử số ${p.vote}</div>
        <div class="placeGPS">${p.lat.toFixed(6)}, ${p.lng.toFixed(6)}</div>
      </div>

      <div class="placeArrow">›</div>
    </div>
  `).join('');

  listEl.querySelectorAll('.place').forEach(el=>{
    const go=()=>{
      const p=points.find(x=>x.id===Number(el.dataset.id));
      if(p) selectPoint(p,true);
    };

    el.addEventListener('click',go);

    el.addEventListener('keydown',e=>{
      if(e.key==='Enter'||e.key===' ') {
        e.preventDefault();
        go();
      }
    });
  });
}

// Render danh sách lần đầu
renderList();

// ================================================
// SEARCH
// ================================================
document.getElementById('search').addEventListener('input',renderList);

// ================================================
// FILTER
// ================================================
document.querySelectorAll('.filters button').forEach(btn=>{
  btn.addEventListener('click',()=>{
    document.querySelectorAll('.filters button')
      .forEach(b=>b.classList.remove('active'));

    btn.classList.add('active');

    if(btn.dataset.filter==='near') {
      if(!navigator.geolocation) {
        alert('Trình duyệt không hỗ trợ GPS');
        return;
      }

      navigator.geolocation.getCurrentPosition(
        pos=>{
          userPos={
            lat:pos.coords.latitude,
            lng:pos.coords.longitude
          };
          renderList();
        },
        ()=>{
          alert('Không lấy được vị trí GPS');
        },
        {enableHighAccuracy:true,timeout:12000}
      );
    }

    renderList();
  });
});

// ================================================
// CHUYỂN LỚP MAP
// ================================================
document.querySelectorAll('#mapControls button').forEach(btn=>{
  btn.addEventListener('click',()=>{
    document.querySelectorAll('#mapControls button')
      .forEach(b=>b.classList.remove('active'));

    btn.classList.add('active');

    Object.values(baseLayers).forEach(layer=>{
      if(leafletMap.hasLayer(layer)) {
        leafletMap.removeLayer(layer);
      }
    });

    baseLayers[btn.dataset.layer]?.addTo(leafletMap);
  });
});

// ================================================
// THU GỌN SIDEBAR
// ================================================
const sidebar=document.getElementById('sidebar');
const toggle=document.getElementById('sidebarToggle');
const openSidebar=document.getElementById('sidebarOpen');

function syncMap() {
  setTimeout(()=>leafletMap.invalidateSize(),300);
}

function collapseSidebar() {
  sidebar.classList.add('closed');
  openSidebar.classList.add('visible');

  toggle.textContent='›';
  toggle.title='Mở danh sách';

  syncMap();
}

function expandSidebar() {
  sidebar.classList.remove('closed');
  openSidebar.classList.remove('visible');

  toggle.textContent='‹';
  toggle.title='Thu gọn danh sách';

  syncMap();
}

toggle.addEventListener('click',()=>{
  sidebar.classList.contains('closed')
    ?expandSidebar()
    :collapseSidebar();
});

openSidebar.addEventListener('click',expandSidebar);

// ================================================
// RESIZE
// ================================================
window.addEventListener('resize',()=>{
  leafletMap.invalidateSize();
});

syncMap();
