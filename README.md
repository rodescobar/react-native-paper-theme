# React Native Paper Theme Creator

Editor visual de tema para **React Native Paper / Material Design 3**.

## Recursos

- Preview ao vivo usando componentes reais do React Native Paper
- Light / Dark independentes
- Edição de cores via color picker e HEX
- Roundness
- Button, TextInput, Card, Checkbox, RadioButton, Switch, Chip, Badge, SegmentedButtons, List, Menu, Snackbar, FAB e ProgressBar
- Preview do código
- Download automático de `theme.js`

## Rodar

Requer Node.js LTS.

```bash
npm install
npm run web
```

O Expo abrirá o projeto no navegador.

## Gerar versão web estática

```bash
npm run export:web
```

A saída será criada em `dist/`.

## Usar o tema exportado

No seu aplicativo:

```js
import { PaperProvider } from 'react-native-paper';
import { theme } from './theme';

export default function App() {
  return (
    <PaperProvider theme={theme}>
      {/* aplicação */}
    </PaperProvider>
  );
}
```

## GitHub Pages

Para hospedar como GitHub Pages, a forma mais simples é publicar o conteúdo web gerado pelo Expo (`dist/`) por uma GitHub Action ou serviço de deploy estático.

> React Native Paper usado pelo projeto: linha 5.x / MD3.
