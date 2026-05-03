'use client';
// app/(dashboard)/negocios/nuevo/page.tsx
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, Plus } from 'lucide-react';
import Link from 'next/link';
import ImageUploader from '@/components/dashboard/ImageUploader';

const RUBROS = ['padel', 'peluqueria', 'futbol', 'gimnasio', 'restaurante', 'otro'];

const COLORS = [
  { pri: '#22c55e', dark: '#16a34a' },
  { pri: '#ef4444', dark: '#dc2626' },
  { pri: '#f97316', dark: '#ea580c' },
  { pri: '#eab308', dark: '#ca8a04' },
  { pri: '#84cc16', dark: '#65a30d' },
  { pri: '#06b6d4', dark: '#0891b2' },
  { pri: '#3b82f6', dark: '#2563eb' },
  { pri: '#6366f1', dark: '#4f46e5' },
  { pri: '#8b5cf6', dark: '#7c3aed' },
  { pri: '#a855f7', dark: '#9333ea' },
  { pri: '#d946ef', dark: '#c026d3' },
  { pri: '#ec4899', dark: '#db2777' },
  { pri: '#f43f5e', dark: '#e11d48' },
  { pri: '#78716c', dark: '#57534e' },
  { pri: '#14b8a6', dark: '#0d9488' },
  { pri: '#0ea5e9', dark: '#0284c7' },
  { pri: '#10b981', dark: '#059669' },
  { pri: '#64748b', dark: '#475569' },
];

export default function NuevoNegocioPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [nombre, setNombre] = useState('');
  const [rubro, setRubro] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [horarios, setHorarios] = useState('');
  const [bienvenida, setBienvenida] = useState('');
  const [vencimiento, setVencimiento] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [faq, setFaq] = useState('');
  const [colorIdx, setColorIdx] = useState(0);
  const [fotos, setFotos] = useState<any[]>([]);
  const [logo, setLogo] = useState<any | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/negocios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre,
          rubro,
          descripcion,
          logo: logo || null,
          color_primario: COLORS[colorIdx].pri,
          color_dark: COLORS[colorIdx].dark,
          horarios,
          bienvenida,
          vencimiento: vencimiento || null,
          webhook_url: webhookUrl || null,
          faq: faq || null,
          fotos,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? 'Error al crear el negocio');
        return;
      }

      router.push('/negocios');
      router.refresh();
    } catch {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/negocios"
          className="text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Nuevo Negocio</h1>
          <p className="text-sm text-gray-400 mt-1">
            Completá los datos para registrar un nuevo negocio
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="dashboard-card p-6 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Nombre *
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Padel Zona Norte"
              required
              className="w-full px-4 py-2.5 bg-[#111111] border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Rubro *
            </label>
            <select
              value={rubro}
              onChange={(e) => setRubro(e.target.value)}
              required
              className="w-full px-4 py-2.5 bg-[#111111] border border-white/10 rounded-lg text-white focus:outline-none focus:border-green-500 text-sm"
            >
              <option value="">Seleccionar rubro</option>
              {RUBROS.map((r) => (
                <option key={r} value={r}>
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Descripción
            </label>
            <input
              type="text"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Reserva tus canchas"
              className="w-full px-4 py-2.5 bg-[#111111] border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Horarios
            </label>
            <input
              type="text"
              value={horarios}
              onChange={(e) => setHorarios(e.target.value)}
              placeholder="Lun–Dom · 08:00 – 23:00"
              className="w-full px-4 py-2.5 bg-[#111111] border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Vencimiento
            </label>
            <input
              type="date"
              value={vencimiento}
              onChange={(e) => setVencimiento(e.target.value)}
              className="w-full px-4 py-2.5 bg-[#111111] border border-white/10 rounded-lg text-white focus:outline-none focus:border-green-500 text-sm [color-scheme:dark]"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Webhook URL
            </label>
            <input
              type="url"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="https://n8n.simplificia.com.ar/webhook/chat"
              className="w-full px-4 py-2.5 bg-[#111111] border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500 text-sm"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              FAQ (Markdown)
            </label>
            <textarea
              value={faq}
              onChange={(e) => setFaq(e.target.value)}
              placeholder="## Preguntas Frecuentes&#10;&#10;**¿Cuál es el horario?**&#10;Lun a Dom de 08:00 a 23:00.&#10;&#10;**¿Cómo reservo?**&#10;Escribinos por WhatsApp."
              rows={6}
              className="w-full px-4 py-2.5 bg-[#111111] border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500 text-sm resize-y font-mono"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Mensaje de bienvenida
            </label>
            <textarea
              value={bienvenida}
              onChange={(e) => setBienvenida(e.target.value)}
              placeholder="¡Hola! Bienvenido a..."
              rows={3}
              className="w-full px-4 py-2.5 bg-[#111111] border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500 text-sm resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Logo
            </label>
            <ImageUploader files={logo ? [logo] : []} onChange={(files) => setLogo(files[0] || null)} max={1} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Color
            </label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((c, i) => (
                <button
                  key={c.pri}
                  type="button"
                  onClick={() => setColorIdx(i)}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                    colorIdx === i ? 'ring-1 ring-white/50 scale-110' : ''
                  }`}
                  style={{ backgroundColor: c.pri }}
                />
              ))}
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Fotos
            </label>
            <ImageUploader files={fotos} onChange={setFotos} max={5} />
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-2.5 text-red-400 text-sm">
            {error}
          </div>
        )}

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 bg-green-500 hover:bg-green-400 text-black font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Plus size={16} />
            )}
            {loading ? 'Creando...' : 'Crear Negocio'}
          </button>
          <Link
            href="/negocios"
            className="px-6 py-2.5 text-gray-400 hover:text-white transition-colors text-sm"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}
