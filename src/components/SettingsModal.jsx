import React, { useState } from 'react';
import { 
  X, RefreshCw, Download, Database, Check, AlertCircle, Trash2, Globe, ShieldCheck 
} from 'lucide-react';
import { CatalogService } from '../services/catalogService';

export default function SettingsModal({ 
  isOpen, 
  onClose, 
  channels, 
  onChannelsUpdated 
}) {
  const [customUrl, setCustomUrl] = useState(
    () => localStorage.getItem('langos_custom_channels_url') || 'https://canais-saimo.pages.dev/catalogo.txt'
  );
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  if (!isOpen) return null;

  const handleUpdate = async () => {
    setLoading(true);
    setStatusMessage(null);
    try {
      const updated = await CatalogService.fetchRemoteList(customUrl.trim());
      onChannelsUpdated(updated);
      setStatusMessage({ type: 'success', text: `Sucesso! ${updated.length} canais carregados e atualizados.` });
    } catch (err) {
      console.error(err);
      setStatusMessage({ type: 'error', text: `Erro ao sincronizar lista: ${err.message}` });
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    CatalogService.exportToM3U(channels);
    setStatusMessage({ type: 'success', text: 'Arquivo .M3U gerado e baixado com sucesso!' });
  };

  const handleClearCache = async () => {
    if (confirm('Deseja restaurar as configurações padrão e limpar o cache local?')) {
      localStorage.removeItem('langos_cached_channels');
      localStorage.removeItem('langos_custom_channels_url');
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map(k => caches.delete(k)));
      }
      window.location.reload();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-zinc-900 border border-white/10 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col">
        
        {/* Topo do Modal */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Database size={20} />
            </div>
            <div>
              <h2 className="text-white font-extrabold text-lg">Configurações & Listas</h2>
              <p className="text-zinc-400 text-xs">Gerencie suas listas, fontes e backups do Lango's TV</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Conteúdo do Modal */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* Alerta de Status */}
          {statusMessage && (
            <div className={`p-4 rounded-2xl flex items-center gap-3 text-sm font-medium ${
              statusMessage.type === 'success' 
                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' 
                : 'bg-red-500/15 text-red-300 border border-red-500/30'
            }`}>
              {statusMessage.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* Estatísticas Rápidas */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-zinc-950/60 p-4 rounded-2xl border border-white/5">
              <span className="text-zinc-500 text-xs font-medium">Canais Catalogados</span>
              <p className="text-white font-black text-2xl mt-1">{channels.length}</p>
            </div>
            <div className="bg-zinc-950/60 p-4 rounded-2xl border border-white/5">
              <span className="text-zinc-500 text-xs font-medium">Total de Fontes/Streams</span>
              <p className="text-indigo-400 font-black text-2xl mt-1">
                {channels.reduce((acc, c) => acc + (c.fontes?.length || 1), 0)}
              </p>
            </div>
          </div>

          {/* Configuração de URL da Lista */}
          <div>
            <label className="block text-zinc-300 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Globe size={14} className="text-indigo-400" /> URL da Lista de Canais (M3U ou Catalogo.txt)
            </label>
            <p className="text-zinc-500 text-xs mb-3">
              Insira a URL de um catálogo ou lista M3U. Por padrão, consome a lista aberta com 350+ canais.
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                placeholder="https://sua-lista.com/lista.m3u"
                className="flex-1 bg-zinc-950 text-white text-xs rounded-xl px-4 py-2.5 border border-white/10 focus:border-indigo-500 focus:outline-none"
              />
              <button
                onClick={handleUpdate}
                disabled={loading}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 disabled:opacity-50"
              >
                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                {loading ? 'Buscando...' : 'Atualizar'}
              </button>
            </div>
          </div>

          {/* Exportação M3U (Backup para nunca ficar na mão) */}
          <div className="bg-indigo-950/30 border border-indigo-500/20 p-5 rounded-2xl">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 bg-indigo-600 text-white rounded-xl mt-0.5">
                <Download size={18} />
              </div>
              <div className="flex-1">
                <h4 className="text-white font-bold text-sm">Exportar Backup (.M3U)</h4>
                <p className="text-zinc-400 text-xs mt-1 leading-relaxed">
                  Gere um arquivo padrão <code className="text-indigo-300 bg-indigo-950/80 px-1 py-0.5 rounded">.m3u</code> com todos os canais para abrir no VLC, IPTVnator, Kodi ou Smart TV a qualquer momento.
                </p>
                <button
                  onClick={handleExport}
                  className="mt-3.5 px-4 py-2 bg-white text-black hover:bg-zinc-200 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-lg"
                >
                  <Download size={14} /> Baixar Arquivo .M3U Agora
                </button>
              </div>
            </div>
          </div>

          {/* Garantia de Liberdade */}
          <div className="flex items-center gap-3 p-4 bg-zinc-950/40 rounded-2xl border border-white/5 text-xs text-zinc-400">
            <ShieldCheck size={20} className="text-emerald-400 shrink-0" />
            <span>O <strong>Lango's TV</strong> é 100% livre e roda no seu aparelho. Seus dados e favoritos ficam guardados apenas no seu navegador.</span>
          </div>

        </div>

        {/* Rodapé do Modal */}
        <div className="p-4 bg-zinc-950/80 border-t border-white/5 flex items-center justify-between">
          <button
            onClick={handleClearCache}
            className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1.5 transition"
          >
            <Trash2 size={14} /> Restaurar Padrão
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-bold transition"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
}
