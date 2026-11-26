import { useState } from 'react'
import { BAIRROS, LOJA, brl } from '../data/menu.js'
import AddressForm from './AddressForm.jsx'

const ETAPAS = ['Sacola', 'Entrega', 'Seus dados', 'Revisar']

const mascaraTel = (v) => {
  const d = v.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 2) return d.length ? `(${d}` : ''
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}

export default function Checkout({ cart, subtotal, changeQty, removeLine, clearCart, savedCustomer, onPlace, go }) {
  const [etapa, setEtapa] = useState(0)
  const [tipo, setTipo] = useState(savedCustomer?.tipo || 'entrega')
  const [endereco, setEndereco] = useState(savedCustomer?.endereco || {})
  const [nome, setNome] = useState(savedCustomer?.nome || '')
  const [telefone, setTelefone] = useState(savedCustomer?.telefone || '')
  const [pagamento, setPagamento] = useState('pix')
  const [troco, setTroco] = useState('')
  const [erros, setErros] = useState({})

  const taxa = tipo === 'entrega' ? BAIRROS.find((b) => b.nome === endereco.bairro)?.taxa ?? null : 0
  const total = subtotal + (taxa ?? 0)

  if (!cart.length && etapa === 0) {
    return (
      <div className="page empty">
        <div className="empty-icon" aria-hidden>🛍️</div>
        <h2>Sua sacola está vazia</h2>
        <p>Escolha suas esfihas no cardápio e elas aparecem aqui.</p>
        <button className="btn btn-primary" onClick={() => go('')}>Ver cardápio</button>
      </div>
    )
  }

  // ---- Validação com mensagens que dizem o que fazer (H9) ----
  const validar = (e) => {
    const er = {}
    if (e === 0 && subtotal < LOJA.pedidoMinimo)
      er.minimo = `O pedido mínimo é ${brl(LOJA.pedidoMinimo)}. Faltam ${brl(LOJA.pedidoMinimo - subtotal)} — adicione mais um item.`
    if (e === 1 && tipo === 'entrega') {
      if (!endereco.rua?.trim()) er.rua = 'Digite o nome da rua (ou use “Usar minha localização”).'
      if (!endereco.semNumero && !endereco.numero?.trim()) er.numero = 'Digite o número da casa ou marque “Sem número”.'
      if (!endereco.bairro) er.bairro = 'Escolha o bairro na lista. Se não achar, escolha “Outro bairro”.'
    }
    if (e === 2) {
      if (nome.trim().length < 2) er.nome = 'Digite seu nome para sabermos de quem é o pedido.'
      const d = telefone.replace(/\D/g, '')
      if (d.length < 10) er.telefone = 'Digite o telefone com DDD, ex.: (81) 99999-0000. Usamos só para falar sobre este pedido.'
      if (pagamento === 'dinheiro' && troco) {
        const v = Number(troco.replace(',', '.'))
        if (isNaN(v) || v < total) er.troco = `O troco deve ser para um valor maior que ${brl(total)}. Deixe em branco se não precisar.`
      }
    }
    setErros(er)
    return Object.keys(er).length === 0
  }

  const avancar = () => {
    if (!validar(etapa)) return
    setEtapa((s) => Math.min(s + 1, ETAPAS.length - 1))
    window.scrollTo(0, 0)
  }
  const voltar = () => {
    setErros({})
    if (etapa === 0) go('')
    else setEtapa((s) => s - 1)
    window.scrollTo(0, 0)
  }

  const confirmar = () => {
    onPlace({
      tipo,
      endereco: tipo === 'entrega' ? endereco : null,
      nome: nome.trim(),
      telefone,
      pagamento,
      troco: pagamento === 'dinheiro' ? troco : '',
    })
  }

  const nomePag = { pix: 'Pix', cartao: 'Cartão na entrega', dinheiro: 'Dinheiro' }

  return (
    <div className="page checkout">
      {/* Indicador de etapas (H1 visibilidade do status) */}
      <ol className="stepper" aria-label="Etapas do pedido">
        {ETAPAS.map((n, i) => (
          <li key={n} className={i < etapa ? 'done' : i === etapa ? 'current' : ''} aria-current={i === etapa ? 'step' : undefined}>
            <span className="dot">{i < etapa ? '✓' : i + 1}</span>
            <span className="label">{n}</span>
          </li>
        ))}
      </ol>

      {etapa === 0 && (
        <section>
          <div className="section-head">
            <h2>Sua sacola</h2>
            <button className="link-btn danger" onClick={clearCart}>Esvaziar</button>
          </div>
          <ul className="cart-list">
            {cart.map((l) => (
              <li key={l.key}>
                <img className="cart-photo" src={`/img/${l.produto.id}.jpg`} alt="" />
                <span className="cart-text">
                  <strong>{l.produto.nome}</strong>
                  {l.obs && <small>Obs.: {l.obs}</small>}
                  <small>{brl(l.produto.preco)} cada</small>
                </span>
                <span className="cart-actions">
                  <span className="qty small">
                    <button onClick={() => changeQty(l.key, -1)} aria-label="Diminuir">−</button>
                    <span>{l.qtd}</span>
                    <button onClick={() => changeQty(l.key, 1)} aria-label="Aumentar">+</button>
                  </span>
                  <strong>{brl(l.produto.preco * l.qtd)}</strong>
                  <button className="link-btn danger" onClick={() => removeLine(l.key)}>Remover</button>
                </span>
              </li>
            ))}
          </ul>
          <button className="btn btn-ghost" onClick={() => go('')}>+ Adicionar mais itens</button>
          {erros.minimo && <p className="msg msg-erro">{erros.minimo}</p>}
        </section>
      )}

      {etapa === 1 && (
        <section>
          <h2>Como quer receber?</h2>
          <div className="toggle">
            <button className={tipo === 'entrega' ? 'on' : ''} onClick={() => setTipo('entrega')}>
              🛵 Entrega
              <small>{LOJA.tempoEntrega}</small>
            </button>
            <button className={tipo === 'retirada' ? 'on' : ''} onClick={() => setTipo('retirada')}>
              🏪 Retirar na loja
              <small>Sem taxa</small>
            </button>
          </div>
          {tipo === 'entrega' ? (
            <AddressForm value={endereco} onChange={setEndereco} errors={erros} />
          ) : (
            <p className="msg msg-info">
              Retire na Libanos Esfiharia — {LOJA.unidade}. Avisaremos quando estiver pronto.
            </p>
          )}
        </section>
      )}

      {etapa === 2 && (
        <section>
          <h2>Seus dados</h2>
          <p className="muted">
            Não precisa criar conta nem senha. Pedimos só o essencial para o pedido chegar até você.
          </p>
          <label className="field">
            <span>Nome *</span>
            <input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Como podemos te chamar?" autoComplete="name" aria-invalid={!!erros.nome} />
            {erros.nome && <small className="err">{erros.nome}</small>}
          </label>
          <label className="field">
            <span>Telefone / WhatsApp *</span>
            <input
              value={telefone}
              onChange={(e) => setTelefone(mascaraTel(e.target.value))}
              placeholder="(81) 99999-0000"
              inputMode="tel"
              autoComplete="tel"
              aria-invalid={!!erros.telefone}
            />
            {erros.telefone && <small className="err">{erros.telefone}</small>}
          </label>

          <h2>Pagamento</h2>
          <p className="muted">Você paga na entrega ou na retirada.</p>
          <div className="options">
            {Object.entries(nomePag).map(([k, n]) => (
              <label key={k} className={'option' + (pagamento === k ? ' on' : '')}>
                <input type="radio" name="pag" checked={pagamento === k} onChange={() => setPagamento(k)} />
                {k === 'pix' ? '⚡' : k === 'cartao' ? '💳' : '💵'} {n}
              </label>
            ))}
          </div>
          {pagamento === 'dinheiro' && (
            <label className="field">
              <span>Troco para quanto? (opcional)</span>
              <input value={troco} onChange={(e) => setTroco(e.target.value)} placeholder="Ex.: 50" inputMode="decimal" />
              {erros.troco && <small className="err">{erros.troco}</small>}
            </label>
          )}
        </section>
      )}

      {etapa === 3 && (
        <section>
          <h2>Revise seu pedido</h2>
          <div className="review">
            <div>
              <h4>Itens <button className="link-btn" onClick={() => setEtapa(0)}>Alterar</button></h4>
              <ul>
                {cart.map((l) => (
                  <li key={l.key}>{l.qtd}× {l.produto.nome}{l.obs ? ` (${l.obs})` : ''} — {brl(l.produto.preco * l.qtd)}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4>{tipo === 'entrega' ? 'Entrega' : 'Retirada'} <button className="link-btn" onClick={() => setEtapa(1)}>Alterar</button></h4>
              {tipo === 'entrega' ? (
                <p>
                  {endereco.rua}, {endereco.semNumero ? 'S/N' : endereco.numero}
                  {endereco.complemento ? ` — ${endereco.complemento}` : ''}<br />
                  {endereco.bairro === 'Outro bairro' && endereco.bairroOutro ? endereco.bairroOutro : endereco.bairro}
                  {endereco.referencia ? <><br />Ref.: {endereco.referencia}</> : null}
                </p>
              ) : (
                <p>{LOJA.unidade}</p>
              )}
            </div>
            <div>
              <h4>Contato e pagamento <button className="link-btn" onClick={() => setEtapa(2)}>Alterar</button></h4>
              <p>{nome} · {telefone}<br />{nomePag[pagamento]}{pagamento === 'dinheiro' && troco ? ` (troco para ${brl(Number(troco.replace(',', '.')))})` : ''}</p>
            </div>
          </div>
        </section>
      )}

      {/* Resumo sempre visível (H6 reconhecimento em vez de memorização) */}
      <aside className="summary" aria-label="Resumo do pedido">
        <div><span>Subtotal</span><span>{brl(subtotal)}</span></div>
        <div>
          <span>Entrega</span>
          <span>{tipo === 'retirada' ? 'Grátis (retirada)' : taxa === null ? 'Escolha o bairro' : brl(taxa)}</span>
        </div>
        <div className="total"><span>Total</span><span>{brl(total)}</span></div>
      </aside>

      <div className="checkout-actions">
        <button className="btn btn-ghost" onClick={voltar}>← Voltar</button>
        {etapa < ETAPAS.length - 1 ? (
          <button className="btn btn-primary grow" onClick={avancar}>Continuar</button>
        ) : (
          <button className="btn btn-primary grow" onClick={confirmar}>Confirmar pedido · {brl(total)}</button>
        )}
      </div>
    </div>
  )
}
