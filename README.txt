BAN DO 15 DIEM BAU CU KHU PHO - PHUONG LAI THIEU

Du lieu goc:
- 15 diem bau cu, so diem 1-15 va GPS theo file nguoi dung cung cap.
- Diem 3: ghi chu goc "ke ben Nha truyen thong thi xa Thuan An".
- Ten truong/ten dia diem cho cac diem con khong co trong file toa do; khong tu dien ten sai.
- boundaries.geojson hiện có 15 polygon phân vùng tham khảo (Voronoi), KHÔNG phải ranh chính thức khu phố/phường.

Tinh nang:
- 15 marker co so diem tren ban do
- Danh sach khu pho, loc va tim kiem
- Popup marker va the chi tiet co Google Maps chi duong
- Nen ban do duong, ve tinh, dia hinh
- Dinh vi vi tri hien tai
- Xuat CSV

Deploy GitHub Pages: upload index.html, style.css, script.js, points.json, boundaries.geojson vao root repository; Settings > Pages > deploy from branch.

RANH GIỚI: boundaries.geojson gồm 15 polygon phân vùng tham khảo (Voronoi) dựa trên 15 tọa độ điểm bầu cử. Mỗi điểm GPS nằm trong polygon cùng tên khi kiểm tra dữ liệu. Polygon không phải ranh hành chính/GIS chính thức, không dùng thay dữ liệu ranh pháp lý.


Ranh giới hành chính phường Lái Thiêu: nút “Ranh phường nguồn” chỉ mở trang https://tphcm.city.com.vn/lai-thieu trong tab mới. Website chưa nhập/chồng polygon ranh chính thức từ trang nguồn. Vì vậy nút nguồn KHÔNG có nghĩa ranh chính thức đã được hiển thị trên bản đồ Leaflet.
