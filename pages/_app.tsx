import type { AppProps } from 'next/app';


import './style.css'

function App({
  Component, pageProps,
}: AppProps) {
  return (
      <Component {...pageProps} />

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