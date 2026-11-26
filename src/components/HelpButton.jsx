import { useState } from 'react'
import { MessageCircle, MapPin, UserCheck, Undo2 } from 'lucide-react'
import { LOJA } from '../data/menu.js'

// Heurísticas 3 e 10: saída de emergência visível em todas as telas —
// falar com uma pessoa antes de desistir do pedido.
export default function HelpButton({ go, lifted }) {
  const [open, setOpen] = useState(false)
  const waLink = LOJA.whatsapp
    ? `https://wa.me/${LOJA.whatsapp}?text=${encodeURIComponent('Olá! Quero falar com um atendente para fazer meu pedido.')}`
    : null

  return (
    <>
      <button
        className={'help-fab' + (lifted ? ' lifted' : '')}
        onClick={() => setOpen(true)}
        aria-label="Precisa de ajuda? Falar com um atendente"
      >
        <MessageCircle size={20} /> <span>Ajuda</span>
      </button>
      {open && (
        <div className="sheet-backdrop" onClick={() => setOpen(false)}>
          <div className="sheet help-sheet" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <span className="sheet-grip" />
            <h3>Precisa de ajuda com o pedido?</h3>
            <p>Continue pelo site ou fale com uma pessoa da nossa equipe.</p>
            {waLink ? (
              <a className="btn btn-whats" href={waLink} target="_blank" rel="noreferrer">
                <MessageCircle size={18} /> Falar com um atendente
              </a>
            ) : (
              <button className="btn btn-whats" onClick={() => { setOpen(false); go('whatsapp') }}>
                <MessageCircle size={18} /> Falar com um atendente
              </button>
            )}
            <ul className="help-tips">
              <li><MapPin size={18} /><span><strong>Não sabe o CEP?</strong> Não precisa: informe rua e bairro.</span></li>
              <li><UserCheck size={18} /><span><strong>Sem cadastro:</strong> basta nome, telefone e endereço.</span></li>
              <li><Undo2 size={18} /><span><strong>Errou um item?</strong> Na sacola você muda a quantidade ou desfaz.</span></li>
            </ul>
            <button className="btn btn-ghost" onClick={() => setOpen(false)}>Continuar pelo site</button>
          </div>
        </div>
      )}
    </>
  )
}
