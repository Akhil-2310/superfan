'use client'

import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { chilizSpicy, chilizMainnet } from './chains'

export const wagmiConfig = getDefaultConfig({
  appName: 'FanFi - Chiliz Fan Engagement',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'demo-project-id',
  chains: [chilizSpicy, chilizMainnet],
  ssr: true,
})

