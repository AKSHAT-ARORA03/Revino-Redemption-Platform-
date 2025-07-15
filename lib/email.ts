import nodemailer from "nodemailer"

// Email configuration with fallback values
const createTransporter = () => {
  try {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: Number.parseInt(process.env.SMTP_PORT || "587"),
      secure: false,
      auth: {
        user: process.env.SMTP_USER || "ayushninawe45@gmail.com",
        pass: process.env.SMTP_PASS || "your-app-password-here",
      },
    })
  } catch (error) {
    console.error("Failed to create email transporter:", error)
    return null
  }
}

const transporter = createTransporter()

export async function sendEmail(to: string, subject: string, html: string): Promise<{success: boolean; message: string}> {
  try {
    // Always log the email for debugging
    console.log("=== EMAIL NOTIFICATION ===")
    console.log(`From: ${process.env.SMTP_USER || "akshatarora0307@gmail.com"}`)
    console.log(`To: ${to}`)
    console.log(`Subject: ${subject}`)
    console.log("========================")

    // Force email sending regardless of environment
    if (!transporter) {
      const errorMsg = "Email transporter not configured";
      console.error(`❌ ${errorMsg}`);
      return { 
        success: false, 
        message: errorMsg 
      };
    }

    // Try to send the actual email using the configured transporter
    await transporter.sendMail({
      from: process.env.SMTP_FROM || `"Reward System" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    })
    
    console.log(`✅ Email sent successfully to ${to}`)
    return { 
      success: true, 
      message: `Email sent successfully to ${to}` 
    };
  } catch (error) {
    const errorMsg = `Failed to send email to ${to}: ${error instanceof Error ? error.message : 'Unknown error'}`;
    console.error(`❌ Email service error:`, errorMsg)
    return { 
      success: false, 
      message: errorMsg 
    };
  }
}

export function generateRedemptionCodeEmail(
  employeeName: string,
  redemptionCode: string,
  coinAmount: number,
  companyName: string,
): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
        <h1 style="color: white; margin: 0; font-size: 28px;">🎉 You've Got Coins!</h1>
        <p style="color: #f0f0f0; margin: 10px 0 0 0; font-size: 16px;">From ${companyName}</p>
      </div>
      
      <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
        <h2 style="color: #333; margin: 0 0 15px 0;">Hello ${employeeName}! 👋</h2>
        <p style="color: #666; line-height: 1.6; margin: 0;">
          Great news! You have received <strong style="color: #2563eb;">${coinAmount} coins</strong> 
          from <strong>${companyName}</strong>. Use these coins to purchase amazing vouchers from our marketplace!
        </p>
      </div>
      
      <div style="background: #2563eb; padding: 25px; border-radius: 8px; text-align: center; margin-bottom: 25px;">
        <h3 style="margin: 0 0 15px 0; color: white; font-size: 18px;">Your Redemption Code</h3>
        <div style="background: white; padding: 15px; border-radius: 6px; margin: 15px 0;">
          <div style="font-size: 32px; font-weight: bold; color: #2563eb; letter-spacing: 4px; font-family: monospace;">
            ${redemptionCode}
          </div>
        </div>
        <p style="margin: 0; color: #e0e7ff; font-size: 14px;">
          This code is worth ${coinAmount} coins and expires in 30 days
        </p>
      </div>
      
      <div style="background: #f0f9ff; border: 1px solid #bae6fd; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
        <h3 style="color: #0369a1; margin: 0 0 15px 0; font-size: 16px;">📋 How to Redeem:</h3>
        <ol style="color: #0369a1; line-height: 1.8; margin: 0; padding-left: 20px;">
          <li>Visit our platform: <a href="${appUrl}" style="color: #2563eb;">${appUrl}</a></li>
          <li>Login to your account (or register if you're new)</li>
          <li>Go to the "Redeem Code" section</li>
          <li>Enter your code: <strong>${redemptionCode}</strong></li>
          <li>Your coins will be added instantly!</li>
          <li>Browse and purchase vouchers from the marketplace</li>
        </ol>
      </div>
      
      <div style="text-align: center; margin-bottom: 25px;">
        <a href="${appUrl}/login" 
           style="background: #2563eb; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
          Redeem Your Coins Now →
        </a>
      </div>
      
      <div style="background: #fef3c7; border: 1px solid #fbbf24; padding: 15px; border-radius: 6px; margin-bottom: 25px;">
        <p style="margin: 0; color: #92400e; font-size: 14px;">
          <strong>⚠️ Important:</strong> This code expires in 30 days and can only be used once. 
          Make sure to redeem it soon!
        </p>
      </div>
      
      <div style="text-align: center; padding-top: 20px; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 14px; margin: 0;">
          Best regards,<br>
          <strong>Reward System Team</strong><br>
          <em>Making rewards simple and fun! 🎁</em>
        </p>
      </div>
    </div>
  `
}

export function generateVoucherAssignmentEmail(
  employeeName: string,
  voucherTitle: string,
  companyName: string,
): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">🎁 New Voucher Assigned!</h2>
      <p>Dear ${employeeName},</p>
      <p>You have been assigned a new voucher: <strong>${voucherTitle}</strong> from <strong>${companyName}</strong>!</p>
      
      <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin: 0; color: #2563eb;">Voucher: ${voucherTitle}</h3>
        <p style="margin: 10px 0 0 0; color: #666;">Check your dashboard to redeem this voucher.</p>
      </div>
      
      <a href="${appUrl}/login" 
         style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0;">
        View Your Vouchers
      </a>
      
      <p style="margin-top: 30px; color: #666; font-size: 14px;">
        Best regards,<br>
        Reward System Team
      </p>
    </div>
  `
}
