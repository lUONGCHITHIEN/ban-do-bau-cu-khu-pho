'use strict';

// ========================================
// 15 KHU PHỐ - TỌA ĐỘ
// ========================================
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

// ========================================
// MÀU MARKER
// ========================================
const markerColors = [
  '#087f8c','#1680d8','#42a85a','#ff9d20','#8b45b5',
  '#e44b43','#16a6c4','#ff8c00','#ed7900','#a947bd',
  '#1c8e86','#4058b9','#009c88','#925f4c','#1685db'
];

// ========================================
// BIẾN DÙNG CHUNG
// ========================================
const markers = {};
let selectedId = null;
let userPos = null;
let wardBoundary = null;

// ========================================
// KHỞI TẠO BẢN ĐỒ
// ========================================
const leafletMap = L.map('map', {
  zoomControl: true
}).setView([10.9095,106.6995],13);

// ========================================
// CÁC LỚP BẢN ĐỒ
// ========================================
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

// MẶC ĐỊNH VỆ TINH
baseLayers.sat.addTo(leafletMap);

// ========================================
// ICON MARKER
// ========================================
function markerIcon(p) {
  return L.divIcon({
    html: `
      <div class="markerNum"
           style="background:${markerColors[p.id-1]}">
        ${p.vote}
      </div>
    `,
    className:'',
    iconSize:[30,30],
    iconAnchor:[15,15]
  });
}

// ========================================
// TẢI RANH GIỚI
// Viền đỏ - tô hồng giống ảnh mẫu
// ========================================
const boundaryUrl =
  'https://polygons.openstreetmap.fr/get_geojson.py?id=13470501&params=0';

async function loadWardBoundary() {
  try {
    const response = await fetch(boundaryUrl);

    if (!response.ok) {
      throw new Error('HTTP ' + response.status);
    }

    const geojson = await response.json();

    wardBoundary = L.geoJSON(geojson, {
      style: {
        color:'#d84b50',
        weight:3,
        opacity:1,
        fillColor:'#ef777d',
        fillOpacity:0.22
      },
      interactive:false
    }).addTo(leafletMap);

    // Polygon xuống dưới các marker
    wardBoundary.bringToBack();

    // Chỉ zoom nếu GeoJSON có dữ liệu hợp lệ
    if (wardBoundary.getLayers().length > 0) {
      leafletMap.fitBounds(
        wardBoundary.getBounds(),
        {padding:[35,35]}
      );
    }

    console.log('Đã tải polygon ranh giới',geojson);

  } catch (error) {
    console.error('Lỗi tải ranh giới:',error);
    // Không làm dừng các chức năng marker nếu tải ranh lỗi
  }
}

loadWardBoundary();

// ========================================
// POPUP KHU PHỐ
// ========================================
function popupHTML(p) {
  return `
    <div>
      <div class="popTitle">
        <span style="color:${markerColors[p.id-1]}">●</span>
        ${p.name}
      </div>

      <div class="popContent">
        <div class="popRow">
          <b>Điểm bầu cử số ${p.vote}</b>
        </div>

        <div class="popRow">
          <b>Địa điểm:</b>
          ${p.name}, phường Lái Thiêu
        </div>

        <div class="popRow">
          <b>GPS:</b>
          ${p.lat.toFixed(6)}, ${p.lng.toFixed(6)}
        </div>

        <a class="directions"
           target="_blank"
           rel="noopener"
           href="https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}">
          📍 Chỉ đường Google Maps
        </a>
      </div>
    </div>
  `;
}

// ========================================
// TẠO MARKER 15 KHU PHỐ
// ========================================
points.forEach(p => {
  const marker = L.marker([p.lat,p.lng], {
    icon:markerIcon(p),
    zIndexOffset:1000
  }).addTo(leafletMap);

  marker.bindPopup(popupHTML(p));

  marker.on('click',() => {
    selectPoint(p,false);
  });

  markers[p.id] = marker;
});

// ========================================
// TÍNH KHOẢNG CÁCH
// ========================================
function distKm(a,b) {
  const rad = Math.PI/180;
  const R = 6371;

  const dLat = (b.lat-a.lat)*rad;
  const dLng = (b.lng-a.lng)*rad;

  const h =
    Math.sin(dLat/2)**2 +
    Math.cos(a.lat*rad) *
    Math.cos(b.lat*rad) *
    Math.sin(dLng/2)**2;

  return 2*R*Math.atan2(Math.sqrt(h),Math.sqrt(1-h));
}

// ========================================
// CHỌN KHU PHỐ
// ========================================
function selectPoint(p,openPopup=true) {
  selectedId = p.id;
  renderList();

  leafletMap.flyTo(
    [p.lat,p.lng],
    16,
    {duration:0.9}
  );

  if (openPopup) {
    setTimeout(() => {
      markers[p.id]?.openPopup();
    },500);
  }
}

// ========================================
// HIỂN THỊ DANH SÁCH
// ========================================
function renderList() {
  const searchEl = document.getElementById('search');
  const countEl = document.getElementById('count');
  const listEl = document.getElementById('list');

  if (!searchEl || !countEl || !listEl) return;

  const query = searchEl.value
    .trim()
    .toLocaleLowerCase('vi');

  const active =
    document.querySelector('.filters button.active')
      ?.dataset.filter || 'all';

  let items = points.filter(p =>
    p.name.toLocaleLowerCase('vi').includes(query)
  );

  if (active === 'coords') {
    items = items.filter(p =>
      Number.isFinite(p.lat) &&
      Number.isFinite(p.lng)
    );
  }

  if (active === 'near' && userPos) {
    items.sort((a,b) =>
      distKm(a,userPos)-distKm(b,userPos)
    );
  }

  countEl.textContent = items.length;

  listEl.innerHTML = items.map(p => `
    <div class="place ${selectedId===p.id?'selected':''}"
         data-id="${p.id}"
         tabindex="0">

      <span class="placeDot"
            style="background:${markerColors[p.id-1]}">
      </span>

      <div class="placeText">
        <div class="placeName">${p.name}</div>
        <div class="placeMeta">
          Điểm ${p.vote} ·
          ${p.lat.toFixed(5)}, ${p.lng.toFixed(5)}
        </div>
      </div>

    </div>
  `).join('');

  listEl.querySelectorAll('.place').forEach(el => {
    const go = () => {
      const p = points.find(
        x => x.id === Number(el.dataset.id)
      );
      if (p) selectPoint(p,true);
    };

    el.addEventListener('click',go);

    el.addEventListener('keydown',e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        go();
      }
    });
  });
}

function renderList() {
  const searchEl = document.getElementById('search');
  const countEl = document.getElementById('count');
  const listEl = document.getElementById('list');

  if (!searchEl || !countEl || !listEl) {
    console.error('Thiếu HTML search/count/list');
    return;
  }

  const query = searchEl.value.trim().toLocaleLowerCase('vi');

  const active =
    document.querySelector('.filters button.active')?.dataset.filter || 'all';

  let items = points.filter(p =>
    p.name.toLocaleLowerCase('vi').includes(query)
  );

  if (active === 'coords') {
    items = items.filter(p =>
      Number.isFinite(p.lat) && Number.isFinite(p.lng)
    );
  }

  if (active === 'near' && userPos) {
    items.sort((a, b) => distKm(a, userPos) - distKm(b, userPos));
  }

  countEl.textContent = items.length;

  if (items.length === 0) {
    listEl.innerHTML = `
      <div class="emptyList">
        Không tìm thấy khu phố.
      </div>
    `;
    return;
  }

  listEl.innerHTML = items.map(p => `
    <div class="place ${selectedId === p.id ? 'selected' : ''}"
         data-id="${p.id}"
         tabindex="0">

      <div class="placeDot"
           style="background:${markerColors[p.id - 1]}">
      </div>

      <div class="placeText">
        <div class="placeName">${p.name}</div>
        <div class="placeMeta">
          <span class="pointBadge">Điểm ${p.vote}</span>
          <span class="coordinates">
            ${p.lat.toFixed(5)}, ${p.lng.toFixed(5)}
          </span>
        </div>
      </div>

      <div class="placeArrow">›</div>
    </div>
  `).join('');

  listEl.querySelectorAll('.place').forEach(el => {
    const go = () => {
      const p = points.find(x => x.id === Number(el.dataset.id));
      if (p) selectPoint(p, true);
    };

    el.addEventListener('click', go);

    el.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        go();
      }
    });
  });

  console.log('Đã render danh sách:', items.length);
}
// ========================================
// CHUYỂN LỚP BẢN ĐỒ
// ========================================
document.querySelectorAll('#mapControls button')
  .forEach(btn => {
    btn.addEventListener('click',() => {

      document.querySelectorAll('#mapControls button')
        .forEach(b => b.classList.remove('active'));

      btn.classList.add('active');

      Object.values(baseLayers).forEach(layer => {
        if (leafletMap.hasLayer(layer)) {
          leafletMap.removeLayer(layer);
        }
      });

      baseLayers[btn.dataset.layer]?.addTo(leafletMap);
    });
  });

// ========================================
// THU GỌN / MỞ DANH SÁCH
// ========================================
const sidebar = document.getElementById('sidebar');
const toggle = document.getElementById('sidebarToggle');
const openSidebar = document.getElementById('sidebarOpen');

function syncMap() {
  setTimeout(() => {
    leafletMap.invalidateSize();
  },300);
}

function collapse() {
  sidebar?.classList.add('closed');
  openSidebar?.classList.add('visible');

  if (toggle) {
    toggle.textContent = '›';
    toggle.title = 'Mở danh sách';
    toggle.setAttribute('aria-label','Mở danh sách');
  }

  syncMap();
}

function expand() {
  sidebar?.classList.remove('closed');
  openSidebar?.classList.remove('visible');

  if (toggle) {
    toggle.textContent = '‹';
    toggle.title = 'Thu gọn danh sách';
    toggle.setAttribute('aria-label','Thu gọn danh sách');
  }

  syncMap();
}

if (toggle) {
  toggle.addEventListener('click',() => {
    if (sidebar?.classList.contains('closed')) {
      expand();
    } else {
      collapse();
    }
  });
}

if (openSidebar) {
  openSidebar.addEventListener('click',expand);
}

// ========================================
// CĂN CHỈNH MAP KHI ĐỔI KÍCH THƯỚC
// ========================================
window.addEventListener('resize',() => {
  leafletMap.invalidateSize();
});

syncMap();
/* ===== FIX DANH SÁCH 15 KHU PHỐ ===== */

#sidebar {
  background: #ffffff !important;
}

#list {
  display: block !important;
  flex: 1;
  min-height: 0;
  overflow-y: auto !important;
  overflow-x: hidden;
  padding: 8px !important;
  background: #f5f8fc;
}

#list .place {
  display: flex !important;
  visibility: visible !important;
  opacity: 1 !important;
  width: 100%;
  min-height: 65px;
  align-items: center;
  gap: 10px;
  padding: 10px !important;
  margin: 0 0 7px !important;
  background: #ffffff !important;
  color: #19375d !important;
  border: 1px solid #d5e1ef !important;
  border-radius: 10px !important;
  cursor: pointer;
}

#list .place:hover {
  background: #edf5ff !important;
  border-color: #4387d5 !important;
}

#list .place.selected {
  background: #e6f1ff !important;
  border: 1px solid #1765bd !important;
}

#list .placeDot {
  display: block !important;
  width: 16px !important;
  height: 16px !important;
  min-width: 16px !important;
  border-radius: 50%;
  border: 2px solid white;
  box-shadow: 0 0 0 1px #aab8c9;
}

#list .placeText {
  display: block !important;
  flex: 1;
  min-width: 0;
  color: #19375d !important;
}

#list .placeName {
  display: block !important;
  visibility: visible !important;
  opacity: 1 !important;
  color: #19375d !important;
  font-size: 16px !important;
  font-weight: bold;
}

#list .placeMeta {
  display: flex !important;
  flex-direction: column;
  gap: 3px;
  margin-top: 4px;
  color: #64758b !important;
  font-size: 11px !important;
}

#list .pointBadge {
  color: #1765bd !important;
  font-weight: bold;
}

#list .coordinates {
  color: #78879a !important;
  font-size: 10px;
}

#list .placeArrow {
  display: block !important;
  color: #8ba2bc;
  font-size: 22px;
}

#list .emptyList {
  padding: 20px;
  text-align: center;
  color: #64758b;
}
