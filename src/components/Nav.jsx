import { Home, BadgePercent, ShoppingBag, User } from 'lucide-react'

const ITENS = [
  { id: '', label: 'Início', Icon: Home },
  { id: 'promocoes', label: 'Promoções', Icon: BadgePercent },
  { id: 'pedidos', label: 'Pedidos', Icon: ShoppingBag },
  { id: 'conta', label: 'Entrar/Cadastrar', curto: 'Conta', Icon: User },
]

// Desktop: barra vermelha no topo. Celular: barra fixa inferior.
export default function Nav({ route, go, conta }) {
  const ativo = route === 'menu' ? '' : route
  return (
    <nav className="mainnav" aria-label="Navegação principal">
      <div className="mainnav-inner">
        {ITENS.map(({ id, label, curto, Icon }) => {
          const texto = id === 'conta' && conta ? conta.nome.split(' ')[0] : label
          return (
            <button
              key={id || 'inicio'}
              className={'nav-item' + (ativo === id ? ' active' : '')}
              onClick={() => go(id)}
              aria-current={ativo === id ? 'page' : undefined}
            >
              <Icon size={20} />
              <span className="lbl-long">{texto}</span>
              <span className="lbl-short">{conta && id === 'conta' ? texto : curto || label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
