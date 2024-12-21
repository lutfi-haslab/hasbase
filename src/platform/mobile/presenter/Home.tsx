import { PGlite } from '@electric-sql/pglite';
import { PGliteProvider } from '@electric-sql/pglite-react';
import { live, LiveNamespace } from '@electric-sql/pglite/live';
import { useEffect, useState } from 'react';
import ListData from '../../../components/ListData';
import ReadEnv from '../../../components/ReadEnv';
import MyComponent from '../../../MyComponent';


const MobileHome = () => {


  return (
    <>
      <ReadEnv />
      <MyComponent />
      <ListData />
    </>
  );
}

export default MobileHome;