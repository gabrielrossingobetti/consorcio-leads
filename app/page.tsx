import Calculadora from '@/components/calculator/Calculadora'
import { Shield, Star, Users } from 'lucide-react'

export const metadata = {
  title: 'Simulador de Consórcio | Descubra quanto você economiza',
  description: 'Compare consórcio vs financiamento em 30 segundos. Veja quanto você economiza e fale com um especialista.',
}

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50">
      <header className="py-4 px-6 flex justify-center">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 rounded-lg p-1.5">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <span className="font-black text-gray-900 text-lg">Ademicon</span>
          <span className="text-gray-400 text-sm font-medium">| Consórcio</span>
        </div>
      </header>

      <section className="px-4 py-6 md:py-12">
        <div className="max-w-md mx-auto">
          <div className="flex justify-center gap-4 mb-6">
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
              <span>4.9 no Google</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Users className="w-3.5 h-3.5 text-blue-500" />
              <span>+12.000 clientes</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Shield className="w-3.5 h-3.5 text-green-500" />
              <span>Regulado pelo BC</span>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-xl shadow-blue-100 border border-gray-100 p-6 md:p-8">
            <Calculadora />
          </div>

          <p className="text-center text-xs text-gray-400 mt-6">
            Simulação gratuita • Sem compromisso • Especialistas humanos
          </p>
        </div>
      </section>
    </main>
  )
}
