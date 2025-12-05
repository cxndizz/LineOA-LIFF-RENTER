<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white p-4 shadow-sm flex items-center gap-3 sticky top-0 z-10">
      <button @click="router.back()" class="text-2xl">⬅️</button>
      <h1 class="font-bold text-lg">นโยบายความเป็นส่วนตัว</h1>
    </div>

    <!-- Content -->
    <div class="p-6 bg-white m-4 rounded-xl shadow-sm">
      <div class="prose max-w-none">
        <h2 class="text-xl font-bold text-gray-800 mb-4">นโยบายความเป็นส่วนตัว</h2>

        <p class="text-gray-600 mb-4">
          เราให้ความสำคัญกับความเป็นส่วนตัวและการคุ้มครองข้อมูลส่วนบุคคลของท่าน
          นโยบายฉบับนี้อธิบายวิธีการเก็บรวบรวม ใช้ และเปิดเผยข้อมูลส่วนบุคคลของท่าน
        </p>

        <h3 class="text-lg font-bold text-gray-800 mt-6 mb-3">1. ข้อมูลที่เราเก็บรวบรวม</h3>
        <p class="text-gray-600 mb-2">เราเก็บรวบรวมข้อมูลต่อไปนี้:</p>
        <ul class="list-disc pl-6 space-y-2 text-gray-600">
          <li><strong>ข้อมูลจาก LINE:</strong> LINE User ID, ชื่อที่แสดง, รูปโปรไฟล์</li>
          <li><strong>ข้อมูลส่วนบุคคล:</strong> ชื่อ-นามสกุล, เบอร์โทรศัพท์, ที่อยู่</li>
          <li><strong>ข้อมูลการทำธุรกรรม:</strong> ประวัติการจอง, การชำระเงิน, สลิปโอนเงิน</li>
          <li><strong>ข้อมูลการใช้งาน:</strong> Log การเข้าใช้งาน, พฤติกรรมการใช้บริการ</li>
        </ul>

        <h3 class="text-lg font-bold text-gray-800 mt-6 mb-3">2. วัตถุประสงค์ในการเก็บข้อมูล</h3>
        <p class="text-gray-600 mb-2">เราใช้ข้อมูลของท่านเพื่อ:</p>
        <ul class="list-disc pl-6 space-y-2 text-gray-600">
          <li>ยืนยันตัวตนและจัดการบัญชีผู้ใช้</li>
          <li>ดำเนินการจองและให้บริการเช่าสินค้า</li>
          <li>ติดต่อสื่อสารเกี่ยวกับการจองและการส่งมอบสินค้า</li>
          <li>ส่งการแจ้งเตือนผ่าน LINE Messaging API</li>
          <li>ปรับปรุงและพัฒนาบริการของเรา</li>
          <li>ปฏิบัติตามกฎหมายและระเบียบที่เกี่ยวข้อง</li>
        </ul>

        <h3 class="text-lg font-bold text-gray-800 mt-6 mb-3">3. การเปิดเผยข้อมูล</h3>
        <p class="text-gray-600 mb-2">เราจะไม่เปิดเผยข้อมูลของท่านแก่บุคคลที่สาม ยกเว้น:</p>
        <ul class="list-disc pl-6 space-y-2 text-gray-600">
          <li>เมื่อได้รับความยินยอมจากท่าน</li>
          <li>เมื่อกฎหมายกำหนดหรือมีคำสั่งศาล</li>
          <li>เพื่อป้องกันหรือตรวจสอบการทุจริต</li>
          <li>กับผู้ให้บริการที่จำเป็นต่อการดำเนินงาน (เช่น ธนาคาร, ผู้ให้บริการโฮสติ้ง)</li>
        </ul>

        <h3 class="text-lg font-bold text-gray-800 mt-6 mb-3">4. ระยะเวลาการเก็บรักษาข้อมูล</h3>
        <ul class="list-disc pl-6 space-y-2 text-gray-600">
          <li>เราจะเก็บข้อมูลของท่านตลอดระยะเวลาที่ท่านใช้บริการ</li>
          <li>ข้อมูลการทำธุรกรรมจะเก็บตามกำหนดกฎหมาย (อย่างน้อย 5 ปี)</li>
          <li>ท่านสามารถขอลบข้อมูลได้ตามสิทธิของท่าน</li>
        </ul>

        <h3 class="text-lg font-bold text-gray-800 mt-6 mb-3">5. สิทธิของท่าน</h3>
        <p class="text-gray-600 mb-2">ท่านมีสิทธิ์:</p>
        <ul class="list-disc pl-6 space-y-2 text-gray-600">
          <li>เข้าถึงและขอสำเนาข้อมูลส่วนบุคคล</li>
          <li>ขอแก้ไขข้อมูลที่ไม่ถูกต้องหรือไม่สมบูรณ์</li>
          <li>ขอลบหรือระงับการใช้ข้อมูล</li>
          <li>ขอให้โอนย้ายข้อมูล</li>
          <li>คัดค้านการประมวลผลข้อมูล</li>
          <li>ถอนความยินยอมที่เคยให้ไว้</li>
        </ul>

        <h3 class="text-lg font-bold text-gray-800 mt-6 mb-3">6. ความปลอดภัยของข้อมูล</h3>
        <ul class="list-disc pl-6 space-y-2 text-gray-600">
          <li>เราใช้มาตรการรักษาความปลอดภัยตามมาตรฐานสากล</li>
          <li>การเข้าถึงข้อมูลถูกจำกัดเฉพาะผู้ที่มีสิทธิ์</li>
          <li>ข้อมูลถูกเข้ารหัสและสำรองข้อมูลเป็นประจำ</li>
        </ul>

        <h3 class="text-lg font-bold text-gray-800 mt-6 mb-3">7. การติดต่อ</h3>
        <p class="text-gray-600">
          หากท่านมีคำถามหรือต้องการใช้สิทธิ์ กรุณาติดต่อเราผ่าน LINE Official Account
          หรือช่องทางที่เราระบุไว้ในแอปพลิเคชัน
        </p>

        <h3 class="text-lg font-bold text-gray-800 mt-6 mb-3">8. การเปลี่ยนแปลงนโยบาย</h3>
        <p class="text-gray-600">
          เราอาจปรับปรุงนโยบายนี้เป็นครั้งคราว การเปลี่ยนแปลงจะมีผลทันทีเมื่อเผยแพร่ผ่านแอปพลิเคชัน
          เราแนะนำให้ท่านตรวจสอบนโยบายเป็นประจำ
        </p>

        <p class="text-sm text-gray-500 mt-8 pb-4">
          อัปเดตล่าสุด: {{ new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' }) }}
        </p>
      </div>
    </div>
  </div>
</template>