import { MdChevronLeft, MdChevronRight } from 'react-icons/md';

export default function Pagination({ total, perPage, current, onChange }) {
  const totalPages = Math.ceil(total / perPage);
  if (totalPages <= 1) return null;

  const from = (current - 1) * perPage + 1;
  const to = Math.min(current * perPage, total);

  function pages() {
    const arr = [];
    const delta = 2;
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= current - delta && i <= current + delta)) {
        arr.push(i);
      } else if (arr[arr.length - 1] !== '...') {
        arr.push('...');
      }
    }
    return arr;
  }

  return (
    <div className="pagination-wrap">
      <span className="pagination-info">Showing {from}–{to} of {total} results</span>
      <div className="pagination-controls">
        <button
          className="page-btn"
          onClick={() => onChange(current - 1)}
          disabled={current === 1}
          aria-label="Previous page"
        >
          <MdChevronLeft />
        </button>
        {pages().map((p, i) =>
          p === '...' ? (
            <span key={`ellipsis-${i}`} style={{ padding: '0 4px', color: 'var(--text-muted)', fontSize: 13 }}>…</span>
          ) : (
            <button
              key={p}
              className={`page-btn${p === current ? ' active' : ''}`}
              onClick={() => onChange(p)}
            >
              {p}
            </button>
          )
        )}
        <button
          className="page-btn"
          onClick={() => onChange(current + 1)}
          disabled={current === totalPages}
          aria-label="Next page"
        >
          <MdChevronRight />
        </button>
      </div>
    </div>
  );
}
