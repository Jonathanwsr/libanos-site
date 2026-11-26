import { useEffect, useRef, useState } from 'react'
import { LOJA } from '../data/menu.js'

const LINK = typeof window !== 'undefined' ? window.location.origin : ''

const boasVindas = () => ({
  de: 'loja',
  texto:
    `Olá! 👋 Bem-vindo(a) à *${LOJA.nome}*.\n\n` +
    `Para pedir rapidinho, use nosso cardápio:\n🔗 ${LINK}\n\n` +
    `Prefere falar com uma pessoa?\n*Digite 1* para falar com um atendente.`,
})

// Demonstração do atendimento híbrido proposto (prioridade alta no TCC):
// mantém o link automático, mas oferece a opção "digite 1" para atendimento humano.
export default function WhatsAppDemo({ go }) {
  const [msgs, setMsgs] = useState([])
  const [txt, setTxt] = useState('')
  const [modoHumano, setModoHumano] = useState(false)
  const fim = useRef(null)

  useEffect(() => {
    fim.current?.scrollIntoView({ behavior: 'smooth' })
  }, [msgs])

  const responder = (entrada) => {
    const t = entrada.trim().toLowerCase()
    if (modoHumano) {
      return {
        de: 'loja',
        texto: 'Anotado! 📝 Um atendente já está vendo sua mensagem e vai continuar seu pedido por aqui mesmo.',
      }
    }
    if (t === '1' || t.includes('atendente') || t.includes('pessoa') || t.includes('humano')) {
      setModoHumano(true)
      return {
        de: 'loja',
        texto:
          '👩‍🍳 Certo! Você será atendido(a) por uma pessoa da nossa equipe.\n\n' +
          'Pode mandar seu pedido do seu jeito, por texto ou áudio. Ex.: "10 esfihas de carne e 1 guaraná, entrega no Centro".\n\n' +
          '(Se mudar de ideia, o cardápio continua aqui: ' + LINK + ')',
      }
    }
    return boasVindas()
  }

  const enviar = (texto) => {
    const v = (texto ?? txt).trim()
    if (!v) return
    const nova = [...msgs, { de: 'cliente', texto: v }]
    setMsgs(nova)
    setTxt('')
    setTimeout(() => setMsgs((m) => [...m, responder(v)]), 700)
  }

  const reiniciar = () => {
    setMsgs([])
    setModoHumano(false)
  }

  const formatar = (s) =>
    s.split('\n').map((linha, i) => (
      <span key={i}>
        {linha.split(/(\*[^*]+\*)/g).map((parte, j) =>
          parte.startsWith('*') && parte.endsWith('*') ? <strong key={j}>{parte.slice(1, -1)}</strong> : parte
        )}
        <br />
      </span>
    ))

  return (
    <div className="page wa">
      <div className="wa-intro">
        <h2>Simulação: atendimento híbrido no WhatsApp</h2>
        <p className="muted">
          Proposta do TCC: o WhatsApp continua enviando o link automático, mas agora oferece{' '}
          <strong>“digite 1 para falar com um atendente”</strong>. Mande qualquer mensagem para testar.
        </p>
      </div>

      <div className="wa-phone">
        <div className="wa-top">
          <span className="wa-avatar">L</span>
          <div>
            <strong>{LOJA.nome}</strong>
            <small>{modoHumano ? 'Atendente online' : 'Conta comercial'}</small>
          </div>
          <button className="wa-reset" onClick={reiniciar} title="Reiniciar conversa">↺</button>
        </div>
        <div className="wa-chat">
          {msgs.length === 0 && <p className="wa-hint">Toque em “Oi” ou escreva uma mensagem abaixo.</p>}
          {msgs.map((m, i) => (
            <div key={i} className={'bubble ' + m.de}>
              {formatar(m.texto)}
            </div>
          ))}
          <div ref={fim} />
        </div>
        <div className="wa-quick">
          {msgs.length === 0 ? (
            <button onClick={() => enviar('Oi, boa noite!')}>Oi, boa noite!</button>
          ) : !modoHumano ? (
            <>
              <button onClick={() => enviar('1')}>1</button>
              <button onClick={() => go('')}>Abrir cardápio</button>
            </>
          ) : null}
        </div>
        <form
          className="wa-input"
          onSubmit={(e) => {
            e.preventDefault()
            enviar()
          }}
        >
          <input value={txt} onChange={(e) => setTxt(e.target.value)} placeholder="Mensagem" aria-label="Mensagem" />
          <button type="submit" aria-label="Enviar">➤</button>
        </form>
      </div>
    </div>
  )
}
