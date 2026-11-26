import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Search, X, MapPin, MessageCircle, RotateCcw, Package, ChevronRight, ChevronDown, Plus, Minus,
  RefreshCw, ShoppingBag, UserCheck, Clock,
} from 'lucide-react'
import { LOJA, BAIRROS, brl } from '../data/menu.js'
import { useCatalogo } from '../catalogo.jsx'
import ProductModal from './ProductModal.jsx'

const normalizar = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

function Skeleton() {
  return (
    <div className="product-grid" aria-label="Carregando cardápio">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="product-card sk">
          <div className="sk-lines"><span /><span /><span /></div>
          <div className="sk-img" />
        </div>
      ))}
    </div>
  )
}

// Sheet "Calcular taxa e tempo de entrega" — por bairro, sem exigir CEP.
function TaxaSheet({ bairro, onEscolher, onClose }) {
  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <span className="sheet-grip" />
        <h3>Taxa e tempo de entrega</h3>
        <p>Escolha seu bairro — não precisa de CEP.</p>
        <div className="bairro-list">
          {BAIRROS.map((b) => (
            <button key={b.nome} className={'bairro' + (bairro === b.nome ? ' on' : '')} onClick={() => onEscolher(b.nome)}>
              <span>{b.nome}</span>
              <span className="muted">{LOJA.tempoEntrega} · <strong>{brl(b.taxa)}</strong></span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function Sacola({ cart, subtotal, changeQty, bairro, onTaxa, go }) {
  const taxa = BAIRROS.find((b) => b.nome === bairro)?.taxa
  const gratis = subtotal >= LOJA.entregaGratisAcima
  const falta = LOJA.entregaGratisAcima - subtotal
  return (
    <aside className="bag">
      <button className="bag-row" onClick={onTaxa}>
        <MapPin size={18} />
        <span>
          {bairro ? (
            <>
              <strong>{bairro}</strong>
              <small>{LOJA.tempoEntrega} · {gratis ? 'entrega grátis' : brl(taxa)}</small>
            </>
          ) : (
            <strong>Calcular taxa e tempo de entrega</strong>
          )}
        </span>
        <ChevronRight size={18} className="red" />
      </button>
      <div className="bag-free">
        {gratis ? (
          <><b>Entrega grátis</b> garantida neste pedido</>
        ) : cart.length ? (
          <>Faltam <b>{brl(falta)}</b> para <b>entrega grátis</b></>
        ) : (
          <><b>Entrega grátis</b> em pedidos a partir de {brl(LOJA.entregaGratisAcima)}</>
        )}
      </div>
      {!cart.length ? (
        <div className="bag-empty">
          <ShoppingBag size={44} strokeWidth={1.5} />
          <span>Sacola vazia</span>
        </div>
      ) : (
        <ul className="bag-items">
          {cart.map((l) => (
            <li key={l.key}>
              <div>
                <strong>{l.produto.nome}</strong>
                {l.obs && <small>{l.obs}</small>}
                <span className="price">{brl(l.produto.preco * l.qtd)}</span>
              </div>
              <span className="qty small">
                <button onClick={() => changeQty(l.key, -1)} aria-label="Diminuir"><Minus size={14} /></button>
                <span>{l.qtd}</span>
                <button onClick={() => changeQty(l.key, 1)} aria-label="Aumentar"><Plus size={14} /></button>
              </span>
            </li>
          ))}
        </ul>
      )}
      {cart.length > 0 && (
        <div className="bag-total"><span>Subtotal</span><strong>{brl(subtotal)}</strong></div>
      )}
      <div className="bag-cta">
        <button className="btn btn-primary" disabled={!cart.length} onClick={() => go('checkout')}>
          {cart.length ? 'Finalizar pedido' : 'Adicione itens à sacola'}
        </button>
      </div>
    </aside>
  )
}

export default function Menu({ onAdd, lastOrder, onRepeat, currentOrder, go, cart, subtotal, changeQty, bairro, setBairro }) {
  const { categorias, produtos, status, recarregar } = useCatalogo()
  const [busca, setBusca] = useState('')
  const [ativa, setAtiva] = useState('')
  const [produtoAberto, setProdutoAberto] = useState(null)
  const [taxaAberta, setTaxaAberta] = useState(false)
  const [compacto, setCompacto] = useState(false)
  const sections = useRef({})

  const filtrados = useMemo(() => {
    const q = normalizar(busca.trim())
    if (!q) return produtos
    return produtos.filter((p) => normalizar(p.nome + ' ' + p.descricao).includes(q))
  }, [busca, produtos])

  // Categoria visível destacada no seletor (H1) + cabeçalho compacto ao rolar.
  useEffect(() => {
    if (busca || !categorias.length) return
    const obs = new IntersectionObserver(
      (entries) => {
        const vis = entries.filter((e) => e.isIntersecting)
        if (vis.length) setAtiva(vis[0].target.dataset.cat)
      },
      { rootMargin: '-120px 0px -65% 0px' }
    )
    Object.values(sections.current).forEach((el) => el && obs.observe(el))
    return () => obs.disconnect()
  }, [busca, categorias])

  useEffect(() => {
    const on = () => setCompacto(window.scrollY > 420)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])

  const irPara = (id) => {
    setBusca('')
    setAtiva(id)
    setTimeout(() => {
      const el = sections.current[id]
      if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 140, behavior: 'smooth' })
    }, 0)
  }

  const nomeDe = (id) => produtos.find((p) => p.id === id)?.nome ?? ''
  const resumoUltimo = lastOrder ? lastOrder.itens.map((l) => `${l.qtd}× ${nomeDe(l.id)}`).join(', ') : ''
  const pedidoEmAndamento = currentOrder && Date.now() - currentOrder.criadoEm < 2 * 60 * 60 * 1000

  const seletor = (
    <div className="cat-select">
      <select value={busca ? '' : ativa} onChange={(e) => e.target.value && irPara(e.target.value)} aria-label="Lista de categorias">
        <option value="" disabled>Lista de categorias</option>
        {categorias.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
      </select>
      <ChevronDown size={16} />
    </div>
  )
  const campoBusca = (
    <label className="search">
      <Search size={18} />
      <input type="search" placeholder="Busque por um produto" value={busca} onChange={(e) => setBusca(e.target.value)} aria-label="Buscar produto pelo nome" />
      {busca && <button className="clear" onClick={() => setBusca('')} aria-label="Limpar busca"><X size={14} /></button>}
    </label>
  )

  return (
    <div className="menu">
      {/* Cabeçalho compacto que aparece ao rolar (como no original) */}
      <div className={'compact-bar' + (compacto ? ' show' : '')} aria-hidden={!compacto}>
        <div className="compact-inner">
          <span className="mini-logo">L</span>
          {seletor}
          {campoBusca}
        </div>
      </div>

      <div className="hero-band">
        <div className="banner">
          <img src="/img/banner.jpg" alt="" />
        </div>
      </div>

      <div className="layout">
        <div className="content">
          <section className="store-head">
            <div className="logo-card"><span>L</span></div>
            <div className="store-text">
              <h1>{LOJA.nome}</h1>
              <div className="store-line">
                <span className="open">Aberto agora · até 23h</span>
                <span className="sep" />
                <span><MapPin size={15} /> Vitória de Santo Antão - PE</span>
                <span className="sep" />
                <span><Clock size={15} /> {LOJA.tempoEntrega}</span>
              </div>
            </div>
          </section>

          {/* Melhorias do TCC em destaque logo no topo */}
          <div className="perks">
            <span><UserCheck size={16} /> Peça sem cadastro</span>
            <span><MapPin size={16} /> CEP opcional</span>
            <button onClick={() => go('whatsapp')}><MessageCircle size={16} /> Falar com atendente</button>
          </div>

          {(pedidoEmAndamento || lastOrder) && (
            <div className="cta-stack">
              {pedidoEmAndamento && (
                <button className="cta cta-green" onClick={() => go('pedido')}>
                  <span className="cta-icon"><Package size={20} /></span>
                  <span className="cta-text">
                    <strong>Acompanhar pedido #{currentOrder.numero}</strong>
                    <small>Veja em que etapa está seu pedido</small>
                  </span>
                  <ChevronRight size={20} />
                </button>
              )}
              {lastOrder && (
                <button className="cta" onClick={onRepeat}>
                  <span className="cta-icon"><RotateCcw size={20} /></span>
                  <span className="cta-text">
                    <strong>Repetir último pedido · {brl(lastOrder.subtotal)}</strong>
                    <small>{resumoUltimo}</small>
                  </span>
                  <ChevronRight size={20} />
                </button>
              )}
            </div>
          )}

          <div className="filters">
            {seletor}
            {campoBusca}
          </div>

          {/* Atalhos de categoria sempre visíveis (proposta: categorias fixas) */}
          <nav className="chips" aria-label="Categorias">
            {categorias.map((c) => (
              <button key={c.id} className={'chip' + (ativa === c.id && !busca ? ' active' : '')} onClick={() => irPara(c.id)}>
                {c.nome}
              </button>
            ))}
          </nav>

          {status === 'carregando' && !produtos.length && <Skeleton />}
          {status === 'erro' && (
            <div className="panel load-error">
              <p>Não conseguimos carregar o cardápio. Verifique sua internet.</p>
              <button className="btn btn-primary" onClick={recarregar}><RefreshCw size={16} /> Tentar de novo</button>
            </div>
          )}

          {busca && (
            <p className="search-result">
              {filtrados.length
                ? `${filtrados.length} resultado(s) para “${busca}”`
                : `Nenhum produto encontrado para “${busca}”. Tente outra palavra, como “carne” ou “queijo”.`}
            </p>
          )}

          {categorias.map((c) => {
            const itens = filtrados.filter((p) => p.categoria === c.id)
            if (!itens.length) return null
            return (
              <section key={c.id} data-cat={c.id} ref={(el) => (sections.current[c.id] = el)} className="category">
                <h2 className="cat-title">{c.nome}</h2>
                <div className="product-grid">
                  {itens.map((p) => (
                    <article key={p.id} className="product-card" onClick={() => setProdutoAberto(p)}>
                      <div className="pc-text">
                        {p.destaque && <span className="badge-new">MAIS PEDIDO</span>}
                        <strong>{p.nome}</strong>
                        <p>{p.descricao}</p>
                        <span className="price">{brl(p.preco)}</span>
                      </div>
                      <div className="pc-img">
                        <img src={p.imagem} alt="" loading="lazy" />
                        <button className="add-fab" onClick={(e) => { e.stopPropagation(); onAdd(p.id) }} aria-label={`Adicionar ${p.nome} à sacola`}>
                          <Plus size={18} strokeWidth={2.5} />
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            )
          })}

          <p className="menu-footnote">Preços, itens e fotos meramente ilustrativos.</p>

          <section className="panel tcc-box">
            <h3>Melhorias propostas no TCC aplicadas aqui</h3>
            <ul>
              <li><span className="prio alta">Alta</span><span>Atendimento híbrido: link automático + “digite 1 para falar com um atendente”. <button className="link-btn" onClick={() => go('whatsapp')}>Testar</button></span></li>
              <li><span className="prio alta">Alta</span><span>Pedido como convidado: só nome, telefone e endereço; cadastro opcional. <button className="link-btn" onClick={() => go('conta')}>Ver cadastro</button></span></li>
              <li><span className="prio alta">Alta</span><span>CEP opcional: busca por rua e bairro, localização do celular e erros claros.</span></li>
              <li><span className="prio media">Média</span><span>Categorias fixas no topo, busca por nome, fotos e preços sempre visíveis.</span></li>
              <li><span className="prio media">Média</span><span>Um único link em todos os canais. <button className="link-btn" onClick={() => go('canais')}>Ver</button></span></li>
              <li><span className="prio baixa">Baixa</span><span>“Repetir último pedido” e status do pedido após a confirmação.</span></li>
            </ul>
            <small>
              TCC “Análise de usabilidade no processo de pedido via WhatsApp da Libanos Esfiharia” — Jailton Gomes de Sousa Junior
              e Manoel Victor Leite Izídio; orientação: Nélio Fernando da Fonsêca Aguiar e Silva (UNIFACOL, 2026).
            </small>
          </section>

          <details className="credits">
            <summary>Créditos das fotos (Wikimedia Commons)</summary>
            <ul>
              {produtos.filter((p) => p.credito).map((p) => (
                <li key={p.id}>
                  {p.nome}:{' '}
                  <a href={`https://commons.wikimedia.org/wiki/File:${encodeURIComponent(p.credito.arquivo)}`} target="_blank" rel="noreferrer">{p.credito.autor}</a>{' '}
                  · {p.credito.licenca}
                </li>
              ))}
            </ul>
          </details>
        </div>

        <Sacola cart={cart} subtotal={subtotal} changeQty={changeQty} bairro={bairro} onTaxa={() => setTaxaAberta(true)} go={go} />
      </div>

      {taxaAberta && (
        <TaxaSheet bairro={bairro} onClose={() => setTaxaAberta(false)} onEscolher={(b) => { setBairro(b); setTaxaAberta(false) }} />
      )}
      {produtoAberto && (
        <ProductModal
          produto={produtoAberto}
          onClose={() => setProdutoAberto(null)}
          onAdd={(qtd, obs) => { onAdd(produtoAberto.id, qtd, obs); setProdutoAberto(null) }}
        />
      )}
    </div>
  )
}
