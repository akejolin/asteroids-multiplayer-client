import React, {useState, useEffect} from "react";
import type { NextPage } from 'next'
import dynamic from 'next/dynamic'
const Home: NextPage = () => {
  const GameWithNoSSR = dynamic(() => import('../components/controls'), {
    ssr: false
  })
  return <GameWithNoSSR />
}

export default Home
