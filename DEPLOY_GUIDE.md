# Hướng dẫn triển khai lên Cloud (Render.com)

Để đưa project này lên cloud, tôi đề xuất sử dụng **Render** vì nó hỗ trợ tốt cả Node.js (Backend), Vite (Frontend) và PostgreSQL (Database).

## Các bước chuẩn bị

1. **Đưa code lên GitHub/GitLab**: Bạn cần tạo một repository và push toàn bộ mã nguồn này lên đó.
2. **Tạo tài khoản Render**: Truy cập [render.com](https://render.com) và kết nối với tài khoản GitHub của bạn.

---

## Bước 1: Tạo Database (PostgreSQL)

1. Trên Dashboard Render, chọn **New** -> **PostgreSQL**.
2. Đặt tên (ví dụ: `uni-db`).
3. Sau khi tạo xong, hãy copy giá trị **Internal Database URL** (dùng cho backend trên Render) hoặc **External Database URL** (dùng để truy cập từ máy cá nhân).

---

## Bước 2: Triển khai Backend (Node.js)

1. Chọn **New** -> **Web Service**.
2. Kết nối với repo GitHub của bạn.
3. Cấu hình:
   - **Name**: `uni-backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. Cấu hình **Environment Variables (Envs)**:
   - `DATABASE_URL`: (Dán Internal Database URL từ Bước 1 vào đây)
   - `NODE_ENV`: `production`
5. Sau khi deploy xong, hãy copy URL của backend (ví dụ: `https://uni-backend.onrender.com`).

---

## Bước 3: Triển khai Frontend (Vite)

1. Chọn **New** -> **Static Site**.
2. Kết nối với repo GitHub của bạn.
3. Cấu hình:
   - **Name**: `uni-frontend`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. Cấu hình **Environment Variables**:
   - `VITE_API_URL`: `https://uni-backend.onrender.com/universities` (URL backend của bạn ở Bước 2)

---

## Bước 4: Nhập dữ liệu (Seed Database)

Sau khi Backend đã chạy, bạn có thể chạy script `import.js` để đẩy dữ liệu từ file CSV lên database cloud:

1. Mở terminal tại thư mục gốc của project trên máy bạn (sau khi đã cài đặt `dotenv` bằng `npm install`).
2. Chạy lệnh:
   - Windows (PowerShell): `$env:DATABASE_URL="External_Database_URL_tu_Buoc_1"; node import.js`
   - MacOS/Linux: `DATABASE_URL="External_Database_URL_tu_Buoc_1" node import.js`

---

## Ghi chú quan trọng
- Tôi đã cập nhật `db.js` và `index.js` để tự động nhận biến môi trường `DATABASE_URL` và `PORT`.
- Tôi đã cập nhật `App.jsx` để nhận `VITE_API_URL` từ môi trường.
- Đừng quên chạy `npm install` trong thư mục gốc để cài đặt `dotenv`.
