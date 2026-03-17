# Firebase credentials on Ubuntu server

**UNAUTHENTICATED** means the bot cannot log in to Firestore. Use a **JSON file** (recommended).

## Step 1: Get a fresh service account JSON

1. Open [Firebase Console](https://console.firebase.google.com/) → your project **mega market**.
2. Click **Project settings** (gear) → **Service accounts**.
3. Click **Generate new private key** → **Generate**. A `.json` file downloads.

## Step 2: Put the file on the server

From your computer (replace with your server user and path):

```bash
scp /path/to/downloaded-key.json ubuntu@YOUR_SERVER_IP:~/mega-market/bot/serviceAccount.json
```

Or: copy the file contents and on the server:

```bash
cd ~/mega-market/bot
nano serviceAccount.json
# Paste the full JSON (all lines), save (Ctrl+O, Enter, Ctrl+X)
chmod 600 serviceAccount.json
```

## Step 3: Use only the JSON (no Firebase in .env)

Edit `.env` and **remove or comment out** these three lines so the bot uses only the JSON file:

- `FIREBASE_PROJECT_ID=...`
- `FIREBASE_CLIENT_EMAIL=...`
- `FIREBASE_PRIVATE_KEY=...`

Keep in `.env` only:

- `BOT_TOKEN=...`
- `ADMIN_TELEGRAM_ID=...`

The bot will auto-detect `serviceAccount.json` in the bot folder.

## Step 4: Start the bot

```bash
cd ~/mega-market/bot
npm start
```

You should see: `Firebase: using credentials from /home/ubuntu/mega-market/bot/serviceAccount.json` then `Bot started`.

---

If you still get UNAUTHENTICATED:

- Make sure the JSON is from the **same** Firebase project as your Firestore.
- In Firebase Console → **Firestore** → check that the project ID matches the JSON `project_id`.
- Generate a **new** key (old keys can be revoked) and use that new JSON file.

---

**Kategoriyalar:** Bot va admin panel `categories` va `products` (categoryId) ishlatadi. Firestore da `categories` koleksiyasini yaratishingiz shart emas — admin panel birinchi kategoriya qo‘shganda yaratadi. Mahsulotlarni kategoriya bo‘yicha olish uchun `products` da composite index kerak: **categoryId** (Ascending), **createdAt** (Descending). Birinchi marta botda kategoriya tanlanganda Firestore xato va index yaratish havolasini beradi — havolani ochib index yarating.
