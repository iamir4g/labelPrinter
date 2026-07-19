# Label Editor

ادیتور تحت وب لیبل با React + TypeScript + Vite برای طراحی، ذخیره و چاپ لیبل‌های حرارتی.

## اجرای عادی

```bash
npm install
npm run dev
```

## Docker

### اجرای محیط توسعه با Docker Compose

این حالت برای توسعه محلی مناسب است و Vite داخل کانتینر اجرا می‌شود:

```bash
docker compose up app
```

آدرس:

```text
http://localhost:5173
```

### اجرای نسخه production با Docker Compose

این حالت پروژه را build می‌کند و خروجی را با Nginx سرو می‌کند:

```bash
docker compose up --build web
```

آدرس:

```text
http://localhost:8080
```

### ساخت image production

```bash
docker build -t lable-editor .
```

### اجرای image production

```bash
docker run --rm -p 8080:80 lable-editor
```

## فایل‌های Docker

- `Dockerfile`: build چندمرحله‌ای برای ساخت خروجی Vite و سرو با Nginx
- `docker-compose.yml`: شامل سرویس توسعه (`app`) و سرویس production (`web`)
- `docker/nginx/default.conf`: پیکربندی Nginx با fallback برای routeهای React
- `.dockerignore`: حذف فایل‌های غیرضروری از context داکر

## نکات

- سرویس `app` از volume استفاده می‌کند تا تغییرات سورس فوری داخل کانتینر دیده شوند.
- برای React Router، در Nginx از `try_files ... /index.html` استفاده شده تا رفرش روی routeهای داخلی خراب نشود.
- اگر روی بعضی سیستم‌ها hot reload ضعیف بود، `CHOKIDAR_USEPOLLING=true` در compose فعال شده است.

## استقرار روی Liara

برای استقرار با همین Dockerfile، فایل `liara.json` در ریشه پروژه اضافه شده و پورت داخلی برنامه روی `80` تنظیم شده است.

```bash
npm i -g @liara/cli
liara login
liara deploy
```

اگر برنامه را هنوز در پنل لیارا نساخته‌ای، ابتدا یک Docker App بساز و بعد deploy را اجرا کن.
