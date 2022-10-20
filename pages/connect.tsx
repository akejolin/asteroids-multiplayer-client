import React, {useState, useEffect} from "react";
import type { NextPage } from 'next'
import dynamic from 'next/dynamic'
const Connect: NextPage = () => {
  const GameWithNoSSR = dynamic(() => import('../components/connect'), {
    ssr: false
  })
  return <GameWithNoSSR />
}

export default Connect