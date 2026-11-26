import { useEffect, useRef, useState } from 'react'
import { BAIRROS, brl } from '../data/menu.js'
import { LocateFixed } from 'lucide-react'

const CIDADE = 'Vitória de Santo Antão'
const UF = 'PE'

const norm = (s = '') =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim()

// Tenta casar o bairro retornado pelas APIs com a lista de bairros atendidos.
function casarBairro(nome) {
  if (!nome) return null
  const n = norm(nome)
  return BAIRROS.find((b) => norm(b.nome) === n || n.includes(norm(b.nome)))?.nome ?? null
}

const mascaraCep = (v) => {
  const d = v.replace(/\D/g, '').slice(0, 8)
  return d.length > 5 ? d.slice(0, 5) + '-' + d.slice(5) : d
}

/**
 * Endereço sem CEP obrigatório (heurísticas 5, 6 e 9):
 *  - CEP é opcional; se informado, preenche rua e bairro automaticamente.
 *  - Busca pelo nome da rua (sugestões enquanto digita).
 *  - "Usar minha localização" do celular.
 *  - Mensagens de erro dizem o problema E o que fazer.
 */
export default function AddressForm({ value, onChange, errors }) {
  const set = (patch) => onChange({ ...value, ...patch })
  const [cepMsg, setCepMsg] = useState(null)
  const [geoMsg, setGeoMsg] = useState(null)
  const [sugestoes, setSugestoes] = useState([])
  const [buscandoRua, setBuscandoRua] = useState(false)
  const [mostrarCep, setMostrarCep] = useState(Boolean(value.cep))
  const ultimaBusca = useRef('')

  const aplicarBairro = (nomeApi) => {
    const casado = casarBairro(nomeApi)
    return casado
      ? { bairro: casado, bairroOutro: '' }
      : nomeApi
        ? { bairro: 'Outro bairro', bairroOutro: nomeApi }
        : {}
  }

  // ---- CEP opcional via ViaCEP ----
  const buscarCep = async (cep) => {
    const d = cep.replace(/\D/g, '')
    if (d.length !== 8) return
    setCepMsg({ tipo: 'info', txt: 'Buscando endereço do CEP…' })
    try {
      const r = await fetch(`https://viacep.com.br/ws/${d}/json/`)
      const j = await r.json()
      if (j.erro) {
        setCepMsg({
          tipo: 'erro',
          txt: 'CEP não encontrado. Sem problema: apague o CEP e digite o nome da rua e o bairro abaixo.',
        })
        return
      }
      if (norm(j.localidade) !== norm(CIDADE)) {
        setCepMsg({
          tipo: 'erro',
          txt: `Esse CEP é de ${j.localidade}-${j.uf}. Entregamos apenas em ${CIDADE}. Confira o número ou informe rua e bairro.`,
        })
        return
      }
      onChange({ ...value, cep: mascaraCep(d), rua: j.logradouro || value.rua, ...aplicarBairro(j.bairro) })
      setCepMsg({ tipo: 'ok', txt: 'Endereço encontrado! Confira e informe o número da casa.' })
    } catch {
      setCepMsg({
        tipo: 'erro',
        txt: 'Não conseguimos consultar o CEP agora (sem internet?). Você pode seguir preenchendo rua e bairro normalmente.',
      })
    }
  }

  // ---- Busca por nome da rua (ViaCEP por logradouro) ----
  useEffect(() => {
    const q = value.rua?.trim() ?? ''
    if (q.length < 3 || q === ultimaBusca.current) {
      setSugestoes([])
      return
    }
    const t = setTimeout(async () => {
      setBuscandoRua(true)
      try {
        const r = await fetch(
          `https://viacep.com.br/ws/${UF}/${encodeURIComponent(CIDADE)}/${encodeURIComponent(q)}/json/`
        )
        const j = await r.json()
        if (Array.isArray(j)) {
          const unicos = []
          const vistos = new Set()
          for (const e of j) {
            const k = e.logradouro + '|' + e.bairro
            if (!vistos.has(k)) {
              vistos.add(k)
              unicos.push(e)
            }
          }
          setSugestoes(unicos.slice(0, 6))
        }
      } catch {
        setSugestoes([])
      } finally {
        setBuscandoRua(false)
      }
    }, 450)
    return () => clearTimeout(t)
  }, [value.rua])

  const escolherSugestao = (s) => {
    ultimaBusca.current = s.logradouro
    setSugestoes([])
    onChange({ ...value, rua: s.logradouro, cep: s.cep, ...aplicarBairro(s.bairro) })
  }

  // ---- Localização do celular ----
  const usarLocalizacao = () => {
    if (!navigator.geolocation) {
      setGeoMsg({ tipo: 'erro', txt: 'Seu aparelho não permite usar a localização. Digite rua e bairro abaixo.' })
      return
    }
    setGeoMsg({ tipo: 'info', txt: 'Pegando sua localização…' })
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords
        try {
          const r = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&accept-language=pt-BR&lat=${latitude}&lon=${longitude}`
          )
          const j = await r.json()
          const a = j.address || {}
          const bairroApi = a.suburb || a.neighbourhood || a.quarter || a.city_district || ''
          ultimaBusca.current = a.road || ''
          onChange({
            ...value,
            rua: a.road || value.rua,
            numero: a.house_number || value.numero,
            cep: a.postcode ? mascaraCep(a.postcode) : value.cep,
            ...aplicarBairro(bairroApi),
            coords: { lat: latitude, lng: longitude },
          })
          setGeoMsg({
            tipo: 'ok',
            txt: 'Localização encontrada! Confira a rua, o número e o bairro — se algo estiver errado, é só corrigir.',
          })
        } catch {
          onChange({ ...value, coords: { lat: latitude, lng: longitude } })
          setGeoMsg({
            tipo: 'info',
            txt: 'Salvamos sua localização no mapa para o entregador, mas não conseguimos ler o nome da rua. Digite rua e bairro abaixo.',
          })
        }
      },
      (err) => {
        setGeoMsg({
          tipo: 'erro',
          txt:
            err.code === 1
              ? 'Você não permitiu o acesso à localização. Tudo bem: digite rua e bairro abaixo.'
              : 'Não foi possível achar sua localização agora. Digite rua e bairro abaixo.',
        })
      },
      { enableHighAccuracy: true, timeout: 12000 }
    )
  }

  const taxa = BAIRROS.find((b) => b.nome === value.bairro)?.taxa

  return (
    <div className="address">
      <button type="button" className="btn btn-outline" onClick={usarLocalizacao}>
        <LocateFixed size={18} /> Usar minha localização
      </button>
      {geoMsg && <p className={'msg msg-' + geoMsg.tipo}>{geoMsg.txt}</p>}

      <div className="divider"><span>ou digite o endereço</span></div>

      <label className="field autocomplete">
        <span>Rua *</span>
        <input
          value={value.rua || ''}
          onChange={(e) => set({ rua: e.target.value })}
          placeholder="Comece a digitar o nome da rua"
          autoComplete="address-line1"
          aria-invalid={!!errors.rua}
        />
        {buscandoRua && <small className="hint">Procurando ruas…</small>}
        {sugestoes.length > 0 && (
          <ul className="suggestions" role="listbox">
            {sugestoes.map((s) => (
              <li key={s.cep + s.logradouro}>
                <button type="button" onClick={() => escolherSugestao(s)}>
                  <strong>{s.logradouro}</strong>
                  <small>{s.bairro || 'Bairro não informado'}</small>
                </button>
              </li>
            ))}
          </ul>
        )}
        {errors.rua && <small className="err">{errors.rua}</small>}
      </label>

      <div className="row">
        <label className="field">
          <span>Número *</span>
          <input
            value={value.numero || ''}
            onChange={(e) => set({ numero: e.target.value })}
            placeholder="Ex.: 120"
            inputMode="numeric"
            disabled={value.semNumero}
            aria-invalid={!!errors.numero}
          />
          <label className="check">
            <input
              type="checkbox"
              checked={!!value.semNumero}
              onChange={(e) => set({ semNumero: e.target.checked, numero: e.target.checked ? '' : value.numero })}
            />
            Sem número
          </label>
          {errors.numero && <small className="err">{errors.numero}</small>}
        </label>
        <label className="field">
          <span>Bairro *</span>
          <select
            value={value.bairro || ''}
            onChange={(e) => set({ bairro: e.target.value, bairroOutro: '' })}
            aria-invalid={!!errors.bairro}
          >
            <option value="">Escolha o bairro</option>
            {BAIRROS.map((b) => (
              <option key={b.nome} value={b.nome}>
                {b.nome} · entrega {brl(b.taxa)}
              </option>
            ))}
          </select>
          {errors.bairro && <small className="err">{errors.bairro}</small>}
        </label>
      </div>

      {value.bairro === 'Outro bairro' && (
        <label className="field">
          <span>Qual bairro?</span>
          <input
            value={value.bairroOutro || ''}
            onChange={(e) => set({ bairroOutro: e.target.value })}
            placeholder="Nome do seu bairro"
          />
        </label>
      )}

      <label className="field">
        <span>Ponto de referência (opcional)</span>
        <input
          value={value.referencia || ''}
          onChange={(e) => set({ referencia: e.target.value })}
          placeholder="Ex.: perto da padaria, casa de portão azul"
        />
      </label>

      <label className="field">
        <span>Complemento (opcional)</span>
        <input
          value={value.complemento || ''}
          onChange={(e) => set({ complemento: e.target.value })}
          placeholder="Ex.: apto 101, bloco B"
        />
      </label>

      {!mostrarCep ? (
        <button type="button" className="link-btn" onClick={() => setMostrarCep(true)}>
          Sabe o CEP? Informe para preencher automaticamente (opcional)
        </button>
      ) : (
        <label className="field">
          <span>CEP (opcional)</span>
          <input
            value={value.cep || ''}
            onChange={(e) => {
              const v = mascaraCep(e.target.value)
              set({ cep: v })
              setCepMsg(null)
              if (v.replace(/\D/g, '').length === 8) buscarCep(v)
            }}
            placeholder="00000-000"
            inputMode="numeric"
          />
          {cepMsg && <small className={'msg msg-' + cepMsg.tipo}>{cepMsg.txt}</small>}
        </label>
      )}

      {taxa !== undefined && (
        <p className="fee-info">
          Taxa de entrega para <strong>{value.bairro === 'Outro bairro' && value.bairroOutro ? value.bairroOutro : value.bairro}</strong>: {brl(taxa)}
        </p>
      )}
    </div>
  )
}
