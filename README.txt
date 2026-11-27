BAN DO 15 DIEM BAU CU KHU PHO - PHUONG LAI THIEU

Du lieu goc:
- 15 diem bau cu, so diem 1-15 va GPS theo file nguoi dung cung cap.
- Diem 3: ghi chu goc "ke ben Nha truyen thong thi xa Thuan An".
- boundaries.geojson có 15 polygon phân vùng tham khảo (Voronoi), KHÔNG phải ranh chính thức khu phố/phường.
- Các vùng được tô màu khác nhau, có nhãn tên khu phố trên bản đồ.
- Bấm vào vùng hoặc khu phố trong danh sách để mở chi tiết và làm nổi vùng đang chọn; rê chuột làm sáng vùng.

Tinh nang:
- 15 marker co so diem tren ban do
- 15 vùng phân màu, nhãn cố định, hover làm sáng và click để chọn/highlight khu phố
- Danh sach khu pho, loc va tim kiem
- Popup marker va the chi tiet co Google Maps chi duong
- Nen ban do duong, ve tinh, dia hinh
- Dinh vi vi tri hien tai
- Xuat CSV

Deploy GitHub Pages: upload index.html, style.css, script.js, points.json, boundaries.geojson vao root repository; Settings > Pages > deploy from branch.

RANH GIỚI: boundaries.geojson gồm 15 polygon phân vùng tham khảo (Voronoi) dựa trên 15 tọa độ điểm bầu cử. Mỗi điểm GPS nằm trong polygon cùng tên khi kiểm tra dữ liệu. Polygon không phải ranh hành chính/GIS chính thức, không dùng thay dữ liệu ranh pháp lý.




V5.3: Added gold perimeter outline for Lái Thiêu as a visual reference. The outline is a convex hull derived from the 15 supplied election-point coordinates, NOT the official administrative polygon. The official ward boundary and surrounding wards polygons have not been imported.

V5.8: Removed the old 15-neighborhood polygon overlay and its legend/partition label. The official ward outline layer remains loaded directly over the existing map.
