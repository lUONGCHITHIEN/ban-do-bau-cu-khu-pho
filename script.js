
/* =====================================================
   BAN DO SO 15 KHU PHO - LAI THIEU
   File: script.js
===================================================== */

const COLORS = [
  "#087f8c", "#1680d8", "#42a85a", "#ff9d20", "#8b45b5",
  "#e44b43", "#16a6c4", "#ff8c00", "#a947bd", "#925f4c",
  "#009c88", "#4058b9", "#1685db", "#925f4c", "#1685db"
];

/* KHOI TAO MAP */
const map = L.map("map", {
  zoomControl: true
}).setView([10.9095, 106.6995], 13);

/* LAYER BAN DO */
const baseLayers = {
  street: L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
      maxZoom: 19,
      attribution: "© OpenStreetMap"
    }
  ),

  sat: L.tileLayer(
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    {
      maxZoom: 19,
      attribution: "© Esri"
    }
  ),

  terrain: L.tileLayer(
    "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    {
      maxZoom: 17,
      attribution: "© OpenTopoMap"
    }
  )
};

baseLayers.sat.addTo(map);

/* BIEN */
let points = [];
let markers = {};
let boundaryLayer = null;
let selectedId = null;
let userPosition = null;
let currentFilter = "all";

/* =====================================================
   DOC RANH GIOI
   DOC FILE boundary.geojson
   KHONG TU NOI GPS MARKER
===================================================== */

async function loadBoundary() {
  const status = document.getElementById("boundaryStatus");

  try {
    const response = await fetch("./boundary.geojson?v=1");

    if (!response.ok) {
      throw new Error("HTTP " + response.status);
    }

    const geojson = await response.json();

    if (!geojson || !geojson.features ||
        geojson.features.length === 0) {
      throw new Error("GeoJSON không có features");
    }

    /* XOA LAYER RANH CU NEU CO */
    if (boundaryLayer) {
      map.removeLayer(boundaryLayer);
    }

    /* VE TRUC TIEP GEOJSON */
    boundaryLayer = L.geoJSON(geojson, {
      style: function () {
        return {
          color: "#FFD700",
          weight: 4,
          opacity: 1,
          fillColor: "#FFD700",
          fillOpacity: 0,
          lineCap: "round",
          lineJoin: "round"
        };
      },

      interactive: false
    }).addTo(map);

    /* KIEM TRA BOUNDS */
    const bounds = boundaryLayer.getBounds();

    if (!bounds.isValid()) {
      throw new Error("Không xác định được bounds ranh giới");
    }

    /* ZOOM TO RANH */
    map.fitBounds(bounds, {
      padding: [30, 30],
      maxZoom: 15
    });

    status.textContent = "✓ Đã tải ranh giới từ boundary.geojson";

    console.log("GeoJSON boundary loaded:", geojson);

  } catch (error) {
    console.error("Boundary error:", error);

    status.textContent =
      "⚠ Lỗi tải boundary.geojson: " + error.message;
  }
}

/* =====================================================
   MARKER
===================================================== */

function markerIcon(point) {
  const color = COLORS[(point.id - 1) % COLORS.length];

  return L.divIcon({
    html:
      `<div class="marker" style="background:${color}">
        ${point.vote}
      </div>`,
    className: "",
    iconSize: [31, 31],
    iconAnchor: [15, 15]
  });
}

/* =====================================================
   POPUP
===================================================== */

function popupHTML(point) {
  const color = COLORS[(point.id - 1) % COLORS.length];

  const googleMapsURL =
    "https://www.google.com/maps/dir/?api=1&destination=" +
    point.lat + "," + point.lng;

  return `
    <div class="popupHead">
      <span style="color:${color}">●</span>
      ${point.name}
    </div>

    <div class="popupBody">
      <div class="popupLine">
        <b>Điểm bản đồ:</b> ${point.vote}
      </div>

      <div class="popupLine">
        <b>Khu phố:</b> ${point.name}
      </div>

      <div class="popupLine">
        <b>Tọa độ:</b><br>
        ${point.lat.toFixed(6)}, ${point.lng.toFixed(6)}
      </div>

      <a class="routeButton"
         href="${googleMapsURL}"
         target="_blank"
         rel="noopener noreferrer">
         📍 Mở chỉ đường Google Maps
      </a>
    </div>
  `;
}

/* =====================================================
   TAO 15 MARKER
===================================================== */

function loadMarkers() {
  markers = {};

  points.forEach(point => {
    const marker = L.marker(
      [point.lat, point.lng],
      {
        icon: markerIcon(point),
        title: point.name
      }
    ).addTo(map);

    marker.bindPopup(popupHTML(point));

    marker.on("click", function () {
      selectedId = point.id;
      renderList();
    });

    markers[point.id] = marker;
  });
}

/* =====================================================
   CHON KHU PHO
===================================================== */

function selectPoint(point) {
  selectedId = point.id;
  renderList();

  map.flyTo(
    [point.lat, point.lng],
    16,
    { duration: 0.8 }
  );

  setTimeout(() => {
    if (markers[point.id]) {
      markers[point.id].openPopup();
    }
  }, 850);
}

/* =====================================================
   KHOANG CACH GPS
===================================================== */

function distanceKm(a, b) {
  const R = 6371;

  const dLat = (b.lat - a.lat) * Math.PI / 180;
  const dLng = (b.lng - a.lng) * Math.PI / 180;

  const lat1 = a.lat * Math.PI / 180;
  const lat2 = b.lat * Math.PI / 180;

  const h =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);

  return 2 * R * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

/* =====================================================
   SIDEBAR LIST
===================================================== */

function renderList() {
  const searchValue =
    document.getElementById("search").value.trim().toLowerCase();

  let result = points.filter(point =>
    point.name.toLowerCase().includes(searchValue)
  );

  if (currentFilter === "coords") {
    result = result.filter(point =>
      Number.isFinite(point.lat) &&
      Number.isFinite(point.lng)
    );
  }

  if (currentFilter === "near" && userPosition) {
    result.sort((a, b) =>
      distanceKm(a, userPosition) -
      distanceKm(b, userPosition)
    );
  }

  document.getElementById("count").textContent = result.length;

  const list = document.getElementById("list");

  list.innerHTML = result.map(point => {
    const color = COLORS[(point.id - 1) % COLORS.length];

    let subText = "Điểm bản đồ số " + point.vote;

    if (currentFilter === "near" && userPosition) {
      subText =
        distanceKm(point, userPosition).toFixed(2) +
        " km từ vị trí của bạn";
    }

    return `
      <div class="item ${selectedId === point.id ? "selected" : ""}"
           data-id="${point.id}">

        <span class="itemDot" style="background:${color}"></span>

        <div>
          <div class="itemName">${point.name}</div>
          <div class="itemSub">${subText}</div>
        </div>

      </div>
    `;
  }).join("");

  list.querySelectorAll(".item").forEach(element => {
    element.addEventListener("click", function () {
      const id = Number(this.dataset.id);
      const point = points.find(p => p.id === id);

      if (point) {
        selectPoint(point);
      }
    });
  });
}

/* =====================================================
   SEARCH
===================================================== */

document.getElementById("search")
  .addEventListener("input", renderList);

/* =====================================================
   FILTER
===================================================== */

document.querySelectorAll(".filters button").forEach(button => {
  button.addEventListener("click", function () {
    document.querySelectorAll(".filters button")
      .forEach(btn => btn.classList.remove("active"));

    this.classList.add("active");
    currentFilter = this.dataset.filter;

    if (currentFilter === "near") {
      if (!navigator.geolocation) {
        alert("Trình duyệt không hỗ trợ GPS.");
        return;
      }

      navigator.geolocation.getCurrentPosition(
        function (position) {
          userPosition = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };

          renderList();
        },

        function () {
          alert("Không lấy được vị trí. Hãy cho phép truy cập GPS.");
        },

        {
          enableHighAccuracy: true,
          timeout: 15000
        }
      );

    } else {
      renderList();
    }
  });
});

/* =====================================================
   CHUYEN BAN DO
===================================================== */

document.querySelectorAll("#mapControls button")
  .forEach(button => {

    button.addEventListener("click", function () {
      document.querySelectorAll("#mapControls button")
        .forEach(btn => btn.classList.remove("active"));

      this.classList.add("active");

      Object.values(baseLayers).forEach(layer => {
        if (map.hasLayer(layer)) {
          map.removeLayer(layer);
        }
      });

      const layerName = this.dataset.layer;

      if (baseLayers[layerName]) {
        baseLayers[layerName].addTo(map);
      }
    });
  });

/* =====================================================
   SIDEBAR TOGGLE
===================================================== */

const mainElement = document.getElementById("main");
const toggleButton = document.getElementById("toggleList");

toggleButton.addEventListener("click", function () {
  const isClosed = mainElement.classList.toggle("listClosed");

  this.textContent = isClosed ? "›" : "‹";

  this.title = isClosed
    ? "Mở danh sách khu phố"
    : "Thu gọn danh sách khu phố";

  setTimeout(function () {
    map.invalidateSize(true);
  }, 300);
});

/* =====================================================
   LOAD DATA
===================================================== */

async function initMap() {
  const status = document.getElementById("boundaryStatus");

  try {
    const response = await fetch("./points.json?v=1");

    if (!response.ok) {
      throw new Error("Không tải được points.json");
    }

    points = await response.json();

    document.getElementById("totalPoints").textContent = points.length;

    loadMarkers();
    renderList();

    /* DOC RANH TU FILE boundary.geojson */
    await loadBoundary();

  } catch (error) {
    console.error("Map initialization error:", error);
    status.textContent = "⚠ Lỗi tải points.json";
  }
}

/* KHOI DONG */
initMap();

/* FIX RESIZE */
window.addEventListener("resize", function () {
  map.invalidateSize(true);
});
