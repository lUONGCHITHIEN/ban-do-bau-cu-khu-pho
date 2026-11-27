
"use strict";

const COLORS = [
  "#087f8c", "#1680d8", "#42a85a", "#ff9d20", "#8b45b5",
  "#e44b43", "#16a6c4", "#ff8c00", "#a947bd", "#925f4c",
  "#009c88", "#4058b9", "#1685db", "#925f4c", "#1685db"
];

const map = L.map("map", {
  zoomControl: true,
  preferCanvas: true
}).setView([10.9095, 106.6995], 13);

/* BẢN ĐỒ NỀN */
const baseLayers = {
  street: L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    { maxZoom: 19, attribution: "© OpenStreetMap" }
  ),

  sat: L.tileLayer(
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    { maxZoom: 19, attribution: "© Esri" }
  ),

  terrain: L.tileLayer(
    "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    { maxZoom: 17, attribution: "© OpenTopoMap" }
  )
};

baseLayers.sat.addTo(map);

/* 15 KHU PHỐ */
const points = [
  {id:1,name:"Khu phố Chợ",vote:1,lat:10.903975660397565,lng:106.69815306867224},
  {id:2,name:"Khu phố Bình Đức",vote:2,lat:10.916429322611153,lng:106.69166063900626},
  {id:3,name:"Khu phố Bình Đức 1",vote:3,lat:10.90541713585694,lng:106.69839246722789},
  {id:4,name:"Khu phố Bình Đức 2",vote:4,lat:10.908746104516728,lng:106.69653966724684},
  {id:5,name:"Khu phố Bình Phước",vote:5,lat:10.91938888888889,lng:106.69522222222221},
  {id:6,name:"Khu phố Bình Nhâm",vote:6,lat:10.934938506778733,lng:106.69985178855553},
  {id:7,name:"Khu phố Bình Hòa",vote:7,lat:10.918472457880995,lng:106.71109283788044},
  {id:8,name:"Khu phố Bình Thuận",vote:8,lat:10.925924886793004,lng:106.68535404001115},
  {id:9,name:"Khu phố Hòa Long",vote:9,lat:10.889986664256268,lng:106.70111094427688},
  {id:10,name:"Khu phố Long Thới",vote:10,lat:10.90180742108323,lng:106.6994672171841},
  {id:11,name:"Khu phố Vĩnh Phú",vote:11,lat:10.885751522270438,lng:106.69662730517221},
  {id:12,name:"Khu phố Tây",vote:12,lat:10.876407136323156,lng:106.69612008718514},
  {id:13,name:"Khu phố Đông Tư",vote:13,lat:10.916629066039674,lng:106.70246479407608},
  {id:14,name:"Khu phố Đông Nhì",vote:14,lat:10.907390927850985,lng:106.7083366614026},
  {id:15,name:"Khu phố Nguyễn Trãi",vote:15,lat:10.902404320516261,lng:106.70520441165449}
];

const markers = {};
let selectedId = null;
let userPosition = null;
let currentFilter = "all";

/* ICON SỐ */
function markerIcon(point) {
  const color = COLORS[(point.id - 1) % COLORS.length];

  return L.divIcon({
    html: `<div class="marker" style="background:${color}">${point.vote}</div>`,
    className: "",
    iconSize: [31, 31],
    iconAnchor: [15, 15]
  });
}

/* POPUP */
function popupHTML(point) {
  const color = COLORS[(point.id - 1) % COLORS.length];

  const googleMapsURL =
    "https://www.google.com/maps/dir/?api=1&destination=" +
    encodeURIComponent(`${point.lat},${point.lng}`);

  return `
    <div class="popupHead">
      <span style="color:${color}">●</span>
      ${point.name}
    </div>
    <div class="popupBody">
      <div class="popupLine"><b>Điểm bản đồ:</b> ${point.vote}</div>
      <div class="popupLine"><b>Khu phố:</b> ${point.name}</div>
      <div class="popupLine">
        <b>Tọa độ:</b><br>
        ${point.lat.toFixed(6)}, ${point.lng.toFixed(6)}
      </div>
      <a class="routeButton" href="${googleMapsURL}"
         target="_blank" rel="noopener noreferrer">
         📍 Mở chỉ đường Google Maps
      </a>
    </div>
  `;
}

/* TẠO 15 MARKER */
points.forEach(point => {
  const marker = L.marker([point.lat, point.lng], {
    icon: markerIcon(point),
    title: point.name
  }).addTo(map);

  marker.bindPopup(popupHTML(point));

  marker.on("click", () => {
    selectedId = point.id;
    renderList();
  });

  markers[point.id] = marker;
});

/* KHOẢNG CÁCH GPS */
function distanceKm(a, b) {
  const R = 6371;
  const dLat = (b.lat - a.lat) * Math.PI / 180;
  const dLng = (b.lng - a.lng) * Math.PI / 180;
  const lat1 = a.lat * Math.PI / 180;
  const lat2 = b.lat * Math.PI / 180;

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) *
    Math.sin(dLng / 2) ** 2;

  return 2 * R * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

/* DANH SÁCH */
function renderList() {
  const search = document.getElementById("search").value
    .trim().toLowerCase();

  let result = points.filter(p =>
    p.name.toLowerCase().includes(search)
  );

  if (currentFilter === "coords") {
    result = result.filter(p =>
      Number.isFinite(p.lat) && Number.isFinite(p.lng)
    );
  }

  if (currentFilter === "near" && userPosition) {
    result.sort((a, b) =>
      distanceKm(a, userPosition) - distanceKm(b, userPosition)
    );
  }

  document.getElementById("count").textContent = result.length;

  document.getElementById("list").innerHTML = result.map(p => {
    const color = COLORS[(p.id - 1) % COLORS.length];

    const sub = currentFilter === "near" && userPosition
      ? distanceKm(p, userPosition).toFixed(2) + " km từ bạn"
      : "Điểm bản đồ số " + p.vote;

    return `
      <div class="item ${selectedId === p.id ? "selected" : ""}"
           data-id="${p.id}">
        <span class="itemDot" style="background:${color}"></span>
        <div>
          <div class="itemName">${p.name}</div>
          <div class="itemSub">${sub}</div>
        </div>
      </div>
    `;
  }).join("");

  document.querySelectorAll(".item").forEach(el => {
    el.addEventListener("click", () => {
      const p = points.find(x => x.id === Number(el.dataset.id));
      if (p) selectPoint(p);
    });
  });
}

/* CHỌN KHU PHỐ */
function selectPoint(point) {
  selectedId = point.id;
  renderList();

  map.flyTo([point.lat, point.lng], 16, { duration: 0.8 });

  setTimeout(() => {
    markers[point.id]?.openPopup();
  }, 850);
}

/* TÌM KIẾM */
document.getElementById("search").addEventListener("input", renderList);

/* LỌC */
document.querySelectorAll(".filters button").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".filters button")
      .forEach(b => b.classList.remove("active"));

    button.classList.add("active");
    currentFilter = button.dataset.filter;

    if (currentFilter === "near") {
      navigator.geolocation?.getCurrentPosition(
        pos => {
          userPosition = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          };

          renderList();
          map.flyTo([userPosition.lat, userPosition.lng], 15);
        },
        () => alert("Không lấy được vị trí GPS. Hãy cấp quyền vị trí."),
        { enableHighAccuracy: true, timeout: 15000 }
      );
    } else {
      renderList();
    }
  });
});

/* ĐỔI NỀN */
document.querySelectorAll("#mapControls button").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll("#mapControls button")
      .forEach(b => b.classList.remove("active"));

    button.classList.add("active");

    Object.values(baseLayers).forEach(layer => {
      if (map.hasLayer(layer)) map.removeLayer(layer);
    });

    baseLayers[button.dataset.layer]?.addTo(map);
  });
});

/* ĐÓNG / MỞ DANH SÁCH */
const main = document.getElementById("main");
const toggle = document.getElementById("toggleList");

toggle.addEventListener("click", () => {
  const closed = main.classList.toggle("listClosed");

  toggle.textContent = closed ? "›" : "‹";
  toggle.title = closed ? "Mở danh sách khu phố" : "Thu gọn danh sách";

  setTimeout(() => map.invalidateSize(true), 300);
});

/* HIỂN THỊ 15 KHU PHỐ */
document.getElementById("totalPoints").textContent = points.length;
renderList();

/* KHÔNG TẢI RANH CŨ 5 ĐIỂM
   ĐÃ BỎ THÔNG BÁO TRẮNG
   CHƯA VẼ RANH SAI */

window.addEventListener("resize", () => map.invalidateSize(true));
