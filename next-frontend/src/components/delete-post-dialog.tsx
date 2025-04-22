"use client"

import { useState } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"

interface DeletePostDialogProps {
  isOpen: boolean
  onClose: () => void
  onDelete: (permanent: boolean) => void
}

export default function DeletePostDialog({ isOpen, onClose, onDelete }: DeletePostDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [showPermanentDelete, setShowPermanentDelete] = useState(false)

  const handleDelete = async (permanent: boolean) => {
    setIsDeleting(true)
    await onDelete(permanent)
    setIsDeleting(false)
    onClose()
    setShowPermanentDelete(false)
  }

  const handleCancel = () => {
    onClose()
    setShowPermanentDelete(false)
  }

  if (showPermanentDelete) {
    return (
      <AlertDialog open={isOpen} onOpenChange={onClose}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Permanently Delete Post?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your post and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancel} disabled={isDeleting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleDelete(true)}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Yes, Delete Permanently"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Post?</AlertDialogTitle>
          <AlertDialogDescription>
            This will move the post to trash. You can restore it later if needed.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row">
          <AlertDialogCancel onClick={handleCancel} disabled={isDeleting}>
            Cancel
          </AlertDialogCancel>
          <Button
            variant="outline"
            onClick={() => setShowPermanentDelete(true)}
            disabled={isDeleting}
            className="mt-2 sm:mt-0"
          >
            Delete Permanently
          </Button>
          <AlertDialogAction
            onClick={() => handleDelete(false)}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? "Deleting..." : "Move to Trash"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
