# Studio Dark Theme (Fixo)

## Escopo
- Aplicação exclusiva no app de estúdio (`client/src/studio`).
- Demais páginas do sistema permanecem com o tema atual.

## Alterações de design
- Tokens base do estúdio migrados para paleta escura fixa.
- Superfícies de card, popover, sidebar e fundo geral reequilibradas para contraste noturno.
- `color-scheme` fixado para `dark` no CSS do estúdio.
- Gradiente de fundo ajustado para reforçar legibilidade em longas sessões.

## Arquivos alterados
- `client/src/studio/index.css`

## Critérios de legibilidade e conforto visual
- Contraste AA validado para pares críticos de texto e superfície.
- Hierarquia visual preservada com diferenciação entre:
  - fundo base,
  - superfícies de conteúdo,
  - elementos interativos,
  - estados ativos/inativos.

## Testes
- `tests/studio-dark-theme.test.ts`
  - valida contraste mínimo AA para pares do estúdio,
  - valida presença de esquema escuro fixo no estúdio,
  - valida que o app principal mantém o tema atual.

## Checklist de publicação
- [x] Tema escuro fixo aplicado no estúdio
- [x] Contraste AA coberto por teste automatizado
- [x] Demais páginas preservadas
- [ ] Aprovação de design da equipe antes de publicar

