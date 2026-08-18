export default function AdemIconLogo({ size = 'md', dark = false }: { size?: 'sm' | 'md' | 'lg'; dark?: boolean }) {
  const scales = { sm: 0.7, md: 1, lg: 1.4 }
  const s = scales[size]

  return (
    <div className="flex items-center gap-2.5">
      <div
        className="bg-red-600 rounded-lg flex items-center justify-center font-black text-white"
        style={{ width: Math.round(40 * s), height: Math.round(40 * s), fontSize: Math.round(18 * s) }}
      >
        IC
      </div>
      <div className="flex flex-col leading-none">
        <span style={{ fontSize: Math.round(16 * s) }} className={`font-black tracking-wide ${dark ? 'text-white' : 'text-gray-900'}`}>INDICA</span>
        <span style={{ fontSize: Math.round(9 * s) }} className={`tracking-widest uppercase ${dark ? 'text-white/50' : 'text-gray-500'}`}>consórcio</span>
      </div>
    </div>
  )
}
