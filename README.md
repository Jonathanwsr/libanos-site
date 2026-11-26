# Libanos Esfiharia — protótipo de pedidos com melhorias de usabilidade

Protótipo acadêmico (React + Vite, sem backend) que aplica as propostas de melhoria do TCC
**"Análise de usabilidade no processo de pedido via WhatsApp da Libanos Esfiharia"**
(Jailton Gomes de Sousa Junior e Manoel Victor Leite Izídio — orientação: Nélio Fernando da Fonsêca Aguiar e Silva, UNIFACOL, 2026).

> Nenhum pedido é enviado à loja. Itens e preços são ilustrativos.

## Melhorias implementadas (Quadro 4 do TCC)

| Prioridade | Proposta | Onde ver |
|---|---|---|
| Alta | Atendimento híbrido: link automático + "digite 1 para falar com um atendente" | `#/whatsapp` e botão **Ajuda** em todas as telas |
| Alta | Pedido como convidado (só nome, telefone e endereço; cadastro opcional ao final) | Checkout → tela do pedido confirmado |
| Alta | CEP opcional, busca por rua e bairro, localização do celular, mensagens de erro claras | Checkout → Entrega |
| Média | Categorias fixas no topo, busca por nome, fotos e preços sempre visíveis | Cardápio |
| Média | Um único link para Instagram, Google e WhatsApp | `#/canais` |
| Baixa | "Repetir último pedido" e status do pedido após a confirmação | Cardápio / `#/pedido` |

Também: indicador de etapas, resumo com total em todas as etapas, "Desfazer" ao remover itens,
confirmação visual ao adicionar à sacola.

## Páginas

- **Início** – cardápio no layout do site original (banner, categorias, busca, cartões e sacola lateral)
- **Promoções** – destaques e combos, entrega grátis a partir de R$ 69
- **Pedidos** – histórico **sem exigir login** (no original é preciso entrar na conta)
- **Entrar/Cadastrar** – cadastro **opcional**, sem senha: nome e telefone; e-mail e endereço opcionais

## API do cardápio

Os produtos (nome, descrição, preço, imagem, crédito da foto) vêm de `/api/cardapio.json`.
Para usar outra fonte, defina `VITE_API_CARDAPIO` com a URL de um JSON no mesmo formato.

## Rodar localmente

```bash
npm install
npm run dev
```

## Configuração

Em `src/data/menu.js`:
- cardápio: `public/api/cardapio.json`;
- `BAIRROS`: bairros atendidos e taxa de entrega;
- `LOJA.whatsapp`: número real (ex.: `5581999999999`) para o botão de atendente abrir o WhatsApp de verdade.
  Vazio = abre a simulação.

APIs públicas usadas direto do navegador: ViaCEP (CEP e busca por rua) e OpenStreetMap Nominatim (localização → endereço).
