import { useState } from 'react'
import { UserPlus, LogIn, LogOut, Trash2, ShieldCheck, Pencil, Check } from 'lucide-react'
import AddressForm from './AddressForm.jsx'

export const mascaraTel = (v) => {
  const d = v.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 2) return d.length ? `(${d}` : ''
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}
const soDigitos = (t) => (t || '').replace(/\D/g, '')

/**
 * Cadastro OPCIONAL (proposta do TCC): pedir não exige conta.
 * Sem backend — os dados ficam somente neste aparelho (localStorage).
 * Pede só o mínimo (LGPD, princípio da necessidade): nome e telefone;
 * e-mail e endereço são opcionais.
 */
export default function Conta({ conta, contas, onSalvar, onEntrar, onSair, onApagar, go, showToast }) {
  const [aba, setAba] = useState(contas.length ? 'entrar' : 'cadastrar')
  const [editando, setEditando] = useState(false)
  const [form, setForm] = useState(() => conta || { nome: '', telefone: '', email: '', endereco: {} })
  const [telLogin, setTelLogin] = useState('')
  const [erros, setErros] = useState({})

  const set = (patch) => setForm((f) => ({ ...f, ...patch }))

  const validar = () => {
    const e = {}
    if ((form.nome || '').trim().length < 2) e.nome = 'Digite seu nome (pelo menos 2 letras).'
    if (soDigitos(form.telefone).length < 10) e.telefone = 'Digite o telefone com DDD, ex.: (81) 99999-0000.'
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'E-mail inválido. Confira ou deixe em branco — ele é opcional.'
    setErros(e)
    return !Object.keys(e).length
  }

  const salvar = () => {
    if (!validar()) return
    onSalvar({ ...form, nome: form.nome.trim(), tipo: form.endereco?.rua ? 'entrega' : form.tipo || 'entrega' })
    setEditando(false)
    showToast(conta ? 'Dados atualizados' : 'Cadastro criado! Seus dados já vêm preenchidos no próximo pedido')
  }

  const entrar = () => {
    const achada = contas.find((c) => soDigitos(c.telefone) === soDigitos(telLogin))
    if (!achada) {
      setErros({
        login: 'Não encontramos cadastro com esse telefone neste aparelho. Crie um cadastro rapidinho — ou faça seu pedido sem conta.',
      })
      return
    }
    setErros({})
    onEntrar(achada)
    setForm(achada)
    showToast(`Bem-vindo(a) de volta, ${achada.nome.split(' ')[0]}!`)
  }

  // ---------- Logado ----------
  if (conta && !editando) {
    const e = conta.endereco || {}
    return (
      <div className="page conta narrow">
        <h2 className="page-title">Minha conta</h2>
        <div className="panel profile">
          <div className="avatar">{conta.nome.charAt(0).toUpperCase()}</div>
          <div className="profile-info">
            <strong>{conta.nome}</strong>
            <span>{conta.telefone}</span>
            {conta.email && <span>{conta.email}</span>}
          </div>
          <button className="icon-btn" onClick={() => { setForm(conta); setEditando(true) }} aria-label="Editar dados">
            <Pencil size={18} />
          </button>
        </div>
        <div className="panel">
          <h4>Endereço salvo</h4>
          {e.rua ? (
            <p className="muted">
              {e.rua}, {e.semNumero ? 'S/N' : e.numero}{e.complemento ? ` — ${e.complemento}` : ''}<br />
              {e.bairro === 'Outro bairro' && e.bairroOutro ? e.bairroOutro : e.bairro}
            </p>
          ) : (
            <p className="muted">Nenhum endereço salvo. Você pode informar no próximo pedido.</p>
          )}
        </div>
        <div className="row">
          <button className="btn btn-primary" onClick={() => go('')}>Fazer pedido</button>
          <button className="btn btn-ghost" onClick={() => go('pedidos')}>Meus pedidos</button>
        </div>
        <div className="row">
          <button className="btn btn-ghost" onClick={onSair}><LogOut size={16} /> Sair</button>
          <button className="btn btn-ghost danger" onClick={onApagar}><Trash2 size={16} /> Apagar meus dados</button>
        </div>
        <p className="privacy"><ShieldCheck size={16} /> Seus dados ficam só neste aparelho e são usados apenas para seus pedidos.</p>
      </div>
    )
  }

  // ---------- Formulário de cadastro / edição ----------
  const formulario = (
    <div className="panel form-panel">
      <label className="field">
        <span>Nome *</span>
        <input value={form.nome} onChange={(e) => set({ nome: e.target.value })} placeholder="Como podemos te chamar?" autoComplete="name" aria-invalid={!!erros.nome} />
        {erros.nome && <small className="err">{erros.nome}</small>}
      </label>
      <label className="field">
        <span>Telefone / WhatsApp *</span>
        <input value={form.telefone} onChange={(e) => set({ telefone: mascaraTel(e.target.value) })} placeholder="(81) 99999-0000" inputMode="tel" autoComplete="tel" aria-invalid={!!erros.telefone} />
        {erros.telefone && <small className="err">{erros.telefone}</small>}
      </label>
      <label className="field">
        <span>E-mail <em>(opcional)</em></span>
        <input value={form.email || ''} onChange={(e) => set({ email: e.target.value })} placeholder="voce@email.com" inputMode="email" autoComplete="email" aria-invalid={!!erros.email} />
        {erros.email && <small className="err">{erros.email}</small>}
      </label>
      <details className="addr-details" open={!!form.endereco?.rua}>
        <summary>Salvar um endereço de entrega <em>(opcional)</em></summary>
        <AddressForm value={form.endereco || {}} onChange={(endereco) => set({ endereco })} errors={{}} />
      </details>
      <button className="btn btn-primary" onClick={salvar}>
        {conta ? <><Check size={18} /> Salvar alterações</> : <><UserPlus size={18} /> Criar cadastro</>}
      </button>
      {conta && <button className="btn btn-ghost" onClick={() => setEditando(false)}>Cancelar</button>}
      <p className="privacy"><ShieldCheck size={16} /> Sem senha e sem SMS. Pedimos só o necessário (LGPD).</p>
    </div>
  )

  if (editando) {
    return (
      <div className="page conta narrow">
        <h2 className="page-title">Editar dados</h2>
        {formulario}
      </div>
    )
  }

  return (
    <div className="page conta narrow">
      <h2 className="page-title">Entrar ou cadastrar</h2>
      <div className="notice">
        <strong>O cadastro é opcional.</strong> Você pode fazer seu pedido sem conta — o cadastro só serve para
        preencher seus dados automaticamente da próxima vez.
        <button className="link-btn" onClick={() => go('')}>Pedir sem cadastro</button>
      </div>

      <div className="seg">
        <button className={aba === 'entrar' ? 'on' : ''} onClick={() => { setAba('entrar'); setErros({}) }}>
          <LogIn size={16} /> Entrar
        </button>
        <button className={aba === 'cadastrar' ? 'on' : ''} onClick={() => { setAba('cadastrar'); setErros({}) }}>
          <UserPlus size={16} /> Criar cadastro
        </button>
      </div>

      {aba === 'entrar' ? (
        <div className="panel form-panel">
          <label className="field">
            <span>Seu telefone</span>
            <input value={telLogin} onChange={(e) => setTelLogin(mascaraTel(e.target.value))} placeholder="(81) 99999-0000" inputMode="tel" autoComplete="tel" onKeyDown={(e) => e.key === 'Enter' && entrar()} />
          </label>
          {erros.login && (
            <p className="msg msg-erro">
              {erros.login}{' '}
              <button className="link-btn" onClick={() => { setAba('cadastrar'); set({ telefone: telLogin }); setErros({}) }}>Criar cadastro</button>
            </p>
          )}
          <button className="btn btn-primary" onClick={entrar}><LogIn size={18} /> Entrar</button>
        </div>
      ) : (
        formulario
      )}
    </div>
  )
}
