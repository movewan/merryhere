import { NextResponse } from "next/server";
import { Resend } from "resend";

// Resend 인스턴스 (런타임에 초기화)
let resend: Resend | null = null;

function getResend() {
  if (!resend && process.env.RESEND_API_KEY) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, data } = body;

    // 이메일 수신자 주소
    const recipientEmail = "merryhere@mysc.co.kr";

    let emailContent = {
      // 발신자 주소 (Resend 도메인 검증 필요: https://resend.com/domains)
      // mysc.co.kr 도메인 검증이 완료되면 정상 작동
      from: "MERRYHERE <merryhere@mysc.co.kr>",
      to: recipientEmail,
      subject: "",
      html: "",
    };

    // 문의하기
    if (type === "inquiry") {
      emailContent.subject = `[MERRYHERE] 새로운 문의: ${data.inquiryType}`;
      emailContent.html = `
        <h2>새로운 문의가 접수되었습니다</h2>
        <hr />
        <h3>문의자 정보</h3>
        <ul>
          <li><strong>이름:</strong> ${data.name}</li>
          <li><strong>이메일:</strong> ${data.email}</li>
          <li><strong>전화번호:</strong> ${data.phone || "미입력"}</li>
          <li><strong>회사명:</strong> ${data.company || "미입력"}</li>
        </ul>
        <h3>문의 내용</h3>
        <ul>
          <li><strong>문의 유형:</strong> ${getInquiryTypeLabel(data.inquiryType)}</li>
          <li><strong>메시지:</strong></li>
        </ul>
        <p style="white-space: pre-wrap; background: #f5f5f5; padding: 15px; border-radius: 5px;">
          ${data.message}
        </p>
        <hr />
        <p style="color: #666; font-size: 12px;">
          접수 시간: ${new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })}
        </p>
      `;
    }
    // 회원가입
    else if (type === "signup") {
      emailContent.subject = `[MERRYHERE] 새로운 회원가입: ${data.name}`;
      emailContent.html = `
        <h2>새로운 회원이 가입했습니다</h2>
        <hr />
        <h3>회원 정보</h3>
        <ul>
          <li><strong>이름:</strong> ${data.name}</li>
          <li><strong>이메일:</strong> ${data.email}</li>
          <li><strong>전화번호:</strong> ${data.phone || "미입력"}</li>
          <li><strong>회사명:</strong> ${data.company || "미입력"}</li>
          <li><strong>사업자등록번호:</strong> ${data.businessNumber || "미입력"}</li>
          <li><strong>회원 유형:</strong> ${data.userType === "tenant" ? "입주 회원" : "일반 회원"}</li>
        </ul>
        <hr />
        <p style="color: #666; font-size: 12px;">
          가입 시간: ${new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })}
        </p>
      `;
    }

    // Resend API를 통해 이메일 발송
    const resendInstance = getResend();
    if (!resendInstance) {
      return NextResponse.json(
        { success: false, error: "Email service not configured" },
        { status: 500 }
      );
    }

    const { data: emailData, error } = await resendInstance.emails.send(emailContent);

    if (error) {
      console.error("Email send error:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: emailData });
  } catch (error) {
    console.error("Email API error:", error);
    return NextResponse.json(
      { success: false, error: "이메일 발송에 실패했습니다." },
      { status: 500 }
    );
  }
}

function getInquiryTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    tour: "투어 문의",
    space: "공간 이용 문의",
    program: "프로그램 문의",
    tenant: "입주 문의",
    other: "기타 문의",
  };
  return labels[type] || type;
}
