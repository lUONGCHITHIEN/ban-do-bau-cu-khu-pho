
// ======================================================
// BAN DO 15 DIEM BAU CU KHU PHO - PHUONG LAI THIEU
// SCRIPT.JS - FULL
// ======================================================

// ===============================
// 1. DANH SACH 15 DIEM
// ===============================
const points = [
  {id:1,name:"Khu phố Tây",vote:1,lat:10.876407136323156,lng:106.69612008718514},
  {id:2,name:"Khu phố Vĩnh Phú",vote:2,lat:10.885751522270438,lng:106.69662730517221},
  {id:3,name:"Khu phố Long Thới",vote:3,lat:10.90180742108323,lng:106.6994672171841},
  {id:4,name:"Khu phố Hòa Long",vote:4,lat:10.889986664256268,lng:106.70111094427688},
  {id:5,name:"Khu phố Nguyễn Trãi",vote:5,lat:10.902404320516261,lng:106.70520441165449},
  {id:6,name:"Khu phố Chợ",vote:6,lat:10.903975660397565,lng:106.69815306867224},
  {id:7,name:"Khu phố Bình Đức 1",vote:7,lat:10.90541713585694,lng:106.69839246722789},
  {id:8,name:"Khu phố Bình Đức 2",vote:8,lat:10.908746104516728,lng:106.69653966724684},
  {id:9,name:"Khu phố Bình Hòa",vote:9,lat:10.918472457880995,lng:106.71109283788044},
  {id:10,name:"Khu phố Đông Nhì",vote:10,lat:10.907390927850985,lng:106.7083366614026},
  {id:11,name:"Khu phố Đông Tư",vote:11,lat:10.916629066039674,lng:106.70246479407608},
  {id:12,name:"Khu phố Bình Thuận",vote:12,lat:10.925924886793004,lng:106.68535404001115},
  {id:13,name:"Khu phố Bình Nhâm",vote:13,lat:10.934938506778733,lng:106.69985178855553},
  {id:14,name:"Khu phố Bình Phước",vote:14,lat:10.91938888888889,lng:106.69522222222221},
  {id:15,name:"Khu phố Bình Đức",vote:15,lat:10.916429322611153,lng:106.69166063900626}
];

// ===============================
// 2. MAU SAC MARKER
// ===============================
const colors = [
  "#087f8c","#1680d8","#42a85a","#ff9d20","#8b45b5",
  "#e44b43","#16a6c4","#ff8c00","#ed7900","#a947bd",
  "#1c8e86","#4058b9","#009c88","#925f4c","#1685db"
];

// ===============================
// 3. KHOI TAO BAN DO
// ===============================
const map = L.map("map", {
  zoomControl: true
}).setView([10.9095,106.6995],13);

// ===============================
// 4. CAC LOP BAN DO
// ===============================
const street = L.tileLayer(
  "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  {
    maxZoom:19,
    attribution:"© OpenStreetMap"
  }
);

const sat = L.tileLayer(
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  {
    maxZoom:19,
    attribution:"© Esri"
  }
);

const terrain = L.tileLayer(
  "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
  {
    maxZoom:17,
    attribution:"© OpenTopoMap"
  }
);

// Mac dinh hien thi ve tinh
sat.addTo(map);

// ===============================
// 5. RANH GIOI PHUONG LAI THIEU
// ===============================
let boundaryLayer = null;

async function loadLaiThieuBoundary() {
  try {
    const url = "https://tinhthanhpho.com/data/wards-79.geojson";

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("HTTP " + response.status);
    }

    const geojson = await response.json();

    if (!geojson || !Array.isArray(geojson.features)) {
      throw new Error("GeoJSON khong hop le");
    }

    // Tim feature Lái Thiêu
    function normalizeText(value) {
      return String(value || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d");
    }

    const features = geojson.features.filter(feature => {
      const props = feature.properties || {};

      const text = Object.values(props)
        .map(value => typeof value === "string" ? value : "")
        .join(" ");

      const normalized = normalizeText(text);

      return normalized.includes("lai thieu");
    });

    if (!features.length) {
      console.error("Khong tim thay feature Lai Thieu trong GeoJSON.");
      console.log("Danh sach properties mau:", geojson.features.slice(0,5).map(f=>f.properties));
      return;
    }

    // Xoa ranh cu
    if (boundaryLayer && map.hasLayer(boundaryLayer)) {
      map.removeLayer(boundaryLayer);
    }

    // Tao layer ranh
    boundaryLayer = L.geoJSON(
      {
        type:"FeatureCollection",
        features:features
      },
      {
        style:function() {
          return {
            color:"#FFD700",
            weight:3,
            opacity:1,
            fillColor:"#FFD700",
            fillOpacity:0
          };
        },
        interactive:false
      }
    );

    // Them layer vao map Leaflet
    boundaryLayer.addTo(map);

    console.log("Da tai ranh Lai Thieu:", features);

  } catch (error) {
    console.error("Loi tai ranh gioi Lai Thieu:", error);
  }
}

// Goi tai ranh
loadLaiThieuBoundary();

// ===============================
// 6. TAO ICON MARKER
// ===============================
function markerIcon(p) {
  return L.divIcon({
    html:`<div class="marker" style="background:${colors[p.id-1]}">${p.vote}</div>`,
    className:"",
    iconSize:[30,30],
    iconAnchor:[15,15]
  });
}

// ===============================
// 7. NOI DUNG POPUP
// ===============================
function popupHTML(p) {
  return `
    <div class="popup">
      <div class="popHead">
        <span style="color:${colors[p.id-1]}">●</span>
        ${p.name}
      </div>
      <div class="popBody">
        <div class="popLine">
          <b>Điểm bầu cử số ${p.vote}</b>
        </div>
        <div class="popLine">
          <b>Địa chỉ:</b> ${p.name}, phường Lái Thiêu
        </div>
        <div class="popLine">
          <b>GPS:</b> ${p.lat.toFixed(6)}, ${p.lng.toFixed(6)}
        </div>
        <a class="routeBtn"
          target="_blank"
          href="https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}">
          📍 Chỉ đường đi tới điểm bầu cử
        </a>
      </div>
    </div>
  `;
}

// ===============================
// 8. TAO MARKER 15 DIEM
// ===============================
const markers = {};

points.forEach(p => {
  const m = L.marker([p.lat,p.lng], {
    icon:markerIcon(p)
  }).addTo(map);

  m.bindPopup(popupHTML(p), {
    autoPan:true
  });

  m.on("click", () => selectPoint(p));

  markers[p.id] = m;
});

// ===============================
// 9. CHON DIEM
// ===============================
let selectedId = null;

function selectPoint(p) {
  selectedId = p.id;
  renderList();

  map.flyTo([p.lat,p.lng],16,{
    duration:1.1
  });

  setTimeout(() => {
    markers[p.id].openPopup();
  },850);
}

// ===============================
// 10. TINH KHOANG CACH
// ===============================
function dist(a,b) {
  const R=6371;
  const dLat=(a.lat-b.lat)*Math.PI/180;
  const dLng=(a.lng-b.lng)*Math.PI/180;

  const s=
    Math.sin(dLat/2)**2+
    Math.cos(a.lat*Math.PI/180)*
    Math.cos(b.lat*Math.PI/180)*
    Math.sin(dLng/2)**2;

  return R*2*Math.atan2(Math.sqrt(s),Math.sqrt(1-s));
}

window.userPos=null;

// ===============================
// 11. RENDER DANH SACH
// ===============================
function renderList() {
  const q=document.getElementById("search").value.trim().toLowerCase();
  const f=document.querySelector(".filters button.active").dataset.filter;

  let arr=points.filter(p=>p.name.toLowerCase().includes(q));

  if(f==="coords") {
    arr=arr.filter(p=>Number.isFinite(p.lat)&&Number.isFinite(p.lng));
  }

  if(f==="near"&&window.userPos) {
    arr.sort((a,b)=>dist(a,window.userPos)-dist(b,window.userPos));
  }

  document.getElementById("count").textContent=arr.length;

  document.getElementById("list").innerHTML=arr.map(p=>`
    <div class="item ${selectedId===p.id?'selected':''}" data-id="${p.id}">
      <span class="dot" style="background:${colors[p.id-1]}"></span>
      <div>
        <div class="itemName">${p.name}</div>
        <div class="itemDesc">
          Điểm bầu cử số ${p.vote} · ${p.name}, phường Lái Thiêu
        </div>
      </div>
    </div>
  `).join("");

  document.querySelectorAll(".item").forEach(el=>{
    el.onclick=()=>{
      const p=points.find(x=>x.id===+el.dataset.id);
      selectPoint(p);
    };
  });
}

// Render lan dau
renderList();

// ===============================
// 12. LOC KHU PHO
// ===============================
document.querySelectorAll(".filters button").forEach(btn=>{
  btn.onclick=()=>{
    document.querySelectorAll(".filters button")
      .forEach(b=>b.classList.remove("active"));

    btn.classList.add("active");

    if(btn.dataset.filter==="near") {
      navigator.geolocation.getCurrentPosition(
        pos=>{
          window.userPos={
            lat:pos.coords.latitude,
            lng:pos.coords.longitude
          };
          renderList();
        },
        ()=>{
          alert("Không lấy được vị trí GPS. Vui lòng cấp quyền vị trí.");
        }
      );
    }

    renderList();
  };
});

// ===============================
// 13. TIM KIEM
// ===============================
document.getElementById("search").oninput=renderList;

// ===============================
// 14. DOI LOP BAN DO
// ===============================
document.querySelectorAll("#mapControls button").forEach(btn=>{
  btn.onclick=()=>{
    document.querySelectorAll("#mapControls button")
      .forEach(b=>b.classList.remove("active"));

    btn.classList.add("active");

    const layer=btn.dataset.layer;

    map.eachLayer(l=>{
      if(l!==boundaryLayer && l instanceof L.TileLayer) {
        map.removeLayer(l);
      }
    });

    ({
      street,
      sat,
      terrain
    })[layer].addTo(map);
  };
});

// ===============================
// 15. THU MO SIDEBAR
// ===============================
const side=document.getElementById("sidebar");
const collapse=document.getElementById("collapseBtn");
const reopen=document.getElementById("reopenBtn");

collapse.onclick=()=>{
  side.classList.add("collapsed");
  collapse.textContent="›";
  reopen.style.display="block";

  setTimeout(()=>{
    map.invalidateSize();
  },280);
};

collapse.onkeydown=e=>{
  if(e.key==="Enter"||e.key===" ") {
    collapse.onclick();
    e.preventDefault();
  }
};

reopen.onclick=()=>{
  side.classList.remove("collapsed");
  collapse.textContent="‹";
  reopen.style.display="none";

  setTimeout(()=>{
    map.invalidateSize();
  },280);
};

// ===============================
// 16. TU DONG CAP NHAT MAP
// ===============================
setTimeout(()=>{
  map.invalidateSize();
},400);

window.addEventListener("resize",function(){
  map.invalidateSize();
});
