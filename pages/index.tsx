import React, {useState, useEffect} from "react";
import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import Game from '../components/asteroids/game'
import dynamic from 'next/dynamic'
const Home: NextPage = () => {
  const GameWithNoSSR = dynamic(() => import('../components/asteroids/game'), {
    ssr: false
  })
  return <GameWithNoSSR />
}

export default Home
