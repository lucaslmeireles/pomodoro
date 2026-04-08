TODO (Pomodoro - Windows / Tauri)

## Já feito
- [x] Criar som para sinalizar fim do ciclo
- [x] Quando a música acabar colocar alguma coisa no lugar, talvez uma seção de estatística
- [x] Controles de mídia (play/pause/forward/rewind + now playing)

## Próximo (core: rodar em 2º plano + UX diária)
- [ ] Mover a lógica do timer para o Rust (engine/estado), para continuar rodando mesmo com a janela fechada/minimizada
- [ ] Definir state machine do timer (Focus/Break + Running/Paused + Skip/Reset) e eventos para o frontend
- [ ] Persistência: salvar/restaurar estado do timer + settings (durações, som, volume, auto-start, DND)
- [ ] System tray (ícone + menu):
  - [ ] Start/Pause/Resume
  - [ ] Skip / Reset
  - [ ] Mostrar/ocultar janela
  - [ ] Tooltip com tempo restante
  - [ ] “Fechar” vira “minimizar para bandeja” (close-to-tray)
- [ ] Notificações nativas:
  - [ ] Notificar fim de Focus/Break
  - [ ] (Opcional) botões: “Iniciar pausa” / “Iniciar foco” / “Soneca”
- [ ] Do Not Disturb (DND) do app:
  - [ ] Quando ligado: suprimir som + notificações (mantém tray/estado)
  - [ ] (Opcional) exceções configuráveis (ex: permitir notificação no fim da pausa)

## UI / janela
- [ ] Pin mode: botão de “sempre no topo” (always-on-top)
- [ ] Botões de janela: minimizar/fechar funcionando certinho (e integrar com close-to-tray)
- [ ] Melhorar botão (pixel art) + polimento geral
- [ ] Criar tempo de descanso com animação do campinho e texto “gonna touch some grass”

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
