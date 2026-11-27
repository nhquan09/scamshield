#!/usr/bin/env bash
# Tạo thư mục android/ và ios/ bằng Flutter, rồi chép phần Kotlin + Manifest của ScamShield vào.
# Chạy một lần sau khi clone:  ./setup.sh
set -euo pipefail
cd "$(dirname "$0")"
command -v flutter >/dev/null || { echo "Chưa cài Flutter: https://docs.flutter.dev/get-started/install"; exit 1; }

# flutter create có thể ghi đè lib/ và pubspec.yaml, nên cất đi rồi trả lại.
mkdir -p .setup_bak && cp pubspec.yaml .setup_bak/ && rm -rf .setup_bak/lib && cp -r lib .setup_bak/lib
flutter create --org vn.scamshield --project-name scamshield --platforms=android,ios .
rm -rf lib && cp -r .setup_bak/lib lib && cp .setup_bak/pubspec.yaml pubspec.yaml && rm -rf .setup_bak
rm -f test/widget_test.dart

# Phần Android tùy biến: Manifest, dịch vụ nghe thông báo, cầu nối Flutter.
cp android_overlay/app/src/main/AndroidManifest.xml android/app/src/main/AndroidManifest.xml
# Mẫu của Flutter tạo MainActivity.kt mặc định; xóa đi để dùng bản của ScamShield.
find android/app/src/main -name MainActivity.kt -not -path "*/scamshield/scamshield/*" -delete 2>/dev/null || true
mkdir -p android/app/src/main/kotlin/vn/scamshield/scamshield
cp android_overlay/app/src/main/kotlin/vn/scamshield/scamshield/*.kt android/app/src/main/kotlin/vn/scamshield/scamshield/

flutter pub get
echo "Xong. Chạy thử: flutter run   |   Build APK: flutter build apk --release"
