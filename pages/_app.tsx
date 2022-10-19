import { Provider } from 'react-redux';
import type { AppProps } from 'next/app';
import { store } from '../redux/store';

import './style.css'

function App({
  Component, pageProps,
}: AppProps) {
  return (
    <Provider store={store}>
      <Component {...pageProps} />
    </Provider>
  );
}



App.getInitialProps = async ({ Component, ctx }: any) => {
  return {
    pageProps: {
      ...(Component.getInitialProps
        ? await Component.getInitialProps(ctx)
        : {}),
    },
  }
}


export default App