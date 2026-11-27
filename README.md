# 🛡️ ScamShield

Ứng dụng Flutter (Android + iOS) phát hiện tin giả và lừa đảo, chuyển từ bản demo HTML.

| Tính năng | Android | iOS |
|---|---|---|
| Dán/chia sẻ nội dung để kiểm tra, chấm điểm + giải thích | ✅ | ✅ |
| **Chạy ngầm**, tự kiểm tra thông báo Zalo/SMS/Messenger…; tin lừa đảo → báo động có âm thanh, tin thường → bỏ qua, chỉ ghi điểm vào Nhật ký | ✅ | ❌ (Apple không cho) |
| Đăng ký / đăng nhập | ✅ | ✅ |
| Tick chọn ứng dụng được giám sát (riêng từng tài khoản) | ✅ | ❌ |
| AI phân tích sâu (tùy chọn, qua máy chủ riêng) | ✅ | ✅ |

## Cài đặt

```bash
git clone <repo-của-bạn> && cd scamshield
./setup.sh          # tạo android/ ios/ bằng flutter create rồi chép phần Kotlin vào
flutter run         # hoặc: flutter build apk --release
```

`setup.sh` cần Flutter ≥ 3.27. GitHub Actions (`.github/workflows/build.yml`) làm đúng các bước này và xuất file APK.

## Cấu trúc

- `assets/rules.json`: **một nguồn duy nhất** cho quy tắc, dùng chung cho Dart (kiểm tra thủ công) và Kotlin (chạy ngầm). Sửa trọng số/mẫu ở đây.
- `lib/core/scam_engine.dart` ↔ `android_overlay/.../ScamEngine.kt` ↔ `tools/check_rules.py`: ba bản cùng một thuật toán. `python3 tools/check_rules.py` kiểm tra quy tắc mà không cần Flutter.
- `android_overlay/`: Manifest, `ScamListenerService` (nghe thông báo), `Alerter` (báo động), `MainActivity` (cầu nối Flutter).
- `server/server.js`: máy chủ AI tùy chọn (giữ khóa API Anthropic ở máy chủ).

## "AI thông minh hơn" nghĩa là gì ở bản này

Bộ phân tích v2 vẫn là quy tắc, nhưng hiểu ngữ cảnh hơn bản HTML:
- **Tổ hợp nguy hiểm** (ví dụ mạo danh ngân hàng + đe dọa khóa + link giả) được cộng thêm điểm.
- **Trừ điểm** tin giống chính thống: OTP đã cấp không kèm link, lời nhắc "không chia sẻ mã", bài cảnh báo lừa đảo, giảm báo nhầm.
- **Tên miền nhái** (`shoppee.vn`, `vietcombank-xacthuc.top`), từ khóa đăng nhập/xác minh trong tên miền, danh sách tên miền chính thức (`shope.ee`…).
- Sửa lỗi bản gốc: đếm chữ hoa sai với tiếng Việt có dấu.
- **Lớp LLM** (tùy chọn): bật ở Cài đặt, nhập địa chỉ máy chủ của bạn; chỉ gửi khi bạn bấm nút ở tab Kiểm tra.

Chạy máy chủ AI: `ANTHROPIC_API_KEY=... SHARED_SECRET=... node server/server.js`, rồi deploy sau HTTPS. App hiện chưa gửi header `x-shared-secret`; nếu đặt `SHARED_SECRET` cần thêm header đó trong `ai_service.dart`, hoặc để máy chủ ở mạng riêng.

## Giới hạn cần biết

1. **iOS không giám sát nền được.** Apple không cho app đọc thông báo của app khác. Cách khả thi trên iOS: Message Filter Extension (lọc SMS từ số lạ, cần target riêng trong Xcode) hoặc Share Extension. Bản này chỉ có kiểm tra thủ công trên iOS.
2. **Android cần người dùng tự cấp quyền** "Truy cập thông báo" (không thể tự bật). Từ Android 13, app cài ngoài Play Store phải vào *Cài đặt → Ứng dụng → ScamShield → ⋮ → Cho phép cài đặt bị hạn chế* trước. Máy Xiaomi/Oppo/Vivo/Huawei cần thêm tắt tối ưu pin và bật tự khởi động, nếu không hệ thống có thể dừng dịch vụ.
3. **Đưa lên Google Play:** quyền đọc thông báo bị kiểm duyệt gắt, cần khai báo mục đích và chính sách quyền riêng tư.
4. **Tài khoản hiện lưu trên máy** (mật khẩu băm PBKDF2). Chưa đồng bộ giữa các máy, chưa có quên mật khẩu. Muốn đăng nhập thật qua mạng: viết lớp mới implement `AuthService` (Firebase Auth hoặc máy chủ riêng), không cần sửa giao diện.
5. **Quyền riêng tư:** phân tích chạy ngầm hoàn toàn trên máy. Nội dung chỉ được lưu khi tin đáng ngờ (160 ký tự đầu); tin thường chỉ lưu điểm.
6. Không thể đảm bảo bắt hết lừa đảo. Hãy luôn xác minh qua kênh chính thức.
