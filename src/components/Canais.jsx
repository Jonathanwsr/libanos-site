import { useState } from 'react'

// Proposta: unificar os pontos de entrada com um único link (heurística 4).
export default function Canais({ go }) {
  const link = window.location.origin
  const [copiado, setCopiado] = useState(false)

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(link)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    } catch {
      /* navegador sem permissão de cópia */
    }
  }

  const compartilhar = () => {
    if (navigator.share) navigator.share({ title: 'Libanos Esfiharia', text: 'Peça suas esfihas por aqui:', url: link }).catch(() => {})
    else copiar()
  }

  const canais = [
    { icone: '📸', nome: 'Instagram', onde: 'Link na bio' },
    { icone: '🔎', nome: 'Google', onde: 'Botão “Pedir online” do perfil da loja' },
    { icone: '💬', nome: 'WhatsApp', onde: 'Mensagem automática + opção de atendente' },
  ]

  return (
    <div className="page canais">
      <h2>Um único link para todos os canais</h2>
      <p className="muted">
        Antes, cada canal levava a um caminho diferente. Agora Instagram, Google e WhatsApp apontam para o mesmo
        cardápio, com a mesma experiência.
      </p>

      <div className="link-box">
        <code>{link.replace(/^https?:\/\//, '')}</code>
        <div className="row">
          <button className="btn btn-primary" onClick={copiar}>{copiado ? '✓ Copiado' : 'Copiar link'}</button>
          <button className="btn btn-outline" onClick={compartilhar}>Compartilhar</button>
        </div>
      </div>

      <ul className="channel-list">
        {canais.map((c) => (
          <li key={c.nome}>
            <span className="ch-icon" aria-hidden>{c.icone}</span>
            <span>
              <strong>{c.nome}</strong>
              <small>{c.onde}</small>
            </span>
            <span className="ch-arrow" aria-hidden>→ mesmo link</span>
          </li>
        ))}
      </ul>

      <div className="row">
        <button className="btn btn-primary" onClick={() => go('')}>Abrir cardápio</button>
        <button className="btn btn-outline" onClick={() => go('whatsapp')}>Ver WhatsApp híbrido</button>
      </div>
    </div>
  )
}
