import { useMemo, useState } from 'react';
import {
  ArrowLeft, ArrowRight, Check, ChevronDown, ChevronLeft, ChevronRight,
  CircleDollarSign, Heart, Menu, Minus, Plus, RotateCcw, Search, ShieldCheck,
  ShoppingBag, Sparkles, Trash2, Upload, X,
} from 'lucide-react';

type Product = {
  id: number;
  name: string;
  designer: string;
  category: string;
  size: string;
  condition: string;
  conditionNotes: string;
  price: number;
  original: number;
  image: string;
  gallery: string[];
  fabric: string;
  color: string;
  details: string;
};

type CartLine = { product: Product; quantity: number };

const asset = (name: string) => `${import.meta.env.BASE_URL}images/${name}`;

const products: Product[] = [
  {
    id: 1, name: 'The Midnight Column', designer: 'Galvan', category: 'Evening Gowns',
    size: 'UK 10', condition: 'Excellent', conditionNotes: 'Light wear at inner hem, invisible when worn.',
    price: 385, original: 1290, image: 'second-life-hero.jpg',
    gallery: ['second-life-hero.jpg', 'second-life-velvet.jpg'], fabric: 'Silk satin',
    color: 'Midnight', details: 'Original label intact · Dry clean only · Concealed back zip',
  },
  {
    id: 2, name: 'Luna Bias Dress', designer: 'A.L.C.', category: 'Cocktail Dresses',
    size: 'UK 8', condition: 'Like new', conditionNotes: 'Worn once for an evening event; no visible marks.',
    price: 198, original: 495, image: 'second-life-emerald.jpg',
    gallery: ['second-life-emerald.jpg', 'second-life-cobalt.jpg'], fabric: 'Viscose satin',
    color: 'Emerald', details: 'Fully lined · Dry clean only · Adjustable straps',
  },
  {
    id: 3, name: 'The Carlotta Tuxedo', designer: 'Solace London', category: 'Tailored Suits',
    size: 'UK 12', condition: 'Excellent', conditionNotes: 'A single, barely perceptible mark inside the cuff.',
    price: 290, original: 760, image: 'second-life-tux.jpg',
    gallery: ['second-life-tux.jpg', 'second-life-velvet.jpg'], fabric: 'Crepe',
    color: 'Champagne', details: 'Wool blend · Satin lapels · Single button closure',
  },
  {
    id: 4, name: 'Velvet After Dark', designer: 'Roksanda', category: 'Evening Gowns',
    size: 'UK 10', condition: 'Very good', conditionNotes: 'Some gentle pile variation at the seat from previous wear.',
    price: 340, original: 1100, image: 'second-life-velvet.jpg',
    gallery: ['second-life-velvet.jpg', 'second-life-hero.jpg'], fabric: 'Silk velvet',
    color: 'Onyx', details: 'Silk lining · Dry clean only · Side seam pockets',
  },
  {
    id: 5, name: 'The Cobalt Edit', designer: 'Stine Goya', category: 'Two-Piece Sets',
    size: 'UK 8', condition: 'Like new', conditionNotes: 'Worn once; pristine finish throughout.',
    price: 220, original: 540, image: 'second-life-cobalt.jpg',
    gallery: ['second-life-cobalt.jpg', 'second-life-emerald.jpg'], fabric: 'Recycled satin',
    color: 'Cobalt', details: 'Two-piece set · Elasticated waist · Hand wash separately',
  },
];

const categories = ['Evening Gowns', 'Cocktail Dresses', 'Tailored Suits', 'Two-Piece Sets'];

function App() {
  const [category, setCategory] = useState('All pieces');
  const [sort, setSort] = useState('Just in');
  const [query, setQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [selected, setSelected] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkout, setCheckout] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [sellOpen, setSellOpen] = useState(false);
  const [sellStep, setSellStep] = useState(1);
  const [sellSubmitted, setSellSubmitted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [toast, setToast] = useState('');
  const [sellForm, setSellForm] = useState({ designer: '', item: 'Evening gown', size: '', notes: '', email: '', payout: 'Bank transfer', files: '' });
  const [checkoutForm, setCheckoutForm] = useState({ name: '', email: '', address: '', city: '', postcode: '' });
  const [formError, setFormError] = useState('');

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const items = products.filter((product) => {
      const matchesCategory = category === 'All pieces' || product.category === category;
      const matchesQuery = !normalized || `${product.name} ${product.designer} ${product.category} ${product.color}`.toLowerCase().includes(normalized);
      return matchesCategory && matchesQuery;
    });
    if (sort === 'Price: low to high') return [...items].sort((a, b) => a.price - b.price);
    if (sort === 'Price: high to low') return [...items].sort((a, b) => b.price - a.price);
    return items;
  }, [category, query, sort]);

  const cartCount = cart.reduce((sum, line) => sum + line.quantity, 0);
  const subtotal = cart.reduce((sum, line) => sum + line.product.price * line.quantity, 0);

  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 2400);
  };
  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  const closeOverlays = () => {
    setCartOpen(false); setSelected(null); setSellOpen(false); setCheckout(false);
  };
  const openProduct = (product: Product) => { setSelected(product); setSelectedImage(0); };
  const toggleWishlist = (id: number) => setWishlist((items) => items.includes(id) ? items.filter((item) => item !== id) : [...items, id]);
  const addToCart = (product: Product) => {
    setCart((lines) => lines.some((line) => line.product.id === product.id)
      ? lines.map((line) => line.product.id === product.id ? { ...line, quantity: line.quantity + 1 } : line)
      : [...lines, { product, quantity: 1 }]);
    notify(`${product.name} added to your edit`);
  };
  const changeQuantity = (id: number, delta: number) => setCart((lines) => lines.flatMap((line) => {
    if (line.product.id !== id) return [line];
    const quantity = line.quantity + delta;
    return quantity > 0 ? [{ ...line, quantity }] : [];
  }));
  const beginSell = () => { setSellOpen(true); setSellStep(1); setSellSubmitted(false); setFormError(''); };
  const updateSell = (field: string, value: string) => setSellForm((form) => ({ ...form, [field]: value }));
  const updateCheckout = (field: string, value: string) => setCheckoutForm((form) => ({ ...form, [field]: value }));

  return (
    <div className="sl-root">
      <div className="sl-top">Complimentary UK delivery on edits over £250 · A more considered way to dress</div>
      <nav className="sl-nav" aria-label="Main navigation">
        <button className="sl-mobile" aria-label="Open menu" data-testid="button-open-menu" onClick={() => setMenuOpen(!menuOpen)}><Menu size={21} /></button>
        <button className="sl-logo" data-testid="button-home" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>second life<em>.</em></button>
        <div className="sl-navlinks">
          <button data-testid="button-nav-shop" onClick={() => scrollTo('shop')}>Shop</button>
          <button data-testid="button-nav-sell" onClick={() => scrollTo('sell')}>Sell with us</button>
          <button data-testid="button-nav-standard" onClick={() => scrollTo('story')}>Our standard</button>
        </div>
        <div className="sl-actions">
          <button className="sl-icon" aria-label="Search" data-testid="button-search" onClick={() => setSearchOpen(!searchOpen)}><Search size={18} /></button>
          <button className="sl-icon" aria-label={`Open edit, ${cartCount} items`} data-testid="button-cart" onClick={() => setCartOpen(true)}><ShoppingBag size={19} />{cartCount > 0 && <span className="sl-count">{cartCount}</span>}</button>
        </div>
        {searchOpen && <div className="sl-search"><Search size={15} /><input autoFocus type="search" value={query} onChange={(event) => { setQuery(event.target.value); scrollTo('shop'); }} placeholder="Search designer, color or occasion" aria-label="Search pieces" data-testid="input-search" /><button aria-label="Close search" data-testid="button-close-search" onClick={() => setSearchOpen(false)}><X size={15} /></button></div>}
        {menuOpen && <div className="sl-search" style={{ left: 0, right: 0, top: 76, width: '100%', display: 'grid', gap: 16 }}><button data-testid="button-mobile-shop" onClick={() => { scrollTo('shop'); setMenuOpen(false); }}>Shop the edit</button><button data-testid="button-mobile-sell" onClick={() => { scrollTo('sell'); setMenuOpen(false); }}>Sell with us</button><button data-testid="button-mobile-standard" onClick={() => { scrollTo('story'); setMenuOpen(false); }}>Our standard</button></div>}
      </nav>

      <main>
        <section className="sl-hero">
          <div className="sl-hero-copy">
            <div className="sl-eyebrow">The considered occasion edit · 01 / 04</div>
            <h1>Give luxury<br /><i>a second life.</i></h1>
            <p>Pre-owned formalwear with a past worth knowing — authenticated, inspected, and ready for the next chapter.</p>
            <div className="sl-hero-actions"><button className="sl-btn" data-testid="button-shop-collection" onClick={() => scrollTo('shop')}>Shop collection <ArrowRight size={14} /></button><button className="sl-btn alt" data-testid="button-hero-sell" onClick={beginSell}>Sell your dress</button></div>
          </div>
          <div className="sl-hero-img"><div className="sl-hero-tag">A dress is never just one story.</div></div>
        </section>

        <section className="sl-section" aria-labelledby="occasion-heading">
          <div className="sl-section-head"><h2 id="occasion-heading">Find your occasion</h2><p>Pieces with presence, chosen for the moments that deserve more than one wear.</p></div>
          <div className="sl-cats">{categories.map((item, index) => <button className="sl-cat" key={item} data-testid={`button-category-${index}`} onClick={() => { setCategory(item); scrollTo('shop'); }}><small>0{index + 1}</small><span>{item}</span></button>)}</div>
        </section>

        <section className="sl-section" id="shop" style={{ paddingTop: 20 }} aria-labelledby="shop-heading">
          <div className="sl-section-head">
            <div><div className="sl-eyebrow">A fresh arrival, always</div><h2 id="shop-heading">Just in</h2></div>
            <div className="sl-tools"><select className="sl-select" value={category} onChange={(event) => setCategory(event.target.value)} aria-label="Filter by category" data-testid="select-category"><option>All pieces</option>{categories.map((item) => <option key={item}>{item}</option>)}</select><select className="sl-select" value={sort} onChange={(event) => setSort(event.target.value)} aria-label="Sort products" data-testid="select-sort"><option>Just in</option><option>Price: low to high</option><option>Price: high to low</option></select></div>
          </div>
          <div className="sl-grid">{filtered.map((product) => <article className="sl-product" key={product.id} data-testid={`card-product-${product.id}`} onClick={() => openProduct(product)}>
            <div className="sl-photo"><img src={asset(product.image)} alt={`${product.name} by ${product.designer}`} /><button className="sl-heart" aria-label={wishlist.includes(product.id) ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`} data-testid={`button-wishlist-${product.id}`} onClick={(event) => { event.stopPropagation(); toggleWishlist(product.id); }}>{wishlist.includes(product.id) ? <Heart size={15} fill="#bf684b" color="#bf684b" /> : <Heart size={15} />}</button><span className="sl-badge">{product.condition}</span></div>
            <div className="sl-product-info"><h3>{product.name}</h3><p>{product.designer} · {product.size}</p><div className="sl-price"><b>£{product.price}</b><s>£{product.original}</s><span className="sl-save">Save {Math.round((1 - product.price / product.original) * 100)}%</span></div></div>
          </article>)}</div>
          {filtered.length === 0 && <p className="sl-empty" data-testid="empty-products">This edit is between chapters. Try another search or category.</p>}
        </section>

        <section className="sl-trust" id="story" aria-labelledby="standard-heading">
          <div><div className="sl-eyebrow" style={{ color: '#d6a28d' }}>Why second life</div><h2 id="standard-heading">Better for<br /><i>the dress.</i></h2></div>
          <div className="sl-trust-grid">
            <div className="sl-trust-item"><ShieldCheck size={22} /><h3>Authenticated</h3><p>Every piece is reviewed by our in-house specialists before it earns its place here.</p></div>
            <div className="sl-trust-item"><Sparkles size={22} /><h3>Inspected</h3><p>We document every detail, from the hand of the fabric to the smallest sign of wear.</p></div>
            <div className="sl-trust-item"><RotateCcw size={22} /><h3>In circulation</h3><p>A more beautiful way to reduce the impact of occasion dressing, one wear at a time.</p></div>
          </div>
        </section>

        <section className="sl-sell" id="sell" aria-labelledby="sell-heading">
          <div><div className="sl-eyebrow">Your wardrobe, continued</div><h2 id="sell-heading">Let someone<br /><i>else have the moment.</i></h2><p>We make selling your special pieces as thoughtful as buying them. Our team handles the details; you receive the return.</p><button className="sl-btn" data-testid="button-start-selling" onClick={beginSell}>Start selling <ArrowRight size={14} /></button></div>
          <div className="sl-sell-card"><div className="sl-eyebrow">The Second Life promise</div><h3 style={{ font: '400 28px var(--app-font-serif)', margin: 0 }}>One less dress in the back of the wardrobe.</h3><p style={{ fontSize: 12, lineHeight: 1.7 }}>Join 1,840 women giving their best pieces another evening to remember.</p><div style={{ borderTop: '1px solid rgba(24,43,42,.18)', paddingTop: 18, marginTop: 25, display: 'flex', justifyContent: 'space-between', fontSize: 11 }}><span>Average seller return</span><b>£186.40</b></div></div>
        </section>
      </main>
      <footer className="sl-footer"><div className="sl-logo">second life<em>.</em></div><div>Quietly glamorous. Considered always.</div><div className="sl-mono">London · Est. 2024</div></footer>

      {(cartOpen || selected || sellOpen) && <div className="sl-overlay" data-testid="overlay" onClick={closeOverlays} />}

      {selected && <div className="sl-dialog" role="dialog" aria-modal="true" aria-labelledby="product-dialog-heading" data-testid="dialog-product">
        <button className="sl-close" aria-label="Close product details" data-testid="button-close-product" onClick={() => setSelected(null)}><X /></button>
        <div className="sl-detail">
          <div><img className="sl-detail-img" src={asset(selected.gallery[selectedImage])} alt={`${selected.name} detail`} /><div className="sl-thumbs">{selected.gallery.map((image, index) => <button key={image} className={selectedImage === index ? 'active' : ''} aria-label={`View image ${index + 1}`} data-testid={`button-gallery-${index}`} onClick={() => setSelectedImage(index)}><img src={asset(image)} alt="" /></button>)}</div></div>
          <div style={{ padding: '20px 4px' }}><div className="sl-eyebrow">{selected.category} · {selected.condition}</div><h2 id="product-dialog-heading">{selected.name}</h2><p style={{ fontSize: 14 }}>{selected.designer}</p><div className="sl-price" style={{ fontSize: 20, marginTop: 25 }}><b>£{selected.price}</b><s>£{selected.original}</s><span className="sl-save">Save £{selected.original - selected.price}</span></div><p style={{ fontSize: 13, lineHeight: 1.7, marginTop: 25 }}>A quietly striking piece with a life already lived. Professionally inspected and ready to make an entrance.</p><div className="sl-mono" style={{ marginTop: 28 }}>Select your size</div><div className="sl-size"><button className="active" data-testid="button-size-selected">{selected.size}</button><button data-testid="button-size-guide" onClick={() => notify('Our size guide is coming with the next chapter')}>Size guide</button></div><div className="sl-detail-actions"><button className="sl-btn" data-testid="button-add-to-cart" onClick={() => { addToCart(selected); setSelected(null); }}>Add to your edit <ShoppingBag size={14} /></button><button className="sl-btn alt" data-testid="button-buy-now" onClick={() => { addToCart(selected); setSelected(null); setCartOpen(true); }}>Buy now <ArrowRight size={14} /></button></div><div style={{ borderTop: '1px solid rgba(24,43,42,.18)', marginTop: 26, paddingTop: 18, fontSize: 11, lineHeight: 1.7 }}><b>Details</b><br />{selected.fabric} · {selected.details}<br />Condition notes: {selected.conditionNotes}</div></div>
        </div>
      </div>}

      {cartOpen && <aside className="sl-drawer" role="dialog" aria-modal="true" aria-labelledby="cart-heading" data-testid="drawer-cart">
        <button className="sl-close" aria-label="Close cart" data-testid="button-close-cart" onClick={() => setCartOpen(false)}><X /></button>
        <div className="sl-eyebrow">Your edit · {cartCount} piece{cartCount === 1 ? '' : 's'}</div><h2 id="cart-heading" style={{ font: '400 40px var(--app-font-serif)', margin: '12px 0 28px' }}>Saved for you.</h2>
        {orderComplete ? <div className="sl-success"><div className="sl-success-mark"><Check /></div><h2 style={{ font: '400 32px var(--app-font-serif)' }}>Consider it yours.</h2><p style={{ fontSize: 13, lineHeight: 1.7 }}>Your order is confirmed. A note with your delivery details is on its way to {checkoutForm.email}.</p><button className="sl-btn" data-testid="button-close-confirmation" onClick={() => { setOrderComplete(false); setCart([]); setCartOpen(false); }}>Back to the collection</button></div>
          : checkout ? <><button className="sl-close" style={{ float: 'none', marginBottom: 12 }} aria-label="Back to cart" data-testid="button-back-cart" onClick={() => setCheckout(false)}><ArrowLeft size={16} /> Back</button><div className="sl-eyebrow">The final detail</div><h2 style={{ font: '400 32px var(--app-font-serif)', margin: '8px 0 24px' }}>Delivery details.</h2><form className="sl-checkout-form" onSubmit={(event) => { event.preventDefault(); if (Object.values(checkoutForm).some((value) => !value.trim())) { setFormError('Please complete each delivery detail.'); return; } setFormError(''); setOrderComplete(true); }}><label className="sl-field">Full name<input required value={checkoutForm.name} onChange={(event) => updateCheckout('name', event.target.value)} data-testid="input-checkout-name" /></label><label className="sl-field">Email address<input required type="email" value={checkoutForm.email} onChange={(event) => updateCheckout('email', event.target.value)} data-testid="input-checkout-email" /></label><label className="sl-field">Address<input required value={checkoutForm.address} onChange={(event) => updateCheckout('address', event.target.value)} data-testid="input-checkout-address" /></label><div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}><label className="sl-field">City<input required value={checkoutForm.city} onChange={(event) => updateCheckout('city', event.target.value)} data-testid="input-checkout-city" /></label><label className="sl-field">Postcode<input required value={checkoutForm.postcode} onChange={(event) => updateCheckout('postcode', event.target.value)} data-testid="input-checkout-postcode" /></label></div>{formError && <p className="sl-form-error" role="alert">{formError}</p>}<button className="sl-btn" type="submit" data-testid="button-place-order">Place order · £{subtotal}</button></form></>
          : cart.length === 0 ? <div style={{ textAlign: 'center', padding: '70px 15px' }}><ShoppingBag size={25} /><p>Your edit is waiting to be started.</p><button className="sl-btn" data-testid="button-discover-pieces" onClick={() => { setCartOpen(false); scrollTo('shop'); }}>Discover pieces</button></div>
            : <>{cart.map((line) => <div className="sl-cart-row" key={line.product.id}><img src={asset(line.product.image)} alt="" /><div style={{ flex: 1 }}><h3>{line.product.name}</h3><p style={{ fontSize: 11 }}>{line.product.designer} · {line.product.size}</p><b>£{line.product.price * line.quantity}</b><div className="sl-qty"><button aria-label="Decrease quantity" data-testid={`button-decrease-${line.product.id}`} onClick={() => changeQuantity(line.product.id, -1)}><Minus size={12} /></button><span data-testid={`text-quantity-${line.product.id}`}>{line.quantity}</span><button aria-label="Increase quantity" data-testid={`button-increase-${line.product.id}`} onClick={() => changeQuantity(line.product.id, 1)}><Plus size={12} /></button></div></div><button className="sl-close" aria-label={`Remove ${line.product.name}`} data-testid={`button-remove-${line.product.id}`} onClick={() => changeQuantity(line.product.id, -line.quantity)}><Trash2 size={15} /></button></div>)}<div className="sl-cart-footer"><div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Subtotal</span><b>£{subtotal}</b></div><p style={{ fontSize: 11, lineHeight: 1.6, color: '#5d6c67' }}>{subtotal >= 250 ? 'Complimentary UK delivery is included.' : 'UK delivery calculated at checkout · complimentary over £250.'}</p><button className="sl-btn" style={{ width: '100%', marginTop: 14 }} data-testid="button-checkout" onClick={() => setCheckout(true)}>Continue to checkout <ArrowRight size={14} /></button></div></>}
      </aside>}

      {sellOpen && <div className="sl-dialog small" role="dialog" aria-modal="true" aria-labelledby="sell-dialog-heading" data-testid="dialog-sell">
        <button className="sl-close" aria-label="Close selling flow" data-testid="button-close-sell" onClick={() => setSellOpen(false)}><X /></button>
        {sellSubmitted ? <div className="sl-success"><div className="sl-success-mark"><Check /></div><h2 id="sell-dialog-heading">We have your story.</h2><p style={{ fontSize: 13, lineHeight: 1.7 }}>Our specialists will review your piece and write within 2 working days with an estimate.</p><button className="sl-btn" data-testid="button-finish-sell" onClick={() => setSellOpen(false)}>Back to the collection</button></div> : <><div className="sl-eyebrow">Sell with us · Step {sellStep} of 4</div><div className="sl-progress">{[1, 2, 3, 4].map((step) => <i key={step} className={step <= sellStep ? 'on' : ''} />)}</div>{sellStep === 1 && <><h2 id="sell-dialog-heading">Tell us about<br /><i>your piece.</i></h2><div className="sl-form"><label className="sl-field">Designer<input placeholder="e.g. Emilia Wickstead" value={sellForm.designer} onChange={(event) => updateSell('designer', event.target.value)} data-testid="input-sell-designer" /></label><label className="sl-field">What are you selling?<select value={sellForm.item} onChange={(event) => updateSell('item', event.target.value)} data-testid="select-sell-item"><option>Evening gown</option><option>Cocktail dress</option><option>Tailored suit</option><option>Two-piece set</option></select></label><label className="sl-field">Size<input placeholder="UK 10" value={sellForm.size} onChange={(event) => updateSell('size', event.target.value)} data-testid="input-sell-size" /></label><button className="sl-btn" data-testid="button-sell-next-1" onClick={() => { if (!sellForm.designer || !sellForm.size) { setFormError('Add the designer and size to continue.'); return; } setFormError(''); setSellStep(2); }}>Next: show us the details <ArrowRight size={14} /></button>{formError && <p className="sl-form-error" role="alert">{formError}</p>}</div></>}
          {sellStep === 2 && <><h2>Give it<br /><i>some context.</i></h2><div className="sl-upload"><Upload size={23} /><b>Share up to 5 photographs</b><br /><span style={{ color: '#6d7972' }}>Front, back, label and any details we should know</span><input type="file" accept="image/*" multiple data-testid="input-sell-images" onChange={(event) => updateSell('files', event.target.files?.length ? `${event.target.files.length} photo(s) selected` : '')} />{sellForm.files && <p className="sl-discount">{sellForm.files}</p>}</div><label className="sl-field">Condition notes<textarea placeholder="Tell us about any signs of wear" value={sellForm.notes} onChange={(event) => updateSell('notes', event.target.value)} data-testid="textarea-sell-notes" /></label><div style={{ display: 'flex', gap: 8 }}><button className="sl-btn alt" data-testid="button-sell-back-2" onClick={() => setSellStep(1)}><ChevronLeft size={14} /> Back</button><button className="sl-btn" data-testid="button-sell-next-2" onClick={() => setSellStep(3)}>Next: your preferences <ArrowRight size={14} /></button></div></>}
          {sellStep === 3 && <><div style={{ textAlign: 'center', padding: '20px 0' }}><CircleDollarSign size={32} color="#bf684b" /><h2>Almost there.</h2><p style={{ fontSize: 13, lineHeight: 1.6 }}>Where should we send your return when your piece finds its next home?</p></div><label className="sl-field">Email address<input type="email" placeholder="you@example.com" value={sellForm.email} onChange={(event) => updateSell('email', event.target.value)} data-testid="input-sell-email" /></label><label className="sl-field">Payout preference<select value={sellForm.payout} onChange={(event) => updateSell('payout', event.target.value)} data-testid="select-sell-payout"><option>Bank transfer</option><option>Store credit (+10%)</option></select></label><div style={{ display: 'flex', gap: 8 }}><button className="sl-btn alt" data-testid="button-sell-back-3" onClick={() => setSellStep(2)}><ChevronLeft size={14} /> Back</button><button className="sl-btn" data-testid="button-sell-next-3" onClick={() => { if (!sellForm.email.includes('@')) { setFormError('Add a valid email address to continue.'); return; } setFormError(''); setSellStep(4); }}>Review submission <ArrowRight size={14} /></button></div>{formError && <p className="sl-form-error" role="alert">{formError}</p>}</>}
          {sellStep === 4 && <><h2>Ready for its<br /><i>next chapter?</i></h2><p style={{ fontSize: 13, lineHeight: 1.7 }}>We will review your {sellForm.item.toLowerCase()} by {sellForm.designer} and contact you at {sellForm.email}.</p><div style={{ borderTop: '1px solid rgba(24,43,42,.18)', borderBottom: '1px solid rgba(24,43,42,.18)', padding: '16px 0', fontSize: 12, lineHeight: 1.9 }}><b>Details to review</b><br />Size {sellForm.size} · {sellForm.payout}<br />{sellForm.files || 'No photographs attached yet'}</div><div style={{ display: 'flex', gap: 8, marginTop: 18 }}><button className="sl-btn alt" data-testid="button-sell-back-4" onClick={() => setSellStep(3)}><ChevronLeft size={14} /> Back</button><button className="sl-btn" data-testid="button-submit-sell" onClick={() => setSellSubmitted(true)}>Submit for review <Check size={14} /></button></div></>}</>}
      </div>}

      {toast && <div className="sl-toast" role="status" data-testid="status-toast">{toast}</div>}
    </div>
  );
}

export default App;