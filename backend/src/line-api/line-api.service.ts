// File: src/line-api/line-api.service.ts
import { Injectable } from '@nestjs/common';
import { Client } from '@line/bot-sdk';

@Injectable()
export class LineApiService {
  private client: Client;

  constructor() {
    this.client = new Client({
      channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN || '',
      channelSecret: process.env.LINE_CHANNEL_SECRET,
    });
  }

  // ฟังก์ชันส่งข้อความหาลูกค้า
  async pushMessage(lineUserId: string, message: string) {
    if (!lineUserId) return;
    
    try {
      await this.client.pushMessage(lineUserId, {
        type: 'text',
        text: message,
      });
      console.log(`✅ Sent LINE message to ${lineUserId}`);
    } catch (error) {
      console.error('❌ Failed to send LINE message:', error);
    }
  }

  // (Optional) ส่งข้อความแบบ Flex Message หรือ Sticker ได้ที่นี่
}