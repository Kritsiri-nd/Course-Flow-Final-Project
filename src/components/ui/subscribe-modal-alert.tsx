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
import { X } from "lucide-react";
import { ReactNode } from "react";

interface SubscribeModalAlertProps {
  children: ReactNode;
  courseTitle?: string;
  onConfirm?: () => void;
}

export default function SubscribeModalAlert({
  children,
  courseTitle = "this course",
  onConfirm,
}: SubscribeModalAlertProps) {
  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    // Add your subscription logic here
    console.log(`Subscribing to: ${courseTitle}`);
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
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
            Do you sure to subscribe {courseTitle} Course?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="pb-6 pt-2 px-6 flex gap-3 !justify-start">
          <AlertDialogCancel className="h-15 w-2/8 border border-orange-500 !text-orange-500 hover:bg-orange-100 px-4 py-2 rounded-lg text-b2 font-medium">
            No, I don’t
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className="h-15 w-5/8 bg-blue-500 hover:bg-blue-600 !text-white px-4 py-2 rounded-lg text-b2 font-medium"
          >
            Yes, I want to subscribe
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
