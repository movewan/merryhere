"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Upload, Save, Loader2 } from "lucide-react";
import { getCurrentUser } from "@/app/auth/actions";
import {
  getProfile,
  updateProfile,
  uploadProfileImage,
  changePassword,
} from "@/lib/supabase/profile";
import type { Profile } from "@/lib/supabase/database.types";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { ImageCropModal } from "@/components/profile/image-crop-modal";
import { formatPhoneNumber, unformatPhoneNumber } from "@/lib/utils/phone";

export default function EditProfilePage() {
  const router = useRouter();
  const { toast } = useToast();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // 프로필 폼 데이터
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // 이미지 크롭 관련
  const [showCropModal, setShowCropModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [croppedBlob, setCroppedBlob] = useState<Blob | null>(null);

  // 비밀번호 변경 데이터
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const user = await getCurrentUser();
      if (!user) {
        router.push("/auth/login");
        return;
      }

      const profileData = await getProfile(user.id);
      if (profileData) {
        setProfile(profileData);
        setFullName(profileData.full_name);
        // 전화번호는 포맷팅하여 표시
        setPhone(profileData.phone ? formatPhoneNumber(profileData.phone) : "");
        setCompanyName(profileData.company_name || "");
        setPreviewUrl(profileData.profile_image_url || null);
      }
    } catch (error) {
      console.error("Failed to load profile:", error);
      toast({
        title: "오류",
        description: "프로필 정보를 불러오는데 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("=== handleImageChange called ===");

    const file = e.target.files?.[0];
    if (!file) {
      console.log("No file selected");
      return;
    }

    console.log("File selected:", {
      name: file.name,
      type: file.type,
      size: file.size,
      lastModified: file.lastModified,
    });

    // 파일 타입 체크
    if (!file.type.startsWith("image/")) {
      console.error("Invalid file type:", file.type);
      toast({
        title: "파일 형식 오류",
        description: "이미지 파일만 업로드 가능합니다.",
        variant: "destructive",
      });
      return;
    }

    // 파일 크기 체크 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      console.error("File size too large:", file.size);
      toast({
        title: "파일 크기 초과",
        description: "이미지 파일은 최대 5MB까지 업로드 가능합니다.",
        variant: "destructive",
      });
      return;
    }

    console.log("Validation passed, storing file and starting FileReader");

    // File 객체를 저장 (참조 유지)
    setSelectedFile(file);

    // FileReader로 Data URL 생성
    const reader = new FileReader();
    console.log("FileReader created");

    reader.onloadstart = () => {
      console.log("FileReader: onloadstart");
    };

    reader.onprogress = (e) => {
      console.log("FileReader: onprogress", {
        loaded: e.loaded,
        total: e.total,
        percent: e.total > 0 ? (e.loaded / e.total * 100).toFixed(2) + '%' : 'unknown'
      });
    };

    reader.onload = (e) => {
      console.log("FileReader: onload success");
      console.log("Result length:", reader.result?.toString().length);

      if (reader.result) {
        const resultStr = reader.result as string;
        console.log("Data URL prefix:", resultStr.substring(0, 50));
        setSelectedImage(resultStr);
        setShowCropModal(true);
        console.log("Modal should now be visible");
      } else {
        console.error("No result from FileReader");
      }
    };

    reader.onerror = (e) => {
      console.error("FileReader: onerror");
      console.error("Error details:", {
        error: reader.error,
        errorName: reader.error?.name,
        errorMessage: reader.error?.message,
        event: e
      });
      toast({
        title: "파일 읽기 오류",
        description: "이미지 파일을 읽을 수 없습니다.",
        variant: "destructive",
      });
      setSelectedFile(null);
    };

    reader.onabort = () => {
      console.error("FileReader: onabort - reading was aborted");
    };

    reader.onloadend = () => {
      console.log("FileReader: onloadend (always called)");
    };

    try {
      console.log("Starting readAsDataURL...");
      reader.readAsDataURL(file);
      console.log("readAsDataURL called successfully");
    } catch (error) {
      console.error("Exception when calling readAsDataURL:", error);
      toast({
        title: "파일 읽기 오류",
        description: "이미지 파일을 읽을 수 없습니다.",
        variant: "destructive",
      });
    }
  };

  const handleCropComplete = (blob: Blob) => {
    try {
      setCroppedBlob(blob);

      // 이전 미리보기 URL 정리
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }

      // 새 미리보기 URL 생성
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);

      // 모달 닫기 및 상태 초기화
      setShowCropModal(false);
      setSelectedImage(null);
      setSelectedFile(null);
    } catch (error) {
      console.error("Error handling crop:", error);
      toast({
        title: "이미지 처리 오류",
        description: "이미지를 처리하는 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhone(formatted);
  };

  const handleSaveProfile = async () => {
    if (!profile) return;

    setSaving(true);
    try {
      // 크롭된 프로필 이미지 업로드
      if (croppedBlob) {
        const file = new File([croppedBlob], `profile-${Date.now()}.jpg`, {
          type: "image/jpeg",
        });

        const result = await uploadProfileImage(profile.id, file);
        if (!result.success) {
          toast({
            title: "이미지 업로드 실패",
            description: result.error || "이미지 업로드 중 오류가 발생했습니다.",
            variant: "destructive",
          });
          setSaving(false);
          return;
        }
      }

      // 프로필 정보 업데이트 (전화번호는 하이픈 제거 후 저장)
      const result = await updateProfile(profile.id, {
        full_name: fullName,
        phone: phone ? unformatPhoneNumber(phone) : null,
        company_name: companyName || null,
      });

      if (result.success) {
        toast({
          title: "저장 완료",
          description: "프로필이 성공적으로 업데이트되었습니다.",
        });
        router.push("/my");
      } else {
        toast({
          title: "저장 실패",
          description: result.error || "프로필 업데이트 중 오류가 발생했습니다.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Save error:", error);
      toast({
        title: "저장 실패",
        description: "프로필 업데이트 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword || !confirmPassword) {
      toast({
        title: "입력 오류",
        description: "새 비밀번호를 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "입력 오류",
        description: "비밀번호가 일치하지 않습니다.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "입력 오류",
        description: "비밀번호는 최소 6자 이상이어야 합니다.",
        variant: "destructive",
      });
      return;
    }

    setChangingPassword(true);
    try {
      const result = await changePassword(newPassword);

      if (result.success) {
        toast({
          title: "변경 완료",
          description: "비밀번호가 성공적으로 변경되었습니다.",
        });
        setNewPassword("");
        setConfirmPassword("");
      } else {
        toast({
          title: "변경 실패",
          description: result.error || "비밀번호 변경 중 오류가 발생했습니다.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Password change error:", error);
      toast({
        title: "변경 실패",
        description: "비밀번호 변경 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen py-8">
        <div className="container mx-auto max-w-2xl px-4 md:px-6">
          <Card>
            <CardContent className="p-6">
              <div className="h-96 animate-pulse rounded-lg bg-gray-200" />
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="min-h-screen py-8">
        <div className="container mx-auto max-w-2xl px-4 md:px-6">
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">프로필 정보를 찾을 수 없습니다.</p>
              <Button asChild className="mt-4 bg-teal hover:bg-teal-600">
                <Link href="/my">MY PAGE로 돌아가기</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen py-8">
      <div className="container mx-auto max-w-2xl px-4 md:px-6">
        {/* 헤더 */}
        <div className="mb-6 flex items-center gap-4">
          <Button asChild variant="ghost" size="icon">
            <Link href="/my">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">프로필 수정</h1>
        </div>

        {/* 프로필 정보 수정 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>기본 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 프로필 이미지 */}
            <div className="flex items-center gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={previewUrl || undefined} />
                <AvatarFallback className="bg-teal/10 text-2xl text-teal">
                  {fullName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <Label
                  htmlFor="profile-image"
                  className="cursor-pointer inline-flex items-center gap-2 rounded-md bg-gray-100 px-4 py-2 text-sm font-medium hover:bg-gray-200"
                >
                  <Upload className="h-4 w-4" />
                  이미지 업로드
                </Label>
                <Input
                  id="profile-image"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
                <p className="mt-2 text-xs text-muted-foreground">
                  JPG, PNG 형식 (최대 5MB)
                </p>
                <p className="text-xs text-muted-foreground">
                  업로드 후 1:1 비율로 편집할 수 있습니다
                </p>
              </div>
            </div>

            <Separator />

            {/* 이름 */}
            <div className="space-y-2">
              <Label htmlFor="full-name">이름 *</Label>
              <Input
                id="full-name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="이름을 입력하세요"
              />
            </div>

            {/* 전화번호 */}
            <div className="space-y-2">
              <Label htmlFor="phone">전화번호</Label>
              <Input
                id="phone"
                value={phone}
                onChange={handlePhoneChange}
                placeholder="010-0000-0000"
                maxLength={13}
              />
            </div>

            {/* 회사명 */}
            <div className="space-y-2">
              <Label htmlFor="company">회사명</Label>
              <Input
                id="company"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="회사명을 입력하세요"
              />
            </div>

            {/* 저장 버튼 */}
            <div className="flex gap-3">
              <Button
                onClick={handleSaveProfile}
                disabled={saving || !fullName}
                className="flex-1 bg-teal hover:bg-teal-600"
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    저장 중...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    저장
                  </>
                )}
              </Button>
              <Button asChild variant="outline" disabled={saving}>
                <Link href="/my">취소</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 비밀번호 변경 */}
        <Card>
          <CardHeader>
            <CardTitle>비밀번호 변경</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">새 비밀번호</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="새 비밀번호 (최소 6자)"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">비밀번호 확인</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="비밀번호 확인"
              />
            </div>

            <Button
              onClick={handleChangePassword}
              disabled={changingPassword || !newPassword || !confirmPassword}
              variant="outline"
              className="w-full"
            >
              {changingPassword ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  변경 중...
                </>
              ) : (
                "비밀번호 변경"
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* 이미지 크롭 모달 */}
      {showCropModal && selectedImage && (
        <ImageCropModal
          image={selectedImage}
          onClose={() => {
            setShowCropModal(false);
            setSelectedImage(null);
            setSelectedFile(null);
          }}
          onComplete={handleCropComplete}
        />
      )}
    </main>
  );
}
