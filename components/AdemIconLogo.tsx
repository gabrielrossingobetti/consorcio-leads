export default function AdemIconLogo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
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
        <span style={{ fontSize: Math.round(16 * s) }} className="font-black text-gray-900 tracking-wide">INDICA</span>
        <span style={{ fontSize: Math.round(9 * s) }} className="text-gray-500 tracking-widest uppercase">consórcio</span>
      </div>
    </div>
  )
}
