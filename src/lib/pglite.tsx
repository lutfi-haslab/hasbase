import { PGlite, PGliteInterfaceExtensions } from '@electric-sql/pglite'
import { makePGliteProvider } from '@electric-sql/pglite-react'
import { live } from '@electric-sql/pglite/live'
import { vector } from '@electric-sql/pglite/vector'

const { PGliteProvider, usePGlite } = makePGliteProvider<
  PGlite &
  PGliteInterfaceExtensions<{
    live: typeof live
    vector: typeof vector
  }>
>()

export { PGliteProvider, usePGlite }
