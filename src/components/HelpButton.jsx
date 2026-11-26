import { useState } from 'react'
import { LOJA } from '../data/menu.js'

// Heurísticas 3 e 10: saída de emergência visível em todas as telas —
// falar com uma pessoa antes de desistir do pedido.
export default function HelpButton({ go, lifted }) {
  const [open, setOpen] = useState(false)
  const waLink = LOJA.whatsapp
    ? `https://wa.me/${LOJA.whatsapp}?text=${encodeURIComponent(
        'Olá! Quero falar com um atendente para fazer meu pedido.'
      )}`
    : null

  return (
    <>
      <button
        className={'help-fab' + (lifted ? ' lifted' : '')}
        onClick={() => setOpen(true)}
        aria-label="Precisa de ajuda? Falar com um atendente"
      >
        💬 <span>Ajuda</span>
      </button>
      {open && (
        <div className="sheet-backdrop" onClick={() => setOpen(false)}>
          <div className="sheet" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <h3>Precisa de ajuda com o pedido?</h3>
            <p>Você pode continuar pelo site ou falar com uma pessoa da nossa equipe.</p>
            {waLink ? (
              <a className="btn btn-whats" href={waLink} target="_blank" rel="noreferrer">
                Falar com um atendente no WhatsApp
              </a>
            ) : (
              <button
                className="btn btn-whats"
                onClick={() => {
                  setOpen(false)
                  go('whatsapp')
                }}
              >
                Falar com um atendente no WhatsApp
              </button>
            )}
            <ul className="help-tips">
              <li><strong>Não sabe o CEP?</strong> Não precisa: informe rua e bairro.</li>
              <li><strong>Sem cadastro:</strong> basta nome, telefone e endereço.</li>
              <li><strong>Errou um item?</strong> Na sacola você muda a quantidade ou remove.</li>
            </ul>
            <button className="btn btn-ghost" onClick={() => setOpen(false)}>
              Continuar pelo site
            </button>
          </div>
        </div>
      )}
    </>
  )
}
