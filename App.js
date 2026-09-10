import React, { useMemo, useState } from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import {
  Appbar,
  Avatar,
  Badge,
  Button,
  Card,
  Checkbox,
  Chip,
  Divider,
  FAB,
  HelperText,
  IconButton,
  List,
  MD3DarkTheme,
  MD3LightTheme,
  Menu,
  PaperProvider,
  ProgressBar,
  RadioButton,
  SegmentedButtons,
  Snackbar,
  Switch,
  Text,
  TextInput,
} from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

const COLOR_FIELDS = [
  ['primary', 'Primary'],
  ['onPrimary', 'On Primary'],
  ['primaryContainer', 'Primary Container'],
  ['onPrimaryContainer', 'On Primary Container'],
  ['secondary', 'Secondary'],
  ['onSecondary', 'On Secondary'],
  ['secondaryContainer', 'Secondary Container'],
  ['onSecondaryContainer', 'On Secondary Container'],
  ['tertiary', 'Tertiary'],
  ['onTertiary', 'On Tertiary'],
  ['tertiaryContainer', 'Tertiary Container'],
  ['onTertiaryContainer', 'On Tertiary Container'],
  ['background', 'Background'],
  ['onBackground', 'On Background'],
  ['surface', 'Surface'],
  ['onSurface', 'On Surface'],
  ['surfaceVariant', 'Surface Variant'],
  ['onSurfaceVariant', 'On Surface Variant'],
  ['outline', 'Outline'],
  ['error', 'Error'],
  ['onError', 'On Error'],
];

function normalizeHex(value, fallback) {
  const v = String(value || '').trim();
  if (/^#[0-9a-fA-F]{6}$/.test(v)) return v;
  return fallback;
}

function WebColorInput({ value, onChange }) {
  if (Platform.OS !== 'web') {
    return null;
  }

  return React.createElement('input', {
    type: 'color',
    value: normalizeHex(value, '#6750A4'),
    onChange: (event) => onChange(event.target.value.toUpperCase()),
    style: {
      width: 46,
      height: 42,
      border: 'none',
      padding: 0,
      background: 'transparent',
      cursor: 'pointer',
    },
    title: 'Escolher cor',
  });
}

function ColorEditor({ label, colorKey, value, fallback, onChange }) {
  return (
    <View style={styles.colorRow}>
      <View style={styles.colorLabelWrap}>
        <Text variant="labelLarge">{label}</Text>
        <Text variant="bodySmall" style={styles.tokenName}>
          colors.{colorKey}
        </Text>
      </View>

      <View style={styles.colorControls}>
        <WebColorInput value={value} onChange={onChange} />
        <TextInput
          mode="outlined"
          dense
          value={value}
          onChangeText={(text) => onChange(text)}
          onBlur={() => onChange(normalizeHex(value, fallback))}
          autoCapitalize="characters"
          style={styles.hexInput}
        />
      </View>
    </View>
  );
}

function buildThemeCode(theme, dark, roundness) {
  const base = dark ? 'MD3DarkTheme' : 'MD3LightTheme';
  const colors = {};
  COLOR_FIELDS.forEach(([key]) => {
    colors[key] = theme.colors[key];
  });

  return `import { ${base} } from 'react-native-paper';

export const theme = {
  ...${base},
  roundness: ${Number(roundness)},
  colors: {
    ...${base}.colors,
${Object.entries(colors)
      .map(([key, value]) => `    ${key}: '${value}',`)
      .join('\n')}
  },
};
`;
}

function downloadThemeFile(code) {
  if (Platform.OS !== 'web') return;

  const blob = new Blob([code], { type: 'text/javascript;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'theme.js';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function AppContent({
  dark,
  setDark,
  customColors,
  setCustomColors,
  roundness,
  setRoundness,
  theme,
}) {
  const { width } = useWindowDimensions();
  const compact = width < 960;

  const [checked, setChecked] = useState(true);
  const [radio, setRadio] = useState('first');
  const [switchOn, setSwitchOn] = useState(true);
  const [segment, setSegment] = useState('day');
  const [menuVisible, setMenuVisible] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  const code = useMemo(
    () => buildThemeCode(theme, dark, roundness),
    [theme, dark, roundness]
  );

  const baseTheme = dark ? MD3DarkTheme : MD3LightTheme;

  function resetTheme() {
    setCustomColors({ ...baseTheme.colors });
    setRoundness(baseTheme.roundness);
  }

  function updateColor(key, value) {
    setCustomColors((current) => ({ ...current, [key]: value }));
  }

  return (
    <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header elevated>
        <Appbar.Content
          title="React Native Paper Theme Creator"
          subtitle="MD3 • preview ao vivo • exporta theme.js"
        />
        <View style={styles.headerSwitch}>
          <Text>{dark ? 'Dark' : 'Light'}</Text>
          <Switch value={dark} onValueChange={setDark} />
        </View>
      </Appbar.Header>

      <View style={[styles.workspace, compact && styles.workspaceCompact]}>
        <ScrollView
          style={[
            styles.sidebar,
            compact && styles.sidebarCompact,
            { backgroundColor: theme.colors.surface },
          ]}
          contentContainerStyle={styles.sidebarContent}
        >
          <Text variant="headlineSmall">Tema</Text>
          <Text variant="bodyMedium" style={styles.sectionDescription}>
            Edite os tokens abaixo. Os componentes à direita mudam imediatamente.
          </Text>

          <View style={styles.actionRow}>
            <Button mode="contained" icon="download" onPress={() => downloadThemeFile(code)}>
              Baixar theme.js
            </Button>
            <Button mode="outlined" icon="restore" onPress={resetTheme}>
              Resetar
            </Button>
          </View>

          <Divider style={styles.divider} />

          <Text variant="titleMedium">Roundness</Text>
          <View style={styles.roundnessRow}>
            <Button
              mode="outlined"
              compact
              onPress={() => setRoundness((v) => Math.max(0, Number(v) - 1))}
            >
              −
            </Button>
            <TextInput
              mode="outlined"
              dense
              keyboardType="numeric"
              value={String(roundness)}
              onChangeText={(v) => setRoundness(Number(v.replace(/\D/g, '') || 0))}
              style={styles.roundnessInput}
            />
            <Button
              mode="outlined"
              compact
              onPress={() => setRoundness((v) => Number(v) + 1)}
            >
              +
            </Button>
          </View>

          <Divider style={styles.divider} />

          <Text variant="titleMedium">Cores MD3</Text>

          {COLOR_FIELDS.map(([key, label]) => (
            <ColorEditor
              key={key}
              label={label}
              colorKey={key}
              value={customColors[key] || baseTheme.colors[key]}
              fallback={baseTheme.colors[key]}
              onChange={(value) => updateColor(key, value)}
            />
          ))}

          <Divider style={styles.divider} />

          <Text variant="titleMedium">Código gerado</Text>
          <Card mode="outlined" style={styles.codeCard}>
            <Card.Content>
              <ScrollView horizontal>
                <Text selectable style={styles.codeText}>
                  {code}
                </Text>
              </ScrollView>
            </Card.Content>
          </Card>
        </ScrollView>

        <ScrollView
          style={styles.preview}
          contentContainerStyle={styles.previewContent}
        >
          <Text variant="headlineMedium">Preview dos componentes</Text>
          <Text variant="bodyLarge" style={styles.sectionDescription}>
            Os componentes abaixo usam o mesmo PaperProvider que será exportado.
          </Text>

          <View style={styles.grid}>
            <Card style={styles.previewCard}>
              <Card.Title
                title="Buttons"
                subtitle="Contained, outlined e text"
                left={(props) => <Avatar.Icon {...props} icon="gesture-tap-button" />}
              />
              <Card.Content style={styles.cardGap}>
                <Button mode="contained">Contained</Button>
                <Button mode="contained-tonal">Contained tonal</Button>
                <Button mode="outlined">Outlined</Button>
                <Button mode="text">Text</Button>
              </Card.Content>
            </Card>

            <Card style={styles.previewCard}>
              <Card.Title title="Inputs" subtitle="Outlined e flat" />
              <Card.Content>
                <TextInput
                  label="Nome"
                  mode="outlined"
                  placeholder="Rodrigo"
                  left={<TextInput.Icon icon="account" />}
                  style={styles.inputGap}
                />
                <TextInput
                  label="E-mail"
                  mode="flat"
                  placeholder="nome@email.com"
                  right={<TextInput.Icon icon="email" />}
                />
                <HelperText type="info" visible>
                  Helper text usando a cor do tema.
                </HelperText>
              </Card.Content>
            </Card>

            <Card style={styles.previewCard}>
              <Card.Title title="Selection" subtitle="Checkbox, radio e switch" />
              <Card.Content style={styles.cardGap}>
                <View style={styles.inlineControl}>
                  <Checkbox
                    status={checked ? 'checked' : 'unchecked'}
                    onPress={() => setChecked(!checked)}
                  />
                  <Text>Checkbox</Text>
                </View>

                <RadioButton.Group onValueChange={setRadio} value={radio}>
                  <View style={styles.inlineControl}>
                    <RadioButton value="first" />
                    <Text>Opção 1</Text>
                  </View>
                  <View style={styles.inlineControl}>
                    <RadioButton value="second" />
                    <Text>Opção 2</Text>
                  </View>
                </RadioButton.Group>

                <View style={styles.inlineControl}>
                  <Switch value={switchOn} onValueChange={setSwitchOn} />
                  <Text>{switchOn ? 'Ligado' : 'Desligado'}</Text>
                </View>
              </Card.Content>
            </Card>

            <Card style={styles.previewCard}>
              <Card.Title title="Chips & badges" />
              <Card.Content>
                <View style={styles.wrapRow}>
                  <Chip icon="check">Ativo</Chip>
                  <Chip mode="outlined">Outlined</Chip>
                  <Chip icon="star">Favorito</Chip>
                  <View style={styles.badgeWrap}>
                    <IconButton icon="bell" />
                    <Badge style={styles.badge}>3</Badge>
                  </View>
                </View>
              </Card.Content>
            </Card>

            <Card style={styles.previewCard}>
              <Card.Title title="Segmented buttons" />
              <Card.Content>
                <SegmentedButtons
                  value={segment}
                  onValueChange={setSegment}
                  buttons={[
                    { value: 'day', label: 'Dia', icon: 'weather-sunny' },
                    { value: 'week', label: 'Semana', icon: 'calendar-week' },
                    { value: 'month', label: 'Mês', icon: 'calendar-month' },
                  ]}
                />
              </Card.Content>
            </Card>

            <Card style={styles.previewCard}>
              <Card.Title title="Cards" subtitle="Surface e elevação" />
              <Card.Content>
                <Text variant="titleLarge">Card de exemplo</Text>
                <Text variant="bodyMedium" style={styles.sectionDescription}>
                  Veja como background, surface, outline e tipografia se combinam.
                </Text>
                <ProgressBar progress={0.68} style={styles.progress} />
              </Card.Content>
              <Card.Actions>
                <Button>Cancelar</Button>
                <Button mode="contained">Salvar</Button>
              </Card.Actions>
            </Card>

            <Card style={styles.previewCard}>
              <Card.Title title="List" />
              <Card.Content>
                <List.Item
                  title="Perfil"
                  description="Dados da conta"
                  left={(props) => <List.Icon {...props} icon="account" />}
                />
                <Divider />
                <List.Item
                  title="Configurações"
                  description="Preferências do aplicativo"
                  left={(props) => <List.Icon {...props} icon="cog" />}
                />
              </Card.Content>
            </Card>

            <Card style={styles.previewCard}>
              <Card.Title title="Menu, Snackbar & FAB" />
              <Card.Content style={styles.cardGap}>
                <Menu
                  visible={menuVisible}
                  onDismiss={() => setMenuVisible(false)}
                  anchor={
                    <Button mode="outlined" onPress={() => setMenuVisible(true)}>
                      Abrir menu
                    </Button>
                  }
                >
                  <Menu.Item leadingIcon="pencil" title="Editar" onPress={() => setMenuVisible(false)} />
                  <Menu.Item leadingIcon="delete" title="Excluir" onPress={() => setMenuVisible(false)} />
                </Menu>

                <Button
                  mode="contained-tonal"
                  onPress={() => setSnackbarVisible(true)}
                >
                  Mostrar Snackbar
                </Button>

                <View style={styles.fabRow}>
                  <FAB icon="plus" label="Novo" onPress={() => { }} />
                  <FAB size="small" icon="pencil" onPress={() => { }} />
                </View>
              </Card.Content>
            </Card>
          </View>
        </ScrollView>
      </View>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        action={{ label: 'OK', onPress: () => setSnackbarVisible(false) }}
      >
        Este Snackbar também está usando o tema.
      </Snackbar>
    </View>
  );
}

export default function App() {
  const [dark, setDark] = useState(false);
  const [lightColors, setLightColors] = useState({ ...MD3LightTheme.colors });
  const [darkColors, setDarkColors] = useState({ ...MD3DarkTheme.colors });
  const [lightRoundness, setLightRoundness] = useState(MD3LightTheme.roundness);
  const [darkRoundness, setDarkRoundness] = useState(MD3DarkTheme.roundness);

  const baseTheme = dark ? MD3DarkTheme : MD3LightTheme;
  const customColors = dark ? darkColors : lightColors;
  const roundness = dark ? darkRoundness : lightRoundness;

  const theme = useMemo(
    () => ({
      ...baseTheme,
      roundness,
      colors: {
        ...baseTheme.colors,
        ...customColors,
      },
    }),
    [baseTheme, customColors, roundness]
  );

  return (
    <PaperProvider
      theme={theme}
      settings={{
        icon: (props) => <MaterialCommunityIcons {...props} />,
      }}
    >
      <AppContent
        dark={dark}
        setDark={setDark}
        customColors={customColors}
        setCustomColors={dark ? setDarkColors : setLightColors}
        roundness={roundness}
        setRoundness={dark ? setDarkRoundness : setLightRoundness}
        theme={theme}
      />
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    minHeight: '100vh',
  },
  workspace: {
    flex: 1,
    flexDirection: 'row',
    minHeight: 0,
  },
  workspaceCompact: {
    flexDirection: 'column',
  },
  sidebar: {
    width: 430,
    borderRightWidth: StyleSheet.hairlineWidth,
    borderRightColor: 'rgba(127,127,127,0.35)',
  },
  sidebarCompact: {
    width: '100%',
    maxHeight: 600,
    borderRightWidth: 0,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(127,127,127,0.35)',
  },
  sidebarContent: {
    padding: 20,
    paddingBottom: 48,
  },
  preview: {
    flex: 1,
  },
  previewContent: {
    padding: 24,
    paddingBottom: 120,
    maxWidth: 1400,
    width: '100%',
    alignSelf: 'center',
  },
  sectionDescription: {
    opacity: 0.72,
    marginTop: 4,
    marginBottom: 16,
  },
  actionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  divider: {
    marginVertical: 20,
  },
  colorRow: {
    marginTop: 12,
  },
  colorLabelWrap: {
    marginBottom: 5,
  },
  tokenName: {
    opacity: 0.55,
  },
  colorControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  hexInput: {
    flex: 1,
    minWidth: 150,
  },
  roundnessRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
  },
  roundnessInput: {
    width: 90,
  },
  codeCard: {
    marginTop: 10,
  },
  codeText: {
    fontFamily: Platform.select({
      web: 'monospace',
      default: 'monospace',
    }),
    lineHeight: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 18,
  },
  previewCard: {
    flexGrow: 1,
    flexBasis: 360,
    minWidth: 300,
    maxWidth: 620,
  },
  cardGap: {
    gap: 12,
  },
  inputGap: {
    marginBottom: 12,
  },
  inlineControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  wrapRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
  },
  badgeWrap: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
  },
  progress: {
    marginTop: 12,
  },
  fabRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 10,
  },
  headerSwitch: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingRight: 12,
  },
});
