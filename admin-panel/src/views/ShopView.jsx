import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { getCategories } from '../services/categories';
import { getProducts } from '../services/products';
import { getCartByTelegramId, saveCartByTelegramId } from '../services/userCart';
import { useTelegramUserId, useTelegramWebApp } from '../hooks/useTelegramUserId';
import './ShopView.css';

const SHOP_TITLE = import.meta.env.VITE_SHOP_TITLE || 'MEGA MARKET';

function debounce(fn, ms) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}

function cartToQtyMap(cart) {
  const m = {};
  (cart || []).forEach((item) => {
    const id = item.productId;
    if (id) m[id] = item.quantity || 0;
  });
  return m;
}

function buildCartArray(productsById, qtyMap) {
  const arr = [];
  Object.entries(qtyMap).forEach(([productId, quantity]) => {
    const q = Math.max(0, Math.floor(Number(quantity)) || 0);
    if (q < 1) return;
    const p = productsById[productId];
    if (!p) return;
    arr.push({
      productId,
      name: p.name,
      price: p.price || 0,
      quantity: q,
    });
  });
  return arr;
}

export default function ShopView() {
  const tg = useTelegramUserId();
  const webApp = useTelegramWebApp();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCatId, setSelectedCatId] = useState(null);
  const [qty, setQty] = useState({});
  const [userOk, setUserOk] = useState(null);
  const [saveError, setSaveError] = useState('');
  const productsById = useMemo(() => {
    const o = {};
    products.forEach((p) => {
      o[p.id] = p;
    });
    return o;
  }, [products]);

  const filteredProducts = useMemo(() => {
    if (!selectedCatId) return products;
    return products.filter((p) => p.categoryId === selectedCatId);
  }, [products, selectedCatId]);

  const cartCount = useMemo(
    () => Object.values(qty).reduce((s, n) => s + (n > 0 ? 1 : 0), 0),
    [qty]
  );

  const debouncedSaveRef = useRef(null);
  if (!debouncedSaveRef.current) {
    debouncedSaveRef.current = debounce(async (telegramId, cart) => {
      if (!telegramId) return;
      try {
        await saveCartByTelegramId(telegramId, cart);
        setSaveError('');
      } catch (e) {
        if (e.message === 'USER_NOT_FOUND') {
          setSaveError('Avval botda /start va ro‘yxatdan o‘ting.');
        } else {
          setSaveError('Savatni saqlab bo‘lmadi.');
        }
      }
    }, 600);
  }

  useEffect(() => {
    webApp?.ready?.();
    webApp?.expand?.();
  }, [webApp]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const [cats, prods] = await Promise.all([getCategories(), getProducts()]);
        if (cancelled) return;
        setCategories(cats);
        setProducts(prods);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (categories.length && selectedCatId == null) {
      setSelectedCatId(categories[0].id);
    }
  }, [categories, selectedCatId]);

  useEffect(() => {
    if (tg == null) {
      setUserOk(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const { userDocId, cart } = await getCartByTelegramId(tg);
        if (cancelled) return;
        if (!userDocId) {
          setUserOk(false);
          setQty({});
          return;
        }
        setUserOk(true);
        setQty(cartToQtyMap(cart));
      } catch {
        if (!cancelled) setUserOk(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [tg]);

  const setProductQty = (productId, next) => {
    const v = Math.max(0, Math.floor(next) || 0);
    setQty((prev) => {
      const n = { ...prev, [productId]: v };
      if (tg && userOk) {
        const cart = buildCartArray(productsById, n);
        debouncedSaveRef.current(tg, cart);
      }
      return n;
    });
  };

  const lineTotal = (p) => (p.price || 0) * (qty[p.id] || 0);

  return (
    <div className="shop">
      <header className="shop-header">
        <div className="shop-header-inner">
          <span className="shop-header-spacer" aria-hidden />
          <h1 className="shop-title">{SHOP_TITLE}</h1>
          <div className="shop-header-right">
            <Link to="/admin" className="shop-admin-link">
              Admin
            </Link>
            <span className="shop-cart-badge" title="Tur soni">
              🛒{cartCount}
            </span>
          </div>
        </div>
      </header>

      {!tg && (
        <div className="shop-banner shop-banner-warn">
          Telegram ichida oching yoki test uchun: <code>?tg_id=SIZNING_ID</code>
        </div>
      )}
      {tg && userOk === false && (
        <div className="shop-banner shop-banner-warn">
          Botda <strong>/start</strong> bosing va ism, telefonni kiriting — keyin savat saqlanadi.
        </div>
      )}
      {saveError && <div className="shop-banner shop-banner-err">{saveError}</div>}

      <div className="shop-cat-scroll">
        {categories.map((c) => (
          <button
            key={c.id}
            type="button"
            className={`shop-cat-pill ${selectedCatId === c.id ? 'active' : ''}`}
            onClick={() => setSelectedCatId(c.id)}
          >
            {c.name}
          </button>
        ))}
      </div>

      <main className="shop-main">
        {loading ? (
          <p className="shop-loading">Yuklanmoqda…</p>
        ) : (
          <div className="shop-grid">
            {filteredProducts.map((p) => {
              const q = qty[p.id] || 0;
              const stock = p.stock != null && p.stock !== '' ? p.stock : '—';
              return (
                <article key={p.id} className="shop-card">
                  <div className="shop-card-img-wrap">
                    {p.imageUrl ? (
                      <img src={p.imageUrl} alt="" className="shop-card-img" />
                    ) : (
                      <div className="shop-card-noimg">Rasm yo‘q</div>
                    )}
                  </div>
                  <div className="shop-card-body">
                    <h2 className="shop-card-name">{p.name}</h2>
                    <p className="shop-card-price">
                      {Number(p.price || 0).toLocaleString('uz-UZ')} so&apos;m
                    </p>
                    {p.shortDescription ? (
                      <p className="shop-card-desc">{p.shortDescription}</p>
                    ) : null}
                    <p className="shop-card-summa">
                      Summa: {lineTotal(p).toLocaleString('uz-UZ')} so&apos;m
                    </p>
                    <p className="shop-card-stock">Mavjud: {stock}</p>
                    <div className="shop-qty-row">
                      <button
                        type="button"
                        className="shop-qty-btn"
                        onClick={() => setProductQty(p.id, q - 1)}
                        aria-label="Kamaytirish"
                      >
                        −
                      </button>
                      <span className="shop-qty-val">{q}</span>
                      <button
                        type="button"
                        className="shop-qty-btn"
                        onClick={() => setProductQty(p.id, q + 1)}
                        aria-label="Ko‘paytirish"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>

      <footer className="shop-footer">
        Savat botdagi <strong>Savatim</strong> bilan bir xil. Buyurtma uchun botda joyingizni yuboring.
      </footer>
    </div>
  );
}
