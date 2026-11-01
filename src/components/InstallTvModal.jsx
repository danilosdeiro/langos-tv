import React, { useState, useEffect } from 'react';
import { 
  X, Tv, DownloadCloud, Monitor, Smartphone, Check, 
  Copy, ExternalLink, ArrowRight, CornerDownLeft, Sparkles, Sliders
} from 'lucide-react';

export default function InstallTvModal({ 
  isOpen, 
  onClose,
  isTvMode,
  onToggleTvMode
}) {
  const [copied, setCopied] = useState(false);
  const [activeStepTab, setActiveStepTab] = useState('btv'); // 'btv', 'browser', 'controle'

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' || e.keyCode === 27 || e.keyCode === 8 || e.keyCode === 4) {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const appUrl = 'https://langostv.vercel.app';

  const handleCopyUrl = () => {
    navigator.clipboard?.writeText(appUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div 
      data-tv-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl bg-zinc-900 border border-white/10 rounded-2xl md:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        
        {/* Topo do Modal */}
        <div className="flex items-center justify-between p-4 md:p-5 border-b border-white/10 bg-zinc-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
              <Tv size={22} />
            </div>
            <div>
              <h2 className="text-base md:text-lg font-extrabold text-white flex items-center gap-2">
                Como Usar no BTV e Smart TV Box
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  App Nativo
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Transforme o Lango's TV em um aplicativo instalado na tela inicial do seu aparelho
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            data-tv-focus="true"
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition border border-white/5"
            title="Fechar (Voltar)"
          >
            <X size={20} />
          </button>
        </div>

        {/* Abas de Navegação do Guia */}
        <div className="flex items-center gap-1.5 p-3 bg-zinc-950/40 border-b border-white/5 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveStepTab('btv')}
            data-tv-focus="true"
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
              activeStepTab === 'btv'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <Tv size={15} />
            <span>Passo a Passo BTV</span>
          </button>

          <button
            onClick={() => setActiveStepTab('controle')}
            data-tv-focus="true"
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
              activeStepTab === 'controle'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <Sliders size={15} />
            <span>Atalhos do Controle Remoto</span>
          </button>

          <button
            onClick={() => setActiveStepTab('browser')}
            data-tv-focus="true"
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
              activeStepTab === 'browser'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <Monitor size={15} />
            <span>PC & Celular</span>
          </button>
        </div>

        {/* Conteúdo do Guia */}
        <div className="p-4 md:p-6 overflow-y-auto space-y-4 text-xs md:text-sm text-zinc-300">
          
          {activeStepTab === 'btv' && (
            <div className="space-y-4 animate-fadeIn">
              
              {/* Card de Link Direto */}
              <div className="bg-indigo-950/40 border border-indigo-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div>
                  <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider block">
                    Endereço Oficial para o BTV:
                  </span>
                  <span className="font-mono text-sm md:text-base font-extrabold text-white tracking-wide">
                    {appUrl}
                  </span>
                </div>
                <button
                  onClick={handleCopyUrl}
                  data-tv-focus="true"
                  className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 transition shrink-0 shadow-md"
                >
                  {copied ? <Check size={15} /> : <Copy size={15} />}
                  <span>{copied ? 'Copiado!' : 'Copiar Link'}</span>
                </button>
              </div>

              {/* Método 1: Adicionar à Tela Inicial */}
              <div className="bg-zinc-950/60 border border-white/5 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-indigo-400 font-extrabold text-sm">
                  <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs">
                    1
                  </div>
                  <span>Método Recomendado: Instalar via Navegador do BTV</span>
                </div>
                <ol className="list-decimal list-inside space-y-2 text-zinc-300 text-xs md:text-sm leading-relaxed pl-1">
                  <li>
                    No seu BTV (ou TV Box Android), abra o <strong>Google Chrome</strong>, o navegador <strong>TV Bro</strong> ou <strong>Puffin TV</strong>.
                  </li>
                  <li>
                    Acesse o endereço: <code className="bg-zinc-800 px-2 py-0.5 rounded text-indigo-300 font-mono">langostv.vercel.app</code>
                  </li>
                  <li>
                    Pressione o menu do navegador (os <strong>3 pontinhos</strong> no canto superior direito ou o botão Menu do controle remoto).
                  </li>
                  <li>
                    Clique em <strong>"Adicionar à Tela Inicial"</strong> ou <strong>"Instalar Aplicativo"</strong>.
                  </li>
                  <li>
                    <span className="text-emerald-400 font-semibold">Pronto!</span> Um ícone exclusivo do Lango's TV aparecerá na tela inicial do seu BTV. Ao clicar nele, ele abrirá em tela inteira sem barra de endereço, como se fosse um app oficial da Play Store!
                  </li>
                </ol>
              </div>

              {/* Método 2: Downloader App */}
              <div className="bg-zinc-950/60 border border-white/5 rounded-2xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-purple-400 font-extrabold text-sm">
                  <div className="w-6 h-6 rounded-lg bg-purple-600 text-white flex items-center justify-center text-xs">
                    2
                  </div>
                  <span>Método Alternativo: App Downloader (AFTVnews)</span>
                </div>
                <p className="text-zinc-300 text-xs md:text-sm leading-relaxed">
                  Se o seu BTV tiver o aplicativo <strong>Downloader</strong> instalado, basta abrir o Downloader, digitar no campo de endereço <strong>langostv.vercel.app</strong> e pressionar <strong>Go</strong>. Em seguida, adicione aos Favoritos do Downloader para acesso em 1 clique!
                </p>
              </div>

            </div>
          )}

          {activeStepTab === 'controle' && (
            <div className="space-y-4 animate-fadeIn">
              <p className="text-zinc-300 text-xs md:text-sm">
                O Lango's TV conta com motor de <strong>Navegação Espacial Nativa (D-Pad)</strong>. Você não precisa usar mouse nem cursor na TV, apenas as teclas do controle:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                
                <div className="bg-zinc-950/70 border border-white/10 rounded-2xl p-3.5 space-y-1.5">
                  <span className="font-extrabold text-indigo-400 text-xs flex items-center gap-1.5">
                    ⬆️ ⬇️ ⬅️ ➡️ Setas (D-Pad)
                  </span>
                  <p className="text-zinc-400 text-xs">
                    Navegam entre os canais, filmes, séries e categorias. O card ativo ganha uma borda azul brilhante iluminada e centraliza automaticamente.
                  </p>
                </div>

                <div className="bg-zinc-950/70 border border-white/10 rounded-2xl p-3.5 space-y-1.5">
                  <span className="font-extrabold text-emerald-400 text-xs flex items-center gap-1.5">
                    🆗 Botão OK / Enter
                  </span>
                  <p className="text-zinc-400 text-xs">
                    Seleciona o item em foco. Durante a reprodução do vídeo, pausa ou retoma o filme/canal instantaneamente.
                  </p>
                </div>

                <div className="bg-zinc-950/70 border border-white/10 rounded-2xl p-3.5 space-y-1.5">
                  <span className="font-extrabold text-purple-400 text-xs flex items-center gap-1.5">
                    ⬆️ ⬇️ Setas no Player de Canais
                  </span>
                  <p className="text-zinc-400 text-xs">
                    Troca diretamente de canal (Canal Anterior / Próximo Canal) com aviso em tempo real na tela, sem precisar fechar o vídeo!
                  </p>
                </div>

                <div className="bg-zinc-950/70 border border-white/10 rounded-2xl p-3.5 space-y-1.5">
                  <span className="font-extrabold text-amber-400 text-xs flex items-center gap-1.5">
                    ⬅️ ➡️ Setas no Player de Filmes/Séries
                  </span>
                  <p className="text-zinc-400 text-xs">
                    Avança ou retrocede 10 segundos no vídeo para rever cenas ou pular aberturas facilmente.
                  </p>
                </div>

                <div className="bg-zinc-950/70 border border-white/10 rounded-2xl p-3.5 space-y-1.5 sm:col-span-2">
                  <span className="font-extrabold text-red-400 text-xs flex items-center gap-1.5">
                    🔙 Botão Voltar (Back / Return / ESC)
                  </span>
                  <p className="text-zinc-400 text-xs">
                    Fecha o player de vídeo ou qualquer janela aberta (grade de episódios, EPG) e retorna o foco exatamente para o canal onde você estava.
                  </p>
                </div>

              </div>

              {/* Botão de Ativação do Modo TV */}
              <div className="bg-gradient-to-r from-indigo-950/60 to-purple-950/60 border border-indigo-500/30 rounded-2xl p-4 flex items-center justify-between gap-3">
                <div>
                  <span className="font-bold text-white text-xs block">
                    Modo TV 10-Foot UI (Para Sala de Estar)
                  </span>
                  <span className="text-[11px] text-zinc-400">
                    Aumenta o tamanho dos cards e tipografia para facilitar a leitura a 3 metros de distância.
                  </span>
                </div>
                <button
                  onClick={onToggleTvMode}
                  data-tv-focus="true"
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
                    isTvMode 
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30' 
                      : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                  }`}
                >
                  <Sparkles size={15} />
                  <span>{isTvMode ? 'Modo TV Ativo' : 'Ativar Modo TV'}</span>
                </button>
              </div>

            </div>
          )}

          {activeStepTab === 'browser' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="space-y-3">
                <div className="bg-zinc-950/60 border border-white/5 rounded-2xl p-3.5 space-y-2">
                  <span className="font-bold text-white text-xs block">
                    No PC / Notebook (Windows, Mac ou Linux):
                  </span>
                  <p className="text-zinc-400 text-xs leading-relaxed">
                    No Google Chrome, Edge ou Brave, clique no ícone de <strong>Instalar</strong> que aparece na barra de endereço (ou nos 3 pontinhos &gt; "Instalar Lango's TV"). Ele será fixado no menu Iniciar e na barra de tarefas!
                  </p>
                </div>

                <div className="bg-zinc-950/60 border border-white/5 rounded-2xl p-3.5 space-y-2">
                  <span className="font-bold text-white text-xs block">
                    No Celular Android:
                  </span>
                  <p className="text-zinc-400 text-xs leading-relaxed">
                    Abra no Chrome do celular, toque nos 3 pontinhos e selecione <strong>"Instalar aplicativo"</strong> ou <strong>"Adicionar à tela inicial"</strong>.
                  </p>
                </div>

                <div className="bg-zinc-950/60 border border-white/5 rounded-2xl p-3.5 space-y-2">
                  <span className="font-bold text-white text-xs block">
                    No iPhone / iPad (iOS):
                  </span>
                  <p className="text-zinc-400 text-xs leading-relaxed">
                    Abra no navegador Safari, toque no botão de <strong>Compartilhar</strong> (ícone do quadrado com a seta para cima) e selecione <strong>"Adicionar à Tela de Início"</strong>.
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Rodapé */}
        <div className="p-4 border-t border-white/10 bg-zinc-950/80 flex items-center justify-between gap-3">
          <span className="text-[11px] text-zinc-500 hidden sm:inline">
            Pressione <strong>Voltar</strong> no controle para sair
          </span>
          <button
            onClick={onClose}
            data-tv-focus="true"
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition shadow-lg shadow-indigo-600/30"
          >
            Entendido, Continuar Navegando
          </button>
        </div>

      </div>
    </div>
  );
}
