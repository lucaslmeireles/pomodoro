TODO (Pomodoro - Windows / Tauri)

## Já feito

- [x] Criar som para sinalizar fim do ciclo
- [x] Quando a música acabar colocar alguma coisa no lugar, talvez uma seção de estatística
- [x] Controles de mídia (play/pause/forward/rewind + now playing)

## Próximo (core: rodar em 2º plano + UX diária)

- [x] Controles de janela precisam voltar a funcionar
- [ ] Mover a lógica do timer para o Rust (engine/estado), para continuar rodando mesmo com a janela fechada/minimizada
- [ ] Definir state machine do timer (Focus/Break + Running/Paused + Skip/Reset) e eventos para o frontend
- [ ] Persistência: salvar/restaurar estado do timer + settings (durações, som, volume, auto-start, DND)
- [x] System tray (ícone + menu):
  - [ ] Start/Pause/Resume
  - [ ] Skip / Reset
  - [ ] Mostrar/ocultar janela
  - [ ] Tooltip com tempo restante
  - [ ] “Fechar” vira “minimizar para bandeja” (close-to-tray)
- [x] Notificações nativas:
  - [x] Notificar fim de Focus/Break
  - [ ] (Opcional) botões: “Iniciar pausa” / “Iniciar foco” / “Soneca”
- [ ] Do Not Disturb (DND) do app:
  - [ ] Quando ligado: suprimir som + notificações (mantém tray/estado)
  - [ ] (Opcional) exceções configuráveis (ex: permitir notificação no fim da pausa)
- [x] Menu de config, clicando com o direito no time a pessoa consegue definir com system tray
- [x] tempo do pomodoro
- [ ] tempo das pausas curtas e longas
- [ ] notificação
- [x] iniciar automatico

## UI / janela

- [x] Pin mode: botão de “sempre no topo” (always-on-top)
- [ ] Botões de janela: minimizar/fechar funcionando certinho (e integrar com close-to-tray)
- [ x] Melhorar botão (pixel art) + polimento geral
- [ ] Criar tempo de descanso com animação do campinho e texto “gonna touch some grass”
- [x ] Focus mode( modo apenas com o tempo e sempre fixo)

## Sounds (plano longo)

- [ ] Biblioteca de sons:
  - [ ] Lista de sons incluídos + preview
  - [ ] Importar sons do usuário (copiar para app data)
  - [ ] Seleção por tipo (fim de foco / fim de pausa) + volume
  - [ ] Reproduzir som sem travar a UI (não bloquear enquanto toca)

## Mods / customização da interface (plano longo)

- [ ] Começar por “Themes” (seguro):
  - [ ] Tema via JSON/CSS variables (cores, fontes, espaçamento, radius)
  - [ ] Layout presets (normal/compacto/painel)
  - [ ] Import/export de tema
- [ ] Depois avaliar plugins/mods de verdade:
  - [ ] `manifest.json` com versão + permissões
  - [ ] API estável para mods (evitar execução arbitrária sem limites)
