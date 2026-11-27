BẢN DEMO — BẢN ĐỒ SỐ ĐIỂM BẦU CỬ KHU PHỐ

Cấu trúc:
- index.html: trang chính
- style.css: giao diện
- script.js: bản đồ, ghim, tìm kiếm, thông tin chi tiết, chỉ đường
- data/points.json: dữ liệu 15 điểm demo

LƯU Ý:
Tên khu phố và tọa độ trong points.json là dữ liệu mô phỏng, không phải địa điểm bầu cử thật.

Chạy thử tại máy:
Không mở index.html trực tiếp bằng file:// vì script tải points.json. Dùng VS Code Live Server hoặc chạy Python:
  python -m http.server 8000
Sau đó mở http://localhost:8000

Đưa lên GitHub Pages:
1. Tạo repo mới (ví dụ ban-do-bau-cu-khu-pho).
2. Upload toàn bộ các file và thư mục trong gói này lên repo, giữ nguyên cấu trúc.
3. Settings > Pages > Deploy from a branch > Branch main > Folder / (root) > Save.
4. Chờ GitHub Pages cấp link.
