
const COLORS = [
  "#087f8c","#1680d8","#42a85a","#ff9d20","#8b45b5",
  "#e44b43","#16a6c4","#ff8c00","#a947bd","#925f4c",
  "#009c88","#4058b9","#1685db","#925f4c","#1685db"
];

const map = L.map("map", {
  zoomControl: true
}).setView([10.9095, 106.6995], 13);

/* BẢN ĐỒ NỀN */
const layers = {
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

layers.sat.addTo(map);

/* BIẾN */
let points = [];
let markers = {};
let boundaryLayer = null;
let selectedId = null;
let userPos = null;
let activeFilter = "all";

/* TẢI RANH GIỚI GEOJSON */
async function loadBoundary() {
  const status = document.getElementById("boundaryStatus");

  try {
    const response = await fetch("./lai-thieu.geojson");

    if (!response.ok) {
      throw new Error("Không tìm thấy lai-thieu.geojson");
    }

    const geoData = await response.json();
    let features = geoData.features || [];

    // Tìm feature có tên Lái Thiêu trong thuộc tính
    const wardFeatures = features.filter(feature => {
      const props = feature.properties || {};
      const values = Object.values(props).join(" ").toLowerCase();
      return values.includes("lái thiêu") || values.includes("lai thieu");
    });

    // Nếu file chỉ có duy nhất 1 polygon thì sử dụng polygon đó
    if (wardFeatures.length === 0 && features.length === 1) {
      features = [features[0]];
    } else if (wardFeatures.length > 0) {
      features = wardFeatures;
    } else {
      throw new Error("Không nhận diện được polygon phường Lái Thiêu trong file");
    }

    boundaryLayer = L.geoJSON({
      type: "FeatureCollection",
      features: features
    }, {
      style: {
        color: "#FFD700",
        weight: 4,
        opacity: 1,
        fillColor: "#FFD700",
        fillOpacity: 0
      },
      interactive: false
    }).addTo(map);

    const bounds = boundaryLayer.getBounds();

    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [25, 25] });
    }

    status.textContent = "✓ Đã tải lớp ranh giới";
    console.log("Đã tải GeoJSON ranh phường", features);

  } catch (error) {
    console.error("Lỗi ranh giới:", error);
    status.textContent = "⚠ Không tải được ranh giới GeoJSON";
  }
}

/* TẠO MARKER */
function makeMarkerIcon(point) {
  return L.divIcon({
    html: `<div class="marker" style="background:${COLORS[(point.id-1)%COLORS.length]}">${point.vote}</div>`,
    className: "",
    iconSize: [31, 31],
    iconAnchor: [15, 15]
  });
}

/* POPUP */
function createPopup(point) {
  const directions =
    `https://www.google.com/maps/dir/?api=1&destination=${point.lat},${point.lng}`;

  return `
    <div>
      <div class="popupHead">
        <span style="color:${COLORS[(point.id-1)%COLORS.length]}">●</span>
        ${point.name}
      </div>

      <div class="popupBody">
        <div class="popupLine">
          <b>Điểm số ${point.vote}</b>
        </div>

        <div class="popupLine">
          <b>Khu phố:</b> ${point.name}
        </div>

        <div class="popupLine">
          <b>Tọa độ:</b><br>
          ${point.lat.toFixed(6)}, ${point.lng.toFixed(6)}
        </div>

        <a class="routeButton"
           href="${directions}"
           target="_blank"
           rel="noopener">
           📍 Mở chỉ đường Google Maps
        </a>
      </div>
    </div>
  `;
}

/* NẠP 15 ĐIỂM */
function loadMarkers() {
  points.forEach(point => {
    const marker = L.marker(
      [point.lat, point.lng],
      { icon: makeMarkerIcon(point) }
    ).addTo(map);

    marker.bindPopup(createPopup(point));

    marker.on("click", () => {
      selectedId = point.id;
      renderList();
    });

    markers[point.id] = marker;
  });
}

/* CHỌN ĐIỂM */
function selectPoint(point, zoom = true) {
  selectedId = point.id;
  renderList();

  if (zoom) {
    map.flyTo([point.lat, point.lng], 16, { duration: 1 });

    setTimeout(() => {
      markers[point.id].openPopup();
    }, 800);
  } else {
    markers[point.id].openPopup();
  }
}

/* TÍNH KHOẢNG CÁCH */
function distanceKm(a, b) {
  const R = 6371;
  const dLat = (a.lat-b.lat) * Math.PI/180;
  const dLng = (a.lng-b.lng) * Math.PI/180;

  const x =
    Math.sin(dLat/2)**2 +
    Math.cos(a.lat*Math.PI/180) *
    Math.cos(b.lat*Math.PI/180) *
    Math.sin(dLng/2)**2;

  return 2*R*Math.atan2(Math.sqrt(x),Math.sqrt(1-x));
}

/* RENDER SIDEBAR */
function renderList() {
  const keyword = document.getElementById("search")
    .value.trim().toLowerCase();

  let result = points.filter(point =>
    point.name.toLowerCase().includes(keyword)
  );

  if (activeFilter === "coords") {
    result = result.filter(point =>
      Number.isFinite(point.lat) &&
      Number.isFinite(point.lng)
    );
  }

  if (activeFilter === "near" && userPos) {
    result.sort((a,b) =>
      distanceKm(a,userPos)-distanceKm(b,userPos)
    );
  }

  document.getElementById("count").textContent = result.length;

  document.getElementById("list").innerHTML = result.map(point => `
    <div class="item ${selectedId===point.id?"selected":""}"
         data-id="${point.id}">
      <span class="itemDot"
            style="background:${COLORS[(point.id-1)%COLORS.length]}"></span>
      <div>
        <div class="itemName">${point.name}</div>
        <div class="itemSub">Điểm bầu cử số ${point.vote}</div>
      </div>
    </div>
  `).join("");

  document.querySelectorAll(".item").forEach(element => {
    element.onclick = () => {
      const point = points.find(p => p.id === Number(element.dataset.id));
      if (point) selectPoint(point);
    };
  });
}

/* SEARCH */
document.getElementById("search")
  .addEventListener("input", renderList);

/* FILTER BUTTONS */
document.querySelectorAll(".filters button").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".filters button")
      .forEach(b => b.classList.remove("active"));

    button.classList.add("active");
    activeFilter = button.dataset.filter;

    if (activeFilter === "near") {
      if (!navigator.geolocation) {
        alert("Trình duyệt không hỗ trợ GPS");
        return;
      }

      navigator.geolocation.getCurrentPosition(position => {
        userPos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        renderList();
      }, () => {
        alert("Không lấy được vị trí GPS");
      });
    } else {
      renderList();
    }
  });
});

/* ĐỔI BẢN ĐỒ */
document.querySelectorAll("#mapControls button").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll("#mapControls button")
      .forEach(b => b.classList.remove("active"));

    button.classList.add("active");

    Object.values(layers).forEach(layer => {
      if (map.hasLayer(layer)) map.removeLayer(layer);
    });

    layers[button.dataset.layer].addTo(map);
  });
});

/* THU GỌN DANH SÁCH */
const main = document.getElementById("main");
const toggle = document.getElementById("toggleList");

toggle.addEventListener("click", () => {
  const closed = main.classList.toggle("listClosed");

  toggle.textContent = closed ? "›" : "‹";
  toggle.title = closed ? "Mở danh sách" : "Thu gọn danh sách";

  setTimeout(() => map.invalidateSize(), 300);
});

/* KHỞI ĐỘNG */
async function init() {
  try {
    const response = await fetch("./points.json");

    if (!response.ok) {
      throw new Error("Không tải được points.json");
    }

    points = await response.json();

    document.getElementById("totalPoints").textContent = points.length;

    loadMarkers();
    renderList();
    await loadBoundary();

  } catch (error) {
    console.error(error);
    document.getElementById("boundaryStatus").textContent =
      "⚠ Lỗi tải dữ liệu. Kiểm tra points.json";
  }
}

init();

window.addEventListener("resize", () => map.invalidateSize());
