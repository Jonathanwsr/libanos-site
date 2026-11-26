import { LOJA } from '../data/menu.js'

export default function Header({ go, route }) {
  const isHome = route === '' || route === 'menu'
  return (
    <header className="header">
      <div className="header-inner">
        {!isHome && (
          <button className="back-btn" onClick={() => go('')} aria-label="Voltar ao cardápio">
            ← Cardápio
          </button>
        )}
        <button className="brand" onClick={() => go('')}>
          <span className="brand-logo" aria-hidden>L</span>
          <span>
            <strong>{LOJA.nome}</strong>
            <small>{LOJA.unidade}</small>
          </span>
        </button>
      </div>
    </header>
  )
}
