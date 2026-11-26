import { Plus, Truck } from 'lucide-react'
import { LOJA, brl } from '../data/menu.js'
import { useCatalogo } from '../catalogo.jsx'

export default function Promocoes({ onAdd, go }) {
  const { produtos } = useCatalogo()
  const promo = produtos.filter((p) => p.destaque || p.categoria === 'combos')
  return (
    <div className="page">
      <h2 className="page-title">Promoções</h2>
      <div className="promo-banner">
        <Truck size={26} />
        <div>
          <strong>Entrega grátis</strong>
          <span>em pedidos a partir de {brl(LOJA.entregaGratisAcima)}</span>
        </div>
      </div>
      <div className="product-grid">
        {promo.map((p) => (
          <article key={p.id} className="product-card">
            <div className="pc-text">
              {p.categoria === 'combos' && <span className="badge-new">COMBO</span>}
              <strong>{p.nome}</strong>
              <p>{p.descricao}</p>
              <span className="price">{brl(p.preco)}</span>
            </div>
            <div className="pc-img">
              <img src={p.imagem} alt="" loading="lazy" />
              <button className="add-fab" onClick={() => onAdd(p.id)} aria-label={`Adicionar ${p.nome}`}><Plus size={18} strokeWidth={2.5} /></button>
            </div>
          </article>
        ))}
      </div>
      <button className="btn btn-ghost" onClick={() => go('')}>Ver cardápio completo</button>
    </div>
  )
}
