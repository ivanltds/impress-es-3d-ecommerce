# Fluxos Principais

---

## Fluxo 1 — Descoberta via Instagram

```
Usuário vê post/reel/story no Instagram
  → Clica no link da bio
    → Cai na LP principal ou LP temática
      → Explora produtos e coleções
        → Abre modal/PDP
          → Personaliza item
            → Adiciona ao carrinho
              → Finaliza compra ou entra em contato (WhatsApp)
```

**Pontos críticos:**
- LP precisa carregar rápido (mobile, tráfego social)
- Transição Instagram → site deve ser fluida (manter contexto visual)
- CTA de WhatsApp como alternativa para quem não quer comprar direto

---

## Fluxo 2 — Compra Direta

```
Usuário entra em uma coleção
  → Filtra/navega produtos
    → Escolhe um item
      → Define personalização (cor, tamanho, texto)
        → Adiciona ao carrinho
          → Continua comprando ou vai ao carrinho
            → Faz login ou cadastro (se não logado)
              → Checkout:
                → Confirma endereço
                → Escolhe frete
                → Seleciona pagamento
                → Paga
              → Recebe confirmação (tela + e-mail)
                → Pedido entra na fila de produção
```

**Pontos críticos:**
- Cadastro não pode travar a compra (guest checkout ou cadastro rápido)
- Personalização precisa ser revisada antes do pagamento
- Status do pedido visível pós-compra

---

## Fluxo 3 — Pedido Sob Consulta

```
Usuário não encontra o item ideal
  → Clica em "quero algo personalizado"
    → Preenche formulário:
      • Nome
      • Contato (e-mail ou WhatsApp)
      • Coleção de interesse
      • Descrição do que quer
    → Lead é salvo no sistema
      → Atendimento humano continua por WhatsApp ou CRM leve
```

**Pontos críticos:**
- Formulário simples (nome + contato + mensagem)
- Resposta rápida esperada (via WhatsApp)
- Leads são valiosos para entender demanda

---

## Fluxo 4 — Personalização da Área Logada

```
Usuário compra itens de um nicho dominante (ex: 3 itens gamer)
  → Sistema sugere tema visual relacionado
    → Usuário vê notificação: "Percebemos que você curte o universo Gamer. Quer aplicar o tema Gamer à sua área?"
      → Opções: [Aceitar] [Recusar] [Escolher outro tema]
        → Preferência salva em cookie (guest) ou perfil (logado)
          → Área do cliente reflete o tema:
            • Cores, ícones, banners
            • Copy contextual
            • Produtos relacionados
```

**Pontos críticos:**
- Nunca trocar tema abruptamente
- Usuário sempre tem controle
- Tema não altera usabilidade ou checkout

---

## Fluxo 5 — Operação Interna (Produção)

```
Pedido é pago
  → Admin valida personalização (se sensível)
    → Gera ProductionJob
      → Job entra na fila do parceiro
        → Parceiro imprime
          → Status atualizado: "em impressão"
            → Acabamento e QC
              → Status: "acabamento" → "embalado"
                → Envio
                  → Status: "enviado"
                    → Tracking code registrado
                      → Cliente acompanha evolução

Se falha na impressão:
  → QC: failed
    → Registra motivo
      → Gera novo ProductionJob (reimpressão)
```

**Pontos críticos:**
- Status visível para o cliente (transparência)
- Tempo de produção realista desde o início
- Falhas registradas para melhoria contínua
