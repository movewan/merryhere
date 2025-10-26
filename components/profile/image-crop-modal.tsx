"use client";

import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Loader2, ZoomIn, ZoomOut } from "lucide-react";

// Area 타입 정의
interface Area {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ImageCropModalProps {
  image: string;
  onClose: () => void;
  onComplete: (croppedBlob: Blob) => void;
}

/**
 * Base64 이미지를 Blob으로 변환
 */
async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area
): Promise<Blob> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Canvas context not available");
  }

  // 1:1 비율로 정사각형 크롭
  const size = Math.min(pixelCrop.width, pixelCrop.height);
  canvas.width = size;
  canvas.height = size;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    size,
    size
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error("Canvas is empty"));
      }
    }, "image/jpeg");
  });
}

/**
 * 이미지 로드 헬퍼
 */
function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    // Data URL은 crossOrigin 설정 불필요
    image.src = url;
  });
}

export function ImageCropModal({
  image,
  onClose,
  onComplete,
}: ImageCropModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [processing, setProcessing] = useState(false);

  console.log("ImageCropModal rendering with image:", image);

  const onCropComplete = useCallback(
    (croppedArea: Area, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const handleComplete = async () => {
    if (!croppedAreaPixels) {
      console.warn("No cropped area selected");
      return;
    }

    setProcessing(true);
    try {
      const croppedBlob = await getCroppedImg(image, croppedAreaPixels);
      onComplete(croppedBlob);
    } catch (error) {
      console.error("Error cropping image:", error);
      alert("이미지를 편집하는 중 오류가 발생했습니다. 다시 시도해주세요.");
      setProcessing(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>프로필 이미지 편집</DialogTitle>
        </DialogHeader>

        {/* 크롭 영역 */}
        <div className="relative h-96 bg-gray-100 rounded-lg">
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            aspect={1}
            onCropChange={setCrop}
            onCropComplete={onCropComplete}
            onZoomChange={setZoom}
            objectFit="contain"
            showGrid={false}
          />
        </div>

        {/* 줌 컨트롤 */}
        <div className="flex items-center gap-4">
          <ZoomOut className="h-4 w-4 text-muted-foreground" />
          <Slider
            min={1}
            max={3}
            step={0.1}
            value={[zoom]}
            onValueChange={(value) => setZoom(value[0])}
            className="flex-1"
          />
          <ZoomIn className="h-4 w-4 text-muted-foreground" />
        </div>

        <p className="text-sm text-muted-foreground text-center">
          이미지를 드래그하여 위치를 조정하고, 슬라이더로 확대/축소할 수 있습니다.
        </p>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={processing}>
            취소
          </Button>
          <Button
            onClick={handleComplete}
            disabled={processing}
            className="bg-teal hover:bg-teal-600"
          >
            {processing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                처리 중...
              </>
            ) : (
              "완료"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
