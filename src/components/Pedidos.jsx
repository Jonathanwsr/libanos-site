import { Receipt, RotateCcw, ChevronRight } from 'lucide-react'
import { brl } from '../data/menu.js'
import { useCatalogo } from '../catalogo.jsx'

// No site original, "Pedidos" exige login. Aqui o histórico aparece direto
// (fica salvo no aparelho), sem obrigar a pessoa a entrar numa conta.
export default function Pedidos({ pedidos, currentOrder, onRepetir, go }) {
  const { produtos } = useCatalogo()
  const nome = (id) => produtos.find((p) => p.id === id)?.nome ?? 'Item'

  return (
    <div className="page narrow">
      <h2 className="page-title">Seus pedidos</h2>
      {!pedidos.length ? (
        <div className="panel empty-panel">
          <div className="empty-icon"><Receipt size={34} /></div>
          <h4>Você ainda não fez pedidos</h4>
          <p className="muted">Seus pedidos aparecem aqui automaticamente — não precisa entrar na conta.</p>
          <button className="btn btn-primary" onClick={() => go('')}>Ver cardápio</button>
        </div>
      ) : (
        <ul className="orders">
          {pedidos.map((p) => {
            const emAndamento = currentOrder?.numero === p.numero && Date.now() - p.criadoEm < 2 * 60 * 60 * 1000
            return (
              <li key={p.numero} className="panel order-item">
                <div className="oi-head">
                  <strong>Pedido #{p.numero}</strong>
                  <span className={'tag' + (emAndamento ? ' live' : '')}>{emAndamento ? 'Em andamento' : 'Concluído'}</span>
                </div>
                <small className="muted">
                  {new Date(p.criadoEm).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })} ·{' '}
                  {p.tipo === 'entrega' ? 'Entrega' : 'Retirada'}
                </small>
                <p className="oi-items">{p.itens.map((l) => `${l.qtd}× ${nome(l.id)}`).join(', ')}</p>
                <div className="oi-foot">
                  <strong>{brl(p.total)}</strong>
                  <div className="row-inline">
                    {emAndamento && (
                      <button className="link-btn" onClick={() => go('pedido')}>Acompanhar <ChevronRight size={16} /></button>
                    )}
                    <button className="btn btn-outline sm" onClick={() => onRepetir(p)}><RotateCcw size={16} /> Pedir de novo</button>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
