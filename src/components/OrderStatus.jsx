import { useEffect, useState } from 'react'
import { brl } from '../data/menu.js'
import { useCatalogo } from '../catalogo.jsx'
import { Check } from 'lucide-react'

// Status simulado: avança com o tempo para demonstrar a heurística 1.
const PASSOS = [
  { t: 0, nome: 'Pedido recebido', desc: 'A loja recebeu seu pedido.' },
  { t: 20, nome: 'Em preparo', desc: 'Suas esfihas estão no forno.' },
  { t: 50, nome: 'Saiu para entrega', desc: 'O entregador está a caminho.', retirada: 'Pronto para retirada' },
  { t: 90, nome: 'Entregue', desc: 'Bom apetite!', retirada: 'Retirado' },
]

export default function OrderStatus({ pedido, savedCustomer, onSaveCustomer, go }) {
  const { produtos: PRODUTOS } = useCatalogo()
  const [agora, setAgora] = useState(Date.now())
  const [salvo, setSalvo] = useState(Boolean(savedCustomer))

  useEffect(() => {
    const i = setInterval(() => setAgora(Date.now()), 1000)
    return () => clearInterval(i)
  }, [])

  if (!pedido) {
    return (
      <div className="page empty">
        <h2>Nenhum pedido em andamento</h2>
        <button className="btn btn-primary" onClick={() => go('')}>Ver cardápio</button>
      </div>
    )
  }

  const seg = (agora - pedido.criadoEm) / 1000
  const atual = PASSOS.reduce((acc, p, i) => (seg >= p.t ? i : acc), 0)
  const retirada = pedido.tipo === 'retirada'

  return (
    <div className="page order">
      <div className="order-hero">
        <div className="check" aria-hidden><Check size={30} strokeWidth={3} /></div>
        <h2>Pedido #{pedido.numero} confirmado!</h2>
        <p>Obrigado, {pedido.nome.split(' ')[0]}. Acompanhe abaixo — a tela atualiza sozinha.</p>
        <small className="muted">(Demonstração: o status avança automaticamente em segundos.)</small>
      </div>

      <ol className="timeline">
        {PASSOS.map((p, i) => (
          <li key={p.nome} className={i < atual ? 'done' : i === atual ? 'current' : ''}>
            <span className="dot" />
            <div>
              <strong>{retirada && p.retirada ? p.retirada : p.nome}</strong>
              {i === atual && <small>{retirada && i >= 2 ? 'Pode vir buscar na loja.' : p.desc}</small>}
            </div>
          </li>
        ))}
      </ol>

      <div className="review">
        <h4>Resumo</h4>
        <ul>
          {pedido.itens.map((l, i) => {
            const p = PRODUTOS.find((x) => x.id === l.id)
            return <li key={i}>{l.qtd}× {p?.nome}{l.obs ? ` (${l.obs})` : ''}</li>
          })}
        </ul>
        <p><strong>Total: {brl(pedido.total)}</strong>{pedido.taxa ? ` (inclui entrega ${brl(pedido.taxa)})` : ''}</p>
      </div>

      {/* Cadastro OPCIONAL, oferecido só depois do pedido feito */}
      {!salvo ? (
        <div className="optin">
          <h4>Quer agilizar o próximo pedido?</h4>
          <p>Podemos guardar seu nome, telefone e endereço <strong>neste celular</strong>. É opcional, sem senha, e você pode apagar quando quiser.</p>
          <div className="row">
            <button
              className="btn btn-primary"
              onClick={() => {
                onSaveCustomer({ nome: pedido.nome, telefone: pedido.telefone, tipo: pedido.tipo, endereco: pedido.endereco || {} })
                setSalvo(true)
              }}
            >
              Sim, salvar meus dados
            </button>
            <button className="btn btn-ghost" onClick={() => setSalvo(true)}>Agora não</button>
          </div>
        </div>
      ) : savedCustomer ? (
        <p className="msg msg-ok">
          Seus dados estão salvos neste celular.{' '}
          <button className="link-btn" onClick={() => onSaveCustomer(null)}>Apagar meus dados</button>
        </p>
      ) : null}

      <button className="btn btn-outline" onClick={() => go('')}>Voltar ao cardápio</button>
    </div>
  )
}
