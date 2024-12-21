import React from 'react';
import { ENV } from '../utils/env';

const ReadEnv = () => {
  return (
    <div>
        <p>Read ENV TEST</p>
        <p>ENV.PLATFORM: {ENV.PLATFORM}</p>
    </div>
  )
}

export default ReadEnv