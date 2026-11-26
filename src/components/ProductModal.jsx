import { useState } from 'react'
import { X, Minus, Plus, MessageSquareText } from 'lucide-react'
import { brl } from '../data/menu.js'

export default function ProductModal({ produto, onClose, onAdd }) {
  const [qtd, setQtd] = useState(1)
  const [obs, setObs] = useState('')
  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet product-sheet" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label={produto.nome}>
        <div className="ps-hero">
          <img src={produto.imagem} alt={produto.nome} />
          <button className="ps-close" onClick={onClose} aria-label="Fechar"><X size={20} /></button>
        </div>
        <div className="ps-body">
          <h3>{produto.nome}</h3>
          <p>{produto.descricao}</p>
          <span className="price big">{brl(produto.preco)}</span>
          <label className="field">
            <span><MessageSquareText size={16} /> Alguma observação? <em>(opcional)</em></span>
            <textarea
              value={obs}
              onChange={(e) => setObs(e.target.value)}
              placeholder="Ex.: sem cebola, bem assada"
              maxLength={120}
              rows={2}
            />
          </label>
        </div>
        <div className="ps-footer">
          <div className="qty">
            <button onClick={() => setQtd((q) => Math.max(1, q - 1))} aria-label="Diminuir" disabled={qtd === 1}><Minus size={18} /></button>
            <span aria-live="polite">{qtd}</span>
            <button onClick={() => setQtd((q) => q + 1)} aria-label="Aumentar"><Plus size={18} /></button>
          </div>
          <button className="btn btn-primary grow split" onClick={() => onAdd(qtd, obs.trim())}>
            <span>Adicionar</span>
            <span>{brl(produto.preco * qtd)}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
