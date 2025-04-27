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
import { Loader2 } from "lucide-react"

// Define the props interface
interface DeletePostDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirmDelete: (permanent: boolean) => Promise<void> // Add this prop
  isDeleting: boolean
  postTitle?: string // Optional: display post title for confirmation
}

export default function DeletePostDialog({
  isOpen,
  onClose,
  onConfirmDelete, // Destructure the new prop
  isDeleting,
  postTitle,
}: DeletePostDialogProps) {
  const [permanentDelete, setPermanentDelete] = useState(false)

  const handleConfirm = () => {
    onConfirmDelete(permanentDelete) // Call the passed function with the permanent flag
  }

  // Reset permanentDelete state when dialog closes or opens
  // This ensures the checkbox state is fresh each time
  if (!isOpen && permanentDelete) {
    setPermanentDelete(false);
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            {permanentDelete
              ? `This action cannot be undone. This will permanently delete the post "${postTitle || 'this post'}".`
              : `This action will move the post "${postTitle || 'this post'}" to the trash. You can restore it later.`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex items-center space-x-2 py-2">
          <input
            type="checkbox"
            id="permanent-delete"
            checked={permanentDelete}
            onChange={(e) => setPermanentDelete(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
            disabled={isDeleting}
          />
          <label
            htmlFor="permanent-delete"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Delete permanently
          </label>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose} disabled={isDeleting}>Cancel</AlertDialogCancel>
          {/* Use the handleConfirm function */}
          <Button
            variant={permanentDelete ? "destructive" : "outline"}
            onClick={handleConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : permanentDelete ? (
              "Delete Permanently"
            ) : (
              "Move to Trash"
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
