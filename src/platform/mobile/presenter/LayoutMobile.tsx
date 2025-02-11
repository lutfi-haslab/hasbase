import { Navbar, NavbarBackLink, Page } from 'konsta/react'
import React from 'react'

const LayoutMobile = ({ children, titleHeader = "", backButton }: { children: React.ReactNode, titleHeader?: string, backButton?:  () => void }) => {
    return (
        <Page>
            {titleHeader !== '' && <Navbar
                left={
                    <NavbarBackLink text="Back" onClick={backButton  ? backButton : () => history.back()} />
                }
                title={titleHeader}
            />}
            <div className='relative'>
                {children}
            </div>
        </Page>
    )
}

export default LayoutMobile