export default function AdemIconLogo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const scales = { sm: 0.7, md: 1, lg: 1.4 }
  const s = scales[size]

  return (
    <div className="flex items-center gap-2.5">
      {/* Ícone SVG baseado no símbolo da Ademicon */}
      <svg width={Math.round(36 * s)} height={Math.round(36 * s)} viewBox="0 0 36 36" fill="none">
        <rect width="36" height="36" rx="8" fill="#C0392B"/>
        {/* Casa/telhado */}
        <path d="M18 7L8 15V28H14V21H22V28H28V15L18 7Z" fill="white" stroke="white" strokeWidth="0.5" strokeLinejoin="round"/>
        {/* Detalhe interno */}
        <path d="M15 28V22H21V28" stroke="#C0392B" strokeWidth="1.5" fill="none"/>
      </svg>
      <div className="flex flex-col leading-none">
        <span style={{ fontSize: Math.round(16 * s) }} className="font-black text-gray-900 tracking-wide">ADEMICON</span>
        <span style={{ fontSize: Math.round(9 * s) }} className="text-gray-500 tracking-widest uppercase">administradora</span>
      </div>
    </div>
  )
}
