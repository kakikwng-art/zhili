import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

const APK_HREF = "/zhili.apk";

type ApkDownloadProps = {
  className?: string;
  children: ReactNode;
};

export function ApkDownload({ className, children }: ApkDownloadProps) {
  const [native, setNative] = useState(false);

  useEffect(() => {
    void import("@capacitor/core").then(({ Capacitor }) => {
      setNative(Capacitor.isNativePlatform());
    });
  }, []);

  if (native) return null;

  return (
    <a href={APK_HREF} download="纸历.apk" className={cn(className)}>
      {children}
    </a>
  );
}
