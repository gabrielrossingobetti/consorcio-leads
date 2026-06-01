export default function AdemIconLogo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const scales = { sm: 0.7, md: 1, lg: 1.4 }
  const s = scales[size]

  return (
    <div className="flex items-center gap-2.5">
      {/* Ícone SVG baseado no símbolo da Ademicon */}
      <svg width={Math.round(40 * s)} height={Math.round(40 * s)} viewBox="0 0 100 100" fill="none">
        <rect width="100" height="100" rx="16" fill="#B03A2E"/>
        {/* Chevron/telhado */}
        <path d="M50 10 L84 43 L63 43 L63 46 L37 46 L37 43 L16 43 Z" fill="white"/>
        {/* Cesto esquerdo */}
        <rect x="8" y="43" width="29" height="42" rx="10" fill="white"/>
        {/* Buraco cesto esquerdo */}
        <rect x="14" y="51" width="17" height="28" rx="6" fill="#B03A2E"/>
        {/* Cesto direito */}
        <rect x="63" y="43" width="29" height="42" rx="10" fill="white"/>
        {/* Buraco cesto direito */}
        <rect x="69" y="51" width="17" height="28" rx="6" fill="#B03A2E"/>
      </svg>
      <div className="flex flex-col leading-none">
        <span style={{ fontSize: Math.round(16 * s) }} className="font-black text-gray-900 tracking-wide">ADEMICON</span>
        <span style={{ fontSize: Math.round(9 * s) }} className="text-gray-500 tracking-widest uppercase">administradora</span>
      </div>
    </div>
  )
}
