import { Provider } from 'react-redux';
import type { AppProps } from 'next/app';
import { store } from './store';
export const withStore = ({
    Component, pageProps,
  }: AppProps) => {
    return (
      <Provider store={store}>
        <Component {...pageProps} />
      </Provider>
    );
  }