
"use strict";

/* ==========================================
   BẢN ĐỒ SỐ 15 KHU PHỐ - PHƯỜNG LÁI THIÊU
   KHÔNG TẢI RANH GEOJSON CŨ
   KHÔNG HIỂN THỊ Ô THÔNG BÁO TRẮNG
   ========================================== */

/* MÀU MARKER */
const COLORS = [
  "#087f8c", "#1680d8", "#42a85a", "#ff9d20", "#8b45b5",
  "#e44b43", "#16a6c4", "#ff8c00", "#a947bd", "#925f4c",
  "#009c88", "#4058b9", "#1685db", "#925f4c", "#1685db"
];

/* ==========================================
   KHỞI TẠO BẢN ĐỒ
   ========================================== */

const map = L.map("map", {
  zoomControl: true,
  preferCanvas: true
}).setView([10.9095, 106.6995], 13);

/* ==========================================
   CÁC LỚP BẢN ĐỒ
   ========================================== */

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

/* MẶC ĐỊNH VỆ TINH */
baseLayers.sat.addTo(map);

/* ==========================================
   DỮ LIỆU 15 KHU PHỐ
   ========================================== */

const points = [
  {
    id: 1,
    name: "Khu phố Chợ",
    vote: 1,
    lat: 10.903975660397565,
    lng: 106.69815306867224
  },
  {
    id: 2,
    name: "Khu phố Bình Đức",
    vote: 2,
    lat: 10.916429322611153,
    lng: 106.69166063900626
  },
  {
    id: 3,
    name: "Khu phố Bình Đức 1",
    vote: 3,
    lat: 10.90541713585694,
    lng: 106.69839246722789
  },
  {
    id: 4,
    name: "Khu phố Bình Đức 2",
    vote: 4,
    lat: 10.908746104516728,
    lng: 106.69653966724684
  },
  {
    id: 5,
    name: "Khu phố Bình Phước",
    vote: 5,
    lat: 10.91938888888889,
    lng: 106.69522222222221
  },
  {
    id: 6,
    name: "Khu phố Bình Nhâm",
    vote: 6,
    lat: 10.934938506778733,
    lng: 106.69985178855553
  },
  {
    id: 7,
    name: "Khu phố Bình Hòa",
    vote: 7,
    lat: 10.918472457880995,
    lng: 106.71109283788044
  },
  {
    id: 8,
    name: "Khu phố Bình Thuận",
    vote: 8,
    lat: 10.925924886793004,
    lng: 106.68535404001115
  },
  {
    id: 9,
    name: "Khu phố Hòa Long",
    vote: 9,
    lat: 10.889986664256268,
    lng: 106.70111094427688
  },
  {
    id: 10,
    name: "Khu phố Long Thới",
    vote: 10,
    lat: 10.90180742108323,
    lng: 106.6994672171841
  },
  {
    id: 11,
    name: "Khu phố Vĩnh Phú",
    vote: 11,
    lat: 10.885751522270438,
    lng: 106.69662730517221
  },
  {
    id: 12,
    name: "Khu phố Tây",
    vote: 12,
    lat: 10.876407136323156,
    lng: 106.69612008718514
  },
  {
    id: 13,
    name: "Khu phố Đông Tư",
    vote: 13,
    lat: 10.916629066039674,
    lng: 106.70246479407608
  },
  {
    id: 14,
    name: "Khu phố Đông Nhì",
    vote: 14,
    lat: 10.907390927850985,
    lng: 106.7083366614026
  },
  {
    id: 15,
    name: "Khu phố Nguyễn Trãi",
    vote: 15,
    lat: 10.902404320516261,
    lng: 106.70520441165449
  }
];

/* ==========================================
   BIẾN
   ========================================== */

const markers = {};
let selectedId = null;
let userPosition = null;
let currentFilter = "all";

/* ==========================================
   TẠO ICON MARKER
   ========================================== */

function markerIcon(point) {
  const color = COLORS[(point.id - 1) % COLORS.length];

  return L.divIcon({
    html: `
      <div class="marker" style="background:${color}">
        ${point.vote}
      </div>
    `,
    className: "",
    iconSize: [31, 31],
    iconAnchor: [15, 15]
  });
}

/* ==========================================
   POPUP THÔNG TIN
   ========================================== */

function popupHTML(point) {
  const color = COLORS[(point.id - 1) % COLORS.length];

  const googleMapsURL =
    "https://www.google.com/maps/dir/?api=1&destination=" +
    encodeURIComponent(point.lat + "," + point.lng);

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

/* ==========================================
   TẠO 15 MARKER
   ========================================== */

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

/* ==========================================
   TÍNH KHOẢNG CÁCH GPS
   ========================================== */

function distanceKm(a, b) {
  const R = 6371;

  const dLat = (b.lat - a.lat) * Math.PI / 180;
  const dLng = (b.lng - a.lng) * Math.PI / 180;

  const lat1 = a.lat * Math.PI / 180;
  const lat2 = b.lat * Math.PI / 180;

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) *
    Math.cos(lat2) *
    Math.sin(dLng / 2) ** 2;

  return 2 * R * Math.atan2(
    Math.sqrt(h),
    Math.sqrt(1 - h)
  );
}

/* ==========================================
   HIỂN THỊ DANH SÁCH
   ========================================== */

function renderList() {
  const searchInput = document.getElementById("search");

  const searchValue = searchInput
    ? searchInput.value.trim().toLowerCase()
    : "";

  let result = points.filter(point =>
    point.name.toLowerCase().includes(searchValue)
  );

  /* LỌC CÓ TỌA ĐỘ */
  if (currentFilter === "coords") {
    result = result.filter(point =>
      Number.isFinite(point.lat) &&
      Number.isFinite(point.lng)
    );
  }

  /* SẮP XẾP GẦN TÔI */
  if (currentFilter === "near" && userPosition) {
    result.sort((a, b) =>
      distanceKm(a, userPosition) -
      distanceKm(b, userPosition)
    );
  }

  const countElement = document.getElementById("count");
  const listElement = document.getElementById("list");

  if (countElement) {
    countElement.textContent = result.length;
  }

  if (!listElement) return;

  listElement.innerHTML = result.map(point => {
    const color = COLORS[(point.id - 1) % COLORS.length];

    let subText = "Điểm bản đồ số " + point.vote;

    if (currentFilter === "near" && userPosition) {
      subText =
        distanceKm(point, userPosition).toFixed(2) +
        " km từ vị trí của bạn";
    }

    return `
      <div class="item ${
        selectedId === point.id ? "selected" : ""
      }" data-id="${point.id}">

        <span class="itemDot"
          style="background:${color}"></span>

        <div>
          <div class="itemName">${point.name}</div>
          <div class="itemSub">${subText}</div>
        </div>

      </div>
    `;
  }).join("");

  listElement.querySelectorAll(".item").forEach(element => {
    element.addEventListener("click", function () {
      const id = Number(this.dataset.id);
      const point = points.find(p => p.id === id);

      if (point) {
        selectPoint(point);
      }
    });
  });
}

/* ==========================================
   CHỌN KHU PHỐ
   ========================================== */

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

/* ==========================================
   TÌM KIẾM
   ========================================== */

const searchElement = document.getElementById("search");

if (searchElement) {
  searchElement.addEventListener("input", renderList);
}

/* ==========================================
   LỌC DANH SÁCH
   ========================================== */

document.querySelectorAll(".filters button").forEach(button => {
  button.addEventListener("click", function () {

    document.querySelectorAll(".filters button")
      .forEach(btn => btn.classList.remove("active"));

    this.classList.add("active");

    currentFilter = this.dataset.filter;

    if (currentFilter === "near") {

      if (!navigator.geolocation) {
        alert("Trình duyệt không hỗ trợ GPS.");
        currentFilter = "all";
        renderList();
        return;
      }

      navigator.geolocation.getCurrentPosition(
        function (position) {
          userPosition = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };

          renderList();

          map.flyTo(
            [userPosition.lat, userPosition.lng],
            15
          );
        },

        function () {
          alert("Không lấy được GPS. Hãy cho phép truy cập vị trí.");

          currentFilter = "all";

          document.querySelectorAll(".filters button")
            .forEach(btn => btn.classList.remove("active"));

          document.querySelector('[data-filter="all"]')
            ?.classList.add("active");

          renderList();
        },

        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0
        }
      );

    } else {
      renderList();
    }
  });
});

/* ==========================================
   CHUYỂN BẢN ĐỒ
   ========================================== */

document.querySelectorAll("#mapControls button").forEach(button => {
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

/* ==========================================
   THU GỌN / MỞ SIDEBAR
   ========================================== */

const mainElement = document.getElementById("main");
const toggleButton = document.getElementById("toggleList");

if (mainElement && toggleButton) {
  toggleButton.addEventListener("click", function () {

    const closed = mainElement.classList.toggle("listClosed");

    this.textContent = closed ? "›" : "‹";

    this.title = closed
      ? "Mở danh sách khu phố"
      : "Thu gọn danh sách khu phố";

    setTimeout(() => {
      map.invalidateSize(true);
    }, 300);
  });
}

/* ==========================================
   CẬP NHẬT TỔNG SỐ
   ========================================== */

const totalPointsElement = document.getElementById("totalPoints");

if (totalPointsElement) {
  totalPointsElement.textContent = points.length;
}

/* ==========================================
   KHỞI ĐỘNG
   ========================================== */

renderList();

/* ==========================================
   TỰ ĐỘNG CẬP NHẬT MAP KHI RESIZE
   ========================================== */

window.addEventListener("resize", function () {
  map.invalidateSize(true);
});

/* ==========================================
   QUAN TRỌNG:
   - Không fetch boundary.geojson
   - Không tạo L.geoJSON
   - Không tạo polygon 5 điểm
   - Không hiện boundaryStatus
   ========================================== */
