import { WifiOff } from "lucide-react";
import { useNetworkStatus } from "@/hooks/use-native";
import { AnimatePresence, motion } from "framer-motion";

const OfflineBanner = () => {
  const isOnline = useNetworkStatus();

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-[100] bg-destructive text-destructive-foreground px-4 py-2.5 text-center text-sm font-medium flex items-center justify-center gap-2"
        >
          <WifiOff className="w-4 h-4" />
          You're offline — your saved pathway and bookmarks are still available.
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OfflineBanner;
