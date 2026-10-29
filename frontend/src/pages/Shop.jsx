import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api.js';
import ProductCard from '../components/ProductCard.jsx';
import Pagination from '../components/Pagination.jsx';



export default function Shop() {
  const [params, setParams] = useSearchParams();
  const category = params.get('category') || '';
  const sort = params.get('sort') || 'newest';
  const page = Number(params.get('page')) || 1;
  const urlSearch = params.get('search') || '';
  const urlMin = params.get('minPrice') || '';
  const urlMax = params.get('maxPrice') || '';

  // typed values wait for a short pause before they go into the URL
  const [search, setSearch] = useState(urlSearch);
  const [minPrice, setMinPrice] = useState(urlMin);
  const [maxPrice, setMaxPrice] = useState(urlMax);
  const [cats, setCats] = useState([]);
  const [data, setData] = useState(null);

  useEffect(() => { api('/categories').then(setCats).catch(() => {}); }, []);

  const change = (changes) => {
    const next = new URLSearchParams(params);
    Object.entries({ page: '', ...changes }).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
    setParams(next);
  };

  useEffect(() => {
    const t = setTimeout(() => {
      if (search !== urlSearch || minPrice !== urlMin || maxPrice !== urlMax) change({ search, minPrice, maxPrice });
    }, 400);
    return () => clearTimeout(t);
  }, [search, minPrice, maxPrice]);

  useEffect(() => {
    const q = new URLSearchParams({ limit: 12, page, sort });
    if (category) q.set('category', category);
    if (urlSearch) q.set('search', urlSearch);
    if (urlMin) q.set('minPrice', urlMin);
    if (urlMax) q.set('maxPrice', urlMax);
    api('/products?' + q).then(setData).catch(() => setData({ items: [], total: 0, page: 1, pages: 1 }));
  }, [category, sort, page, urlSearch, urlMin, urlMax]);

  const clear = () => {
    setSearch(''); setMinPrice(''); setMaxPrice('');
    setParams({});
  };
  const filtered = category || urlSearch || urlMin || urlMax;

  return (
    <div className="container page">
      <h1>Our cakes</h1>

      <div className="chips">
        <button className={'chip' + (!category ? ' on' : '')} onClick={() => change({ category: '' })}>All</button>
        {cats.map((c) => (
          <button key={c._id} className={'chip' + (category === c._id ? ' on' : '')} onClick={() => change({ category: c._id })}>{c.name}</button>
        ))}
      </div>

      <div className="filters">
        <input type="search" placeholder="Search cakes" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search cakes" />
        <input type="number" min="0" placeholder="Price from (Rs.)" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} aria-label="Minimum price" />
        <input type="number" min="0" placeholder="Price up to (Rs.)" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} aria-label="Maximum price" />
        <select value={sort} onChange={(e) => change({ sort: e.target.value === 'newest' ? '' : e.target.value })} aria-label="Sort cakes">
          <option value="newest">Newest</option>
          <option value="price_asc">Price: low to high</option>
          <option value="price_desc">Price: high to low</option>
          <option value="rating">Top rated</option>
        </select>
      </div>

      {data === null ? (
        <p className="muted">Loading cakes...</p>
      ) : data.items.length ? (
        <>
          <p className="muted small-text">{data.total} cake{data.total !== 1 && 's'}{filtered && <> · <button className="linklike" onClick={clear}>Clear filters</button></>}</p>
          <div className="grid">{data.items.map((p) => <ProductCard key={p._id} product={p} />)}</div>
          <Pagination page={data.page} pages={data.pages} onChange={(n) => { change({ page: String(n) }); window.scrollTo({ top: 0, behavior: 'smooth' }); }} />
        </>
      ) : (
        <p className="muted">No cakes match your search. {filtered && <button className="linklike" onClick={clear}>Clear filters</button>}</p>
      )}
    </div>
  );
}
