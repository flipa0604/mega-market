# PM2 bilan botni doimiy ishlatish

## 1. PM2 o‘rnatish

```bash
sudo npm install -g pm2
```

## 2. Botni PM2 da ishga tushirish

```bash
cd ~/mega-market/bot
pm2 start ecosystem.config.cjs
```

Yoki qisqa buyruq:

```bash
cd ~/mega-market/bot
pm2 start src/index.js --name mega-market-bot
```

## 3. Server qayta yuklansa ham ishlashi (startup)

```bash
pm2 save
pm2 startup
```

`pm2 startup` chiqadigan buyruqni (sudo ...) nusxalab, terminalda ishlating. Shundan keyin server restart bo‘lsa ham bot avtomatik ishga tushadi.

## 4. Foydali buyruqlar

| Buyruq | Vazifasi |
|--------|----------|
| `pm2 list` | Barcha protsesslar ro‘yxati |
| `pm2 logs mega-market-bot` | Loglar (Ctrl+C bilan chiqish) |
| `pm2 restart mega-market-bot` | Qayta ishga tushirish |
| `pm2 stop mega-market-bot` | To‘xtatish |
| `pm2 delete mega-market-bot` | PM2 dan o‘chirish |

## 5. O‘zgarishlar keyin qayta ishga tushirish

Kod yoki .env o‘zgartirsangiz:

```bash
pm2 restart mega-market-bot
```
