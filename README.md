# Hướng Dẫn Sử Dụng

## Cài Đặt

1. **Tải Node.js**: Trước tiên, bạn cần cài đặt Node.js từ trang [nodejs.org](https://nodejs.org/).

2. **Cài Đặt Package**:
    ```bash
    npm install
    ```

3. **Chuẩn Bị Dữ Liệu**:
    - Tạo file `rawdata.txt` và dán các `queryid` vào file này (mỗi dòng là một `queryid`).
    - Nếu bạn dùng proxy, tạo thêm file `proxies.txt` và gắn proxy theo dạng:
      ```txt
      http://user:pass@ip:port
      ```

4. **Chạy Chương Trình**:
    ```bash
    node + tên file
    ```

## Chức Năng

- **Auto Claim**: Tự động nhận thưởng.
- **Auto Update Level**: Tự động nâng cấp level.

## Cấu Hình

- Mở file `config.json` và chỉnh sửa:
    ```json
    {
      "autoUpgrade": true
    }
    ```
    - Nếu để `true`, chương trình sẽ tự động nâng cấp level cho đến khi hết tiền.
    - Nếu để `false`, chương trình sẽ không thực hiện nâng cấp.

## Liên Kết

- **Kênh Chia Sẻ Code**: [Airdropcrytor](https://t.me/Airdropcrytor)

## Liên Hệ

Nếu có bất kỳ câu hỏi nào, vui lòng liên hệ qua kênh chia sẻ code ở trên.
