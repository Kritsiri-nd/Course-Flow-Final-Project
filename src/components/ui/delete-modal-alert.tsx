import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash, X } from "lucide-react";

export default function DeleteModalAlert(props: { delText: string }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button
          className="p-2 hover:bg-gray-200 rounded transition-colors"
          title="Delete"
        >
          <Trash className="h-4 w-4 text-blue-300" />
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-md p-0 !rounded-xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-b1 font-medium h-14 border-b border-gray-300 py-4 px-6 flex justify-between items-center">
            Confirmation
            <AlertDialogCancel
              asChild
              className="!border-none !bg-none !shadow-none"
            >
              <button>
                <X className="h-4 w-4 text-gray-500" />
              </button>
            </AlertDialogCancel>
          </AlertDialogTitle>
          <AlertDialogDescription className="text-b2 text-gray-700 pt-4 px-6">
            Are you sure you want to delete this {props.delText}?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="pb-6 pt-2 px-6 flex gap-3 !justify-center">
          <AlertDialogCancel className="h-15 w-2/3 border border-orange-500 !text-orange-500 hover:bg-orange-100 px-4 py-2 rounded-lg text-b2 font-medium">
            Yes, I want to delete the {props.delText}
          </AlertDialogCancel>
          <AlertDialogAction className="h-15 w-1/3 bg-blue-500 hover:bg-blue-600 !text-white px-4 py-2 rounded-lg text-b2 font-medium">
            No, keep it
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
