// app/providers.tsx
'use client'

import {NextUIProvider} from '@nextui-org/react'
import withProviderHOC from "@/utils/withProviderHOC";
import {ReactNode} from "react";

const providers = [NextUIProvider]

const WrappedComponent = ({children}: { children: ReactNode }) => (<>{ children }</>)

export const Providers = withProviderHOC(providers)(WrappedComponent)