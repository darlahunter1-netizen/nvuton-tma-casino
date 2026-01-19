import { TonConnectUIProvider } from '@tonconnect/ui-react';
import NvuTONHigherLower from './components/NvuTONHigherLower.jsx';

function App() {
  return (
    <TonConnectUIProvider manifestUrl="/manifest.json">
      <NvuTONHigherLower />
    </TonConnectUIProvider>
  );
}

export default App;                                         