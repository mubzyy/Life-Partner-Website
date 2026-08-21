export default function Avatar({ initials, color, size = 'md', img }) {
  const sizes = { sm: 32, md: 38, lg: 44, xl: 56 };
  const fontSize = { sm: 12, md: 15, lg: 17, xl: 21 };
  const s = sizes[size] || 38;
  const f = fontSize[size] || 15;
  return (
    <div
      className={`avatar avatar-${size}`}
      style={{
        background: color || '#2d8a4e',
        width: s, height: s, minWidth: s,
        fontSize: f,
      }}
    >
      {img ? <img src={img} alt={initials} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initials}
    </div>
  );
}
