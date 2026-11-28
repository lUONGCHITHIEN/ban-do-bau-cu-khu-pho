'use strict';

// ======================================================
// 1. DỮ LIỆU 15 KHU PHỐ
// ======================================================
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

// ======================================================
// 2. MÀU ĐIỂM
// ======================================================
const markerColors = [
  '#087f8c','#1680d8','#42a85a','#ff9d20','#8b45b5',
  '#e44b43','#16a6c4','#ff8c00','#ed7900','#a947bd',
  '#1c8e86','#4058b9','#009c88','#925f4c','#1685db'
];

// ======================================================
// 3. BIẾN TOÀN CỤC
// ======================================================
const markers = {};
let selectedId = null;
let userPos = null;
let wardBoundary = null;

// ======================================================
// 4. KHỞI TẠO BẢN ĐỒ
// ======================================================
const leafletMap = L.map('map', {
  zoomControl: true
}).setView([10.9095,106.6995],13);

// ======================================================
// 5. LỚP BẢN ĐỒ
// ======================================================
const baseLayers = {
  street: L.tileLayer(
    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    {
      maxZoom:19,
      attribution:'© OpenStreetMap'
    }
  ),

  sat: L.tileLayer(
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    {
      maxZoom:19,
      attribution:'© Esri'
    }
  ),

  terrain: L.tileLayer(
    'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    {
      maxZoom:17,
      attribution:'© OpenTopoMap'
    }
  )
};

// Mặc định vệ tinh
baseLayers.sat.addTo(leafletMap);

// ======================================================
// 6. TẠO ICON MARKER (ĐÃ BỔ SUNG - LỖI CŨ)
// ======================================================
function markerIcon(p) {
  return L.divIcon({
    className:'',
    html:`
      <div style="
        width:30px;
        height:30px;
        border-radius:50%;
        background:${markerColors[p.id-1]};
        color:#fff;
        border:3px solid white;
        box-shadow:0 2px 7px rgba(0,0,0,.4);
        display:flex;
        justify-content:center;
        align-items:center;
        font-size:14px;
        font-weight:bold;
      ">${p.vote}</div>
    `,
    iconSize:[36,36],
    iconAnchor:[18,18]
  });
}

// ======================================================
// 7. RANH GIỚI OSM
// Giữ màu vàng hiện tại như ảnh
// ======================================================
const boundaryUrl =
  'https://polygons.openstreetmap.fr/get_geojson.py?id=13470501&params=0';

async function loadWardBoundary() {
  try {
    const response = await fetch(boundaryUrl);

    if (!response.ok) {
      throw new Error('HTTP '+response.status);
    }

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

    console.log('Đã tải ranh giới OSM');

  } catch(error) {
    console.error('Lỗi ranh giới:',error);
  }
}

loadWardBoundary();

// ======================================================
// 8. POPUP
// ======================================================
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

      <a target="_blank" rel="noopener"
         href="https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}"
         style="
           display:inline-block;
           background:#1765bd;
           color:white;
           padding:8px 12px;
           border-radius:6px;
           text-decoration:none;
         ">
        📍 Chỉ đường Google Maps
      </a>
    </div>
  `;
}

// ======================================================
// 9. TẠO 15 MARKER
// ======================================================
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

// ======================================================
// 10. TÍNH KHOẢNG CÁCH GPS
// ======================================================
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

// ======================================================
// 11. CLICK KHU PHỐ
// ======================================================
function selectPoint(p,openPopup=true) {
  selectedId=p.id;

  renderList();

  leafletMap.flyTo(
    [p.lat,p.lng],
    16,
    {duration:0.9}
  );

  if(openPopup) {
    setTimeout(()=>{
      if(markers[p.id]) markers[p.id].openPopup();
    },500);
  }
}

// ======================================================
// 12. HIỂN THỊ DANH SÁCH (ĐÃ FIX)
// ======================================================
function renderList() {
  const searchEl=document.getElementById('search');
  const countEl=document.getElementById('count');
  const listEl=document.getElementById('list');

  if(!searchEl||!countEl||!listEl) {
    console.error('HTML thiếu #search, #count hoặc #list');
    return;
  }

  // ÉP VÙNG DANH SÁCH HIỂN THỊ
  listEl.style.display='block';
  listEl.style.visibility='visible';
  listEl.style.opacity='1';
  listEl.style.overflowY='auto';
  listEl.style.flex='1';
  listEl.style.minHeight='0';

  const query=searchEl.value.trim().toLocaleLowerCase('vi');

  const active=
    document.querySelector('.filters button.active')
      ?.dataset.filter||'all';

  let items=points.filter(p =>
    p.name.toLocaleLowerCase('vi').includes(query)
  );

  if(active==='coords') {
    items=items.filter(p =>
      Number.isFinite(p.lat)&&Number.isFinite(p.lng)
    );
  }

  if(active==='near'&&userPos) {
    items.sort((a,b)=>
      distKm(a,userPos)-distKm(b,userPos)
    );
  }

  countEl.textContent=items.length;

  // Không tìm thấy
  if(items.length===0) {
    listEl.innerHTML=`
      <div style="
        padding:20px;
        text-align:center;
        color:#666;
      ">
        Không tìm thấy khu phố
      </div>
    `;
    return;
  }

  // VẼ DANH SÁCH
  listEl.innerHTML=items.map(p=>`
    <div class="place"
         data-id="${p.id}"
         tabindex="0"
         style="
           display:flex;
           align-items:center;
           gap:10px;
           padding:10px;
           margin:0 0 8px;
           background:${selectedId===p.id?'#e6f1ff':'#ffffff'};
           border:1px solid ${selectedId===p.id?'#1765bd':'#d7e1ed'};
           border-radius:10px;
           cursor:pointer;
           box-sizing:border-box;
           width:100%;
         ">

      <div style="
        width:34px;
        height:34px;
        min-width:34px;
        border-radius:50%;
        background:${markerColors[p.id-1]};
        color:white;
        display:flex;
        align-items:center;
        justify-content:center;
        font-weight:bold;
        border:2px solid white;
        box-shadow:0 0 0 1px #ccc;
      ">
        ${p.vote}
      </div>

      <div style="flex:1;min-width:0;">
        <div style="
          font-size:14px;
          font-weight:bold;
          color:#19375d;
          line-height:1.4;
        ">
          ${p.name}
        </div>

        <div style="
          font-size:11px;
          color:#1765bd;
          margin-top:3px;
        ">
          Điểm bầu cử ${p.vote}
        </div>

        <div style="
          font-size:10px;
          color:#7b8796;
          margin-top:3px;
        ">
          ${p.lat.toFixed(6)}, ${p.lng.toFixed(6)}
        </div>
      </div>

      <div style="color:#789;font-size:20px;">›</div>
    </div>
  `).join('');

  // SỰ KIỆN CLICK
  listEl.querySelectorAll('.place').forEach(el=>{
    const go=()=>{
      const id=Number(el.dataset.id);
      const p=points.find(x=>x.id===id);
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

  console.log('Danh sách đã hiển thị:',items.length);
}

// Chạy hiển thị ngay
renderList();

// ======================================================
// 13. TÌM KIẾM
// ======================================================
document.getElementById('search')
  ?.addEventListener('input',renderList);

// ======================================================
// 14. BỘ LỌC
// ======================================================
document.querySelectorAll('.filters button')
  .forEach(btn=>{
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
            alert('Không lấy được vị trí. Hãy cấp quyền GPS.');
          },
          {
            enableHighAccuracy:true,
            timeout:12000
          }
        );
      }

      renderList();
    });
  });

// ======================================================
// 15. CHUYỂN LỚP BẢN ĐỒ
// ======================================================
document.querySelectorAll('#mapControls button')
  .forEach(btn=>{
    btn.addEventListener('click',()=>{
      document.querySelectorAll('#mapControls button')
        .forEach(b=>b.classList.remove('active'));

      btn.classList.add('active');

      Object.values(baseLayers).forEach(layer=>{
        if(leafletMap.hasLayer(layer)) {
          leafletMap.removeLayer(layer);
        }
      });

      const layer=baseLayers[btn.dataset.layer];
      if(layer) layer.addTo(leafletMap);
    });
  });

// ======================================================
// 16. THU GỌN / MỞ DANH SÁCH
// ======================================================
const sidebar=document.getElementById('sidebar');
const toggle=document.getElementById('sidebarToggle');
const openSidebar=document.getElementById('sidebarOpen');

function syncMap() {
  setTimeout(()=>{
    leafletMap.invalidateSize();
  },350);
}

function collapse() {
  sidebar?.classList.add('closed');
  openSidebar?.classList.add('visible');

  if(toggle) {
    toggle.textContent='›';
    toggle.title='Mở danh sách';
    toggle.setAttribute('aria-label','Mở danh sách');
  }

  syncMap();
}

function expand() {
  sidebar?.classList.remove('closed');
  openSidebar?.classList.remove('visible');

  if(toggle) {
    toggle.textContent='‹';
    toggle.title='Thu gọn danh sách';
    toggle.setAttribute('aria-label','Thu gọn danh sách');
  }

  syncMap();
}

toggle?.addEventListener('click',()=>{
  if(sidebar?.classList.contains('closed')) {
    expand();
  } else {
    collapse();
  }
});

openSidebar?.addEventListener('click',expand);

// ======================================================
// 17. RESIZE
// ======================================================
window.addEventListener('resize',()=>{
  leafletMap.invalidateSize();
});

syncMap();

// ======================================================
// 18. KIỂM TRA
// ======================================================
console.log('Bản đồ 15 khu phố đã khởi tạo.');
console.log('Marker:',Object.keys(markers).length);
#sidebar {
  display: flex;
  flex-direction: column;
}

#list {
  display: block !important;
  flex: 1 1 auto !important;
  height: auto !important;
  max-height: none !important;
  min-height: 200px !important;
  overflow-y: auto !important;
  visibility: visible !important;
  opacity: 1 !important;
  padding: 8px !important;
  box-sizing: border-box !important;
}

#list .place {
  display: flex !important;
  visibility: visible !important;
  opacity: 1 !important;
}
