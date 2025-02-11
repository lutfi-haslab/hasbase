import React from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

const AlertDialog = ({ children, title, description }: { children: React.ReactNode; title: string; description: string }) => {
    return (
        <Dialog>
            <DialogTrigger>{children}</DialogTrigger>
            <DialogContent className='w-[80vw]'>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>
                        {description}
                    </DialogDescription>
                </DialogHeader>
            </DialogContent>
        </Dialog>

    )
}

export default AlertDialog