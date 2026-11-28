// ===============================
// RANH GIOI PHUONG LAI THIEU
// NGUON GEOJSON: tinhthanhpho.com
// ===============================

let boundaryLayer = null;

async function loadLaiThieuBoundary() {
  try {
    const url = "https://tinhthanhpho.com/data/wards-79.geojson";

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Không tải được dữ liệu ranh giới");
    }

    const geojson = await response.json();

    // Tìm feature Lái Thiêu trong dữ liệu
    const features = geojson.features.filter(feature => {
      const props = feature.properties || {};

      const text = Object.values(props)
        .filter(value => typeof value === "string")
        .join(" ")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

      return text.includes("lai thieu");
    });

    if (!features.length) {
      console.error("Không tìm thấy ranh phường Lái Thiêu trong GeoJSON");
      return;
    }

    // Xóa ranh cũ nếu đã có
    if (boundaryLayer) {
      map.removeLayer(boundaryLayer);
    }

    // Vẽ ranh mới
    boundaryLayer = L.geoJSON(
      {
        type: "FeatureCollection",
        features: features
      },
      {
        interactive: false
      }
    ).addTo(map);

    console.log("Đã tải ranh giới Lái Thiêu:", features);

  } catch (error) {
    console.error("Lỗi tải ranh giới Lái Thiêu:", error);
  }
}

// Tải ranh giới
loadLaiThieuBoundary();
