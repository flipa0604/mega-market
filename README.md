# Mega Market — E-commerce Telegram Bot + Web Admin

Telegram bot for customers and a React admin panel for product management. Backend uses **Node.js (Telegraf)**, **Firebase Firestore**, and **Firebase Cloud Storage**.

---

## Project structure

```
mega market/
├── bot/                    # Telegram bot (Node.js + Telegraf)
│   ├── src/
│   │   ├── index.js        # Entry, routes
│   │   ├── config.js
│   │   ├── firebase.js     # Firestore helpers
│   │   ├── session.js
│   │   ├── keyboards.js
│   │   ├── messages.js
│   │   └── handlers/
│   │       ├── start.js
│   │       ├── language.js
│   │       ├── registration.js
│   │       ├── menu.js
│   │       ├── cart.js
│   │       └── checkout.js
│   ├── .env.example
│   └── package.json
├── admin-panel/            # Web admin (React + Vite)
│   ├── src/
│   │   ├── main.jsx
│   │   ├── App.jsx
│   │   ├── firebase.js
│   │   ├── services/products.js
│   │   └── components/
│   │       ├── ProductList.jsx
│   │       └── ProductForm.jsx
│   ├── .env.example
│   └── package.json
├── package.json
└── README.md
```

---

## 1. Firebase setup

1. Create a project at [Firebase Console](https://console.firebase.google.com/).
2. Enable **Firestore Database** and **Storage**.
3. **Firestore:** Create collections (they can be created automatically when the app writes):
   - `users` — telegramId, firstName, lastName, phone, lang, cart[]
   - `products` — name, price, shortDescription, imageUrl, createdAt
   - `orders` — userId, telegramId, userName, userPhone, items[], total, latitude, longitude, createdAt
4. **Storage:** Create a folder `products/` (or let the admin panel create it on first upload). Configure CORS if you deploy the admin to another domain.
5. **Firestore indexes:** When you first run a query that orders by `createdAt`, Firestore may show a link to create an index. Open that link and create the index for the `products` collection.
6. **Security rules (Firestore):** For development you can use:
   - For production, restrict `users` and `orders` to server-only (admin SDK). Allow read/write to `products` only from your admin app (e.g. by Auth or by allowed domain).
7. **Security rules (Storage):** Allow read for all (so the bot can show images) and write only for authenticated users or via Admin SDK. For a simple admin-only panel you can use strict rules and sign in with Firebase Auth.

### Service account (for the bot)

1. Project settings → Service accounts → Generate new private key.
2. Save the JSON. You will put `project_id`, `client_email`, and `private_key` into the bot’s `.env` (see below).

### Web app config (for the admin panel)

1. Project settings → General → Your apps → Add app → Web.
2. Copy the `firebaseConfig` object. You will use it in the admin panel’s `.env` as `VITE_FIREBASE_*` (see below).

---

## 2. Telegram bot setup

1. Create a bot with [@BotFather](https://t.me/BotFather), get the **token**.
2. Get your **Telegram user ID** (e.g. use [@userinfobot](https://t.me/userinfobot)) — this will be the admin who receives order notifications.

3. In the repo:

```bash
cd bot
cp .env.example .env
```

4. Edit `bot/.env`:

```env
BOT_TOKEN=123456:ABC...
ADMIN_TELEGRAM_ID=123456789

FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

Use the exact private key from the JSON (with `\n` for newlines inside the string).

5. Install and run:

```bash
npm install
npm start
```

For development with auto-restart:

```bash
npm run dev
```

---

## 3. Web admin panel setup

1. In the repo:

```bash
cd admin-panel
cp .env.example .env
```

2. Edit `admin-panel/.env` with your Firebase web config:

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

3. Install and run:

```bash
npm install
npm run dev
```

4. Open the URL shown (e.g. `http://localhost:5173`).

### Add product flow (strict order)

1. **Upload image** → saved to Firebase Storage, URL is used later.
2. **Enter product name.**
3. **Enter price.**
4. **Enter short description.**
5. **Save** → all data (including image URL) is written to the `products` collection.

---

## 4. Deploying on Ubuntu Server

### Bot (systemd)

1. Copy the project to the server (e.g. `/var/www/mega-market`).
2. Install Node.js (v18+): `curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -` then `sudo apt install -y nodejs`.
3. In `bot/`: `npm install --production`, create `.env` as above.
4. Create a service file:

```bash
sudo nano /etc/systemd/system/mega-market-bot.service
```

```ini
[Unit]
Description=Mega Market Telegram Bot
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/mega-market/bot
ExecStart=/usr/bin/node src/index.js
Restart=on-failure
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

5. Run:

```bash
sudo systemctl daemon-reload
sudo systemctl enable mega-market-bot
sudo systemctl start mega-market-bot
sudo systemctl status mega-market-bot
```

### Admin panel (build + Nginx)

1. In `admin-panel/`: set `.env` and run `npm run build`.
2. Copy `admin-panel/dist` to the server (e.g. `/var/www/mega-market-admin`).
3. Configure Nginx to serve the SPA (root = `dist`, try_files to `index.html`).

---

## 5. User flow (Telegram bot)

- **Start:** `/start` → choose language (Uzbek / Russian).
- **Registration:** If the user is not in the `users` collection, ask: First name → Last name → Phone (via **request_contact** button), then save to Firestore.
- **Main menu (reply keyboard):**  
  - **Mahsulotlar (Products):** List products (image, description, price, inline “Add to Cart”), with **Orqaga (Back)**.  
  - **Savatim (My Cart):** Show cart and total; inline **Remove item**, **Clear cart**, **Buyurtma yuborish (Checkout)**.
- **Checkout:** When the user taps **Buyurtma yuborish**, the bot asks for delivery location via **request_location**. After the user sends location:
  - Order is finalized and stored in `orders`.
  - Admin receives a Telegram message: order summary (user name, phone, cart items, total) and the GPS location (map link + location message).
  - User’s cart is cleared and a “Thank you” message is sent.

---

## 6. Admin notifications

The bot sends to `ADMIN_TELEGRAM_ID`:

1. Order summary (Markdown): user name, phone, cart lines, total.
2. Location message (Telegram location so the map opens).
3. Text line with Google Maps link and order ID.

Ensure `ADMIN_TELEGRAM_ID` in `bot/.env` is your numeric Telegram user ID.

---

## 7. Quick commands (from repo root)

| Command           | Description                |
|-------------------|----------------------------|
| `npm run bot`     | Start the Telegram bot     |
| `npm run bot:dev` | Bot with watch mode        |
| `npm run admin`   | Start admin dev server     |
| `npm run admin:build` | Build admin for production |

You now have the project structure, setup steps, and core code for both the Firebase Web Admin Panel and the Node.js Telegram Bot, with checkout and admin notification flow wired end-to-end.
