import { useEffect, useMemo, useRef, useState } from 'react'
import { CATEGORIAS, PRODUTOS, LOJA, brl } from '../data/menu.js'
import ProductModal from './ProductModal.jsx'

const normalizar = (s) =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

export default function Menu({ onAdd, lastOrder, onRepeat, currentOrder, go }) {
  const [busca, setBusca] = useState('')
  const [ativa, setAtiva] = useState(CATEGORIAS[0].id)
  const [produtoAberto, setProdutoAberto] = useState(null)
  const sections = useRef({})
  const chipsRef = useRef(null)

  const filtrados = useMemo(() => {
    const q = normalizar(busca.trim())
    if (!q) return PRODUTOS
    return PRODUTOS.filter((p) => normalizar(p.nome + ' ' + p.descricao).includes(q))
  }, [busca])

  // Destaca a categoria visível enquanto a pessoa rola (H1 visibilidade).
  useEffect(() => {
    if (busca) return
    const obs = new IntersectionObserver(
      (entries) => {
        const vis = entries.filter((e) => e.isIntersecting)
        if (vis.length) setAtiva(vis[0].target.dataset.cat)
      },
      { rootMargin: '-140px 0px -60% 0px' }
    )
    Object.values(sections.current).forEach((el) => el && obs.observe(el))
    return () => obs.disconnect()
  }, [busca])

  useEffect(() => {
    const chip = chipsRef.current?.querySelector(`[data-chip="${ativa}"]`)
    chip?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' })
  }, [ativa])

  const irPara = (id) => {
    setBusca('')
    setAtiva(id)
    setTimeout(() => {
      const el = sections.current[id]
      if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 120, behavior: 'smooth' })
    }, 0)
  }

  const resumoUltimo = lastOrder
    ? lastOrder.itens
        .map((l) => `${l.qtd}× ${PRODUTOS.find((p) => p.id === l.id)?.nome ?? ''}`)
        .join(', ')
    : ''

  const pedidoEmAndamento =
    currentOrder && Date.now() - currentOrder.criadoEm < 2 * 60 * 60 * 1000

  return (
    <div className="menu">
      <section className="store-info">
        <div className="store-badges">
          <span className="badge open">● Aberto agora</span>
          <span className="badge">{LOJA.horario}</span>
          <span className="badge">🛵 {LOJA.tempoEntrega}</span>
        </div>
        <p className="store-note">
          Peça sem cadastro e sem precisar saber o CEP. Se preferir, fale com um atendente a qualquer momento.
        </p>
      </section>

      {pedidoEmAndamento && (
        <button className="card-cta status-cta" onClick={() => go('pedido')}>
          <span>📦</span>
          <span>
            <strong>Acompanhar pedido #{currentOrder.numero}</strong>
            <small>Veja em que etapa está seu pedido</small>
          </span>
          <span aria-hidden>›</span>
        </button>
      )}

      {lastOrder && (
        <button className="card-cta repeat-cta" onClick={onRepeat}>
          <span>🔁</span>
          <span>
            <strong>Repetir último pedido · {brl(lastOrder.subtotal)}</strong>
            <small>{resumoUltimo}</small>
          </span>
          <span aria-hidden>›</span>
        </button>
      )}

      <div className="sticky-nav">
        <label className="search">
          <span aria-hidden>🔍</span>
          <input
            type="search"
            placeholder="Buscar no cardápio (ex.: carne, chocolate, refri)"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            aria-label="Buscar produto pelo nome"
          />
          {busca && (
            <button className="clear" onClick={() => setBusca('')} aria-label="Limpar busca">
              ✕
            </button>
          )}
        </label>
        <nav className="chips" ref={chipsRef} aria-label="Categorias do cardápio">
          {CATEGORIAS.map((c) => (
            <button
              key={c.id}
              data-chip={c.id}
              className={'chip' + (ativa === c.id && !busca ? ' active' : '')}
              onClick={() => irPara(c.id)}
            >
              {c.icone} {c.nome}
            </button>
          ))}
        </nav>
      </div>

      {busca && (
        <p className="search-result">
          {filtrados.length
            ? `${filtrados.length} resultado(s) para “${busca}”`
            : `Nenhum produto encontrado para “${busca}”. Tente outra palavra, como “carne” ou “queijo”.`}
        </p>
      )}

      {CATEGORIAS.map((c) => {
        const itens = filtrados.filter((p) => p.categoria === c.id)
        if (!itens.length) return null
        return (
          <section
            key={c.id}
            data-cat={c.id}
            ref={(el) => (sections.current[c.id] = el)}
            className="category"
          >
            <h2>
              {c.icone} {c.nome}
            </h2>
            <ul className="product-list">
              {itens.map((p) => (
                <li key={p.id} className="product">
                  <button className="product-body" onClick={() => setProdutoAberto(p)}>
                    <span className="product-photo" aria-hidden>
                      {p.emoji}
                    </span>
                    <span className="product-text">
                      <strong>{p.nome}</strong>
                      <small>{p.descricao}</small>
                      <span className="price">{brl(p.preco)}</span>
                    </span>
                  </button>
                  <button
                    className="add-btn"
                    onClick={() => onAdd(p.id)}
                    aria-label={`Adicionar ${p.nome} à sacola`}
                  >
                    +
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )
      })}

      <p className="menu-footnote">Preços e itens ilustrativos para demonstração do protótipo.</p>

      <section className="tcc-box">
        <h3>Melhorias propostas no TCC aplicadas neste protótipo</h3>
        <ul>
          <li><span className="prio alta">Alta</span> Atendimento híbrido: link automático + “digite 1 para falar com um atendente”. <button className="link-btn" onClick={() => go('whatsapp')}>Testar</button></li>
          <li><span className="prio alta">Alta</span> Pedido como convidado: só nome, telefone e endereço; cadastro opcional ao final.</li>
          <li><span className="prio alta">Alta</span> CEP opcional: busca por rua e bairro, localização do celular e erros claros.</li>
          <li><span className="prio media">Média</span> Cardápio com categorias fixas no topo, busca por nome, fotos e preços sempre visíveis.</li>
          <li><span className="prio media">Média</span> Um único link em todos os canais. <button className="link-btn" onClick={() => go('canais')}>Ver</button></li>
          <li><span className="prio baixa">Baixa</span> “Repetir último pedido” e status do pedido após a confirmação.</li>
        </ul>
        <small>
          Baseado no TCC “Análise de usabilidade no processo de pedido via WhatsApp da Libanos Esfiharia”
          — Jailton Gomes de Sousa Junior e Manoel Victor Leite Izídio; orientação: Nélio Fernando da Fonsêca Aguiar e Silva (UNIFACOL, 2026).
        </small>
      </section>

      {produtoAberto && (
        <ProductModal
          produto={produtoAberto}
          onClose={() => setProdutoAberto(null)}
          onAdd={(qtd, obs) => {
            onAdd(produtoAberto.id, qtd, obs)
            setProdutoAberto(null)
          }}
        />
      )}
    </div>
  )
}
