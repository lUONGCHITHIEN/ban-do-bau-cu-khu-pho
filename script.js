'use strict';

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

const markerColors = [
  '#087f8c','#1680d8','#42a85a','#ff9d20','#8b45b5',
  '#e44b43','#16a6c4','#ff8c00','#ed7900','#a947bd',
  '#1c8e86','#4058b9','#009c88','#925f4c','#1685db'
];

// KHỞI TẠO BẢN ĐỒ
const leafletMap = L.map('map', {
  zoomControl: true
}).setView([10.9095,106.6995],13);

// CÁC LỚP BẢN ĐỒ
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

// MẶC ĐỊNH HIỂN THỊ VỆ TINH
baseLayers.sat.addTo(leafletMap);

// Không sử dụng polygon giả.
// Chỉ thêm ranh giới khi có dữ liệu GeoJSON chính xác.

const markers = {};
let selectedId = null;
let userPos = null;

// TẠO ICON MARKER
function markerIcon(p) {
  return L.divIcon({
    html: `<div class="markerNum" style="background:${markerColors[p.id-1]}">${p.vote}</div>`,
    className: '',
    iconSize: [30,30],
    iconAnchor: [15,15]
  });
}

// NỘI DUNG POPUP
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
          <b>Địa điểm:</b> ${p.name}, phường Lái Thiêu
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

// TẠO 15 MARKER
points.forEach(p => {
  const m = L.marker([p.lat,p.lng], {
    icon: markerIcon(p)
  }).addTo(leafletMap);

  m.bindPopup(popupHTML(p));

  m.on('click', () => selectPoint(p));

  markers[p.id] = m;
});

// TÍNH KHOẢNG CÁCH
function distKm(a,b) {
  const rad = Math.PI / 180;
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

// CHỌN KHU PHỐ
function selectPoint(p) {
  selectedId = p.id;
  renderList();

  leafletMap.flyTo(
    [p.lat,p.lng],
    16,
    {duration:0.9}
  );

  setTimeout(() => {
    markers[p.id]?.openPopup();
  },500);
}

// HIỂN THỊ DANH SÁCH
function renderList() {
  const query = document.getElementById('search')
    .value.trim().toLocaleLowerCase('vi');

  const active =
    document.querySelector('.filters button.active')
      ?.dataset.filter || 'all';

  let items = points.filter(p =>
    p.name.toLocaleLowerCase('vi').includes(query)
  );

  if (active === 'coords') {
    items = items.filter(p =>
      Number.isFinite(p.lat) && Number.isFinite(p.lng)
    );
  }

  if (active === 'near' && userPos) {
    items.sort((a,b) =>
      distKm(a,userPos)-distKm(b,userPos)
    );
  }

  document.getElementById('count').textContent = items.length;

  document.getElementById('list').innerHTML =
    items.map(p => `
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

  document.querySelectorAll('.place').forEach(el => {
    const go = () => {
      const p = points.find(
        x => x.id === Number(el.dataset.id)
      );

      if (p) selectPoint(p);
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

// RENDER BAN ĐẦU
renderList();

// TÌM KIẾM
document.getElementById('search')
  .addEventListener('input',renderList);

// BỘ LỌC
document.querySelectorAll('.filters button')
  .forEach(btn => {
    btn.addEventListener('click',() => {

      document.querySelectorAll('.filters button')
        .forEach(b => b.classList.remove('active'));

      btn.classList.add('active');

      if (btn.dataset.filter === 'near') {

        if (!navigator.geolocation) {
          alert('Trình duyệt không hỗ trợ GPS');
          return;
        }

        navigator.geolocation.getCurrentPosition(
          pos => {
            userPos = {
              lat: pos.coords.latitude,
              lng: pos.coords.longitude
            };
            renderList();
          },

          () => {
            alert('Không lấy được vị trí. Hãy cấp quyền GPS và thử lại.');
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

// CHUYỂN LỚP BẢN ĐỒ
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

// THU GỌN / MỞ DANH SÁCH
const sidebar = document.getElementById('sidebar');
const toggle = document.getElementById('sidebarToggle');
const openSidebar = document.getElementById('sidebarOpen');

function syncMap() {
  setTimeout(() => {
    leafletMap.invalidateSize({animate:true});
  },280);
}

function collapse() {
  sidebar.classList.add('closed');
  openSidebar.classList.add('visible');

  toggle.setAttribute('aria-label','Mở danh sách');
  toggle.title = 'Mở danh sách';
  toggle.textContent = '›';

  syncMap();
}

function expand() {
  sidebar.classList.remove('closed');
  openSidebar.classList.remove('visible');

  toggle.setAttribute('aria-label','Thu gọn danh sách');
  toggle.title = 'Thu gọn danh sách';
  toggle.textContent = '‹';

  syncMap();
}

toggle.addEventListener('click',() => {
  if (sidebar.classList.contains('closed')) {
    expand();
  } else {
    collapse();
  }
});

openSidebar.addEventListener('click',expand);

// ĐIỀU CHỈNH KHI ĐỔI KÍCH THƯỚC
window.addEventListener('resize',() => {
  leafletMap.invalidateSize();
});

syncMap();
