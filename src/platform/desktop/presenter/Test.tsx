import { Button } from '@/components/ui/button'
import React from 'react'
import { Link } from 'react-router'
import HomeLayout from '../layout/HomeLayout'

const Test = () => {
    return (
        <HomeLayout>
            <p>Test Screen</p>
            <Link to={'/'}>
                <Button>Home</Button>
            </Link>
        </HomeLayout>
    )
}

export default Test