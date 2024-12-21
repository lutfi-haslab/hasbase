import { PGlite, PGliteInterfaceExtensions } from '@electric-sql/pglite'
import { makePGliteProvider } from '@electric-sql/pglite-react'
import { live } from '@electric-sql/pglite/live'

const { PGliteProvider, usePGlite } = makePGliteProvider<
  PGlite &
  PGliteInterfaceExtensions<{
    live: typeof live
    // vector: typeof vectors
  }>
>()

export { PGliteProvider, usePGlite }
