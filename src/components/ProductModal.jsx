import { useState } from 'react'
import { brl } from '../data/menu.js'

export default function ProductModal({ produto, onClose, onAdd }) {
  const [qtd, setQtd] = useState(1)
  const [obs, setObs] = useState('')
  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="modal-photo" aria-hidden>
          {produto.emoji}
        </div>
        <h3>{produto.nome}</h3>
        <p>{produto.descricao}</p>
        <p className="price big">{brl(produto.preco)} cada</p>
        <label className="field">
          <span>Alguma observação? (opcional)</span>
          <input
            value={obs}
            onChange={(e) => setObs(e.target.value)}
            placeholder="Ex.: sem cebola, bem passada"
            maxLength={120}
          />
        </label>
        <div className="qty-row">
          <div className="qty">
            <button onClick={() => setQtd((q) => Math.max(1, q - 1))} aria-label="Diminuir">−</button>
            <span aria-live="polite">{qtd}</span>
            <button onClick={() => setQtd((q) => q + 1)} aria-label="Aumentar">+</button>
          </div>
          <button className="btn btn-primary grow" onClick={() => onAdd(qtd, obs.trim())}>
            Adicionar · {brl(produto.preco * qtd)}
          </button>
        </div>
        <button className="btn btn-ghost" onClick={onClose}>
          Voltar ao cardápio
        </button>
      </div>
    </div>
  )
}
