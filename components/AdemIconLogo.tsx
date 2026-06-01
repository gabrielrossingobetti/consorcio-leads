export default function AdemIconLogo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const scales = { sm: 0.7, md: 1, lg: 1.4 }
  const s = scales[size]

  return (
    <div className="flex items-center gap-2.5">
      {/* Ícone SVG baseado no símbolo da Ademicon */}
      <svg width={Math.round(40 * s)} height={Math.round(40 * s)} viewBox="0 0 100 100" fill="none">
        <rect width="100" height="100" rx="16" fill="#B03A2E"/>
        {/*
          Símbolo Ademicon:
          - Chevron/seta apontando para cima no topo
          - Duas "cestinhas" / baldes abaixo, um de cada lado
          Desenhado como um único path com fill-rule evenodd para os buracos
        */}
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          fill="white"
          d="
            M50 11
            L80 37 L69 37
            L69 39 L58 39
            L58 76 Q58 83 51 83
            L49 83 Q42 83 42 76
            L42 39 L31 39
            L31 37 L20 37 Z

            M20 47 L20 74 Q20 83 29 83
            L40 83 L40 76 Q40 87 49 87
            L51 87 Q60 87 60 76
            L60 83 L71 83 Q80 83 80 74
            L80 47 Z

            M25 47 L25 74 Q25 78 29 78
            L38 78 L38 47 Z

            M62 47 L62 78 L71 78 Q75 78 75 74
            L75 47 Z
          "
        />
      </svg>
      <div className="flex flex-col leading-none">
        <span style={{ fontSize: Math.round(16 * s) }} className="font-black text-gray-900 tracking-wide">ADEMICON</span>
        <span style={{ fontSize: Math.round(9 * s) }} className="text-gray-500 tracking-widest uppercase">administradora</span>
      </div>
    </div>
  )
}
