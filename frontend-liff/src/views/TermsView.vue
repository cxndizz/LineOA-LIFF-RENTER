<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white p-4 shadow-sm flex items-center gap-3 sticky top-0 z-10">
      <button @click="router.back()" class="text-2xl">⬅️</button>
      <h1 class="font-bold text-lg">ข้อกำหนดและเงื่อนไขการใช้บริการ</h1>
    </div>

    <!-- Content -->
    <div class="p-6 bg-white m-4 rounded-xl shadow-sm">
      <div class="prose max-w-none">
        <h2 class="text-xl font-bold text-gray-800 mb-4">ข้อกำหนดการใช้บริการเช่า</h2>

        <p class="text-gray-600 mb-4">
          กรุณาอ่านข้อกำหนดและเงื่อนไขต่อไปนี้โดยละเอียดก่อนใช้บริการ การใช้บริการของเราถือว่าท่านยอมรับข้อกำหนดนี้ทั้งหมด
        </p>

        <h3 class="text-lg font-bold text-gray-800 mt-6 mb-3">1. การจอง และการชำระเงิน</h3>
        <ul class="list-disc pl-6 space-y-2 text-gray-600">
          <li>การจองจะสมบูรณ์เมื่อได้รับการชำระเงินและแอดมินอนุมัติแล้ว</li>
          <li>ค่ามัดจำ (ถ้ามี) จะถูกคืนเมื่อคืนของครบถ้วนและไม่เสียหาย</li>
          <li>การโอนเงินถือเป็นการยืนยันการจองและยอมรับเงื่อนไขทั้งหมด</li>
          <li>หากยกเลิกการจองหลังชำระเงิน จะไม่คืนเงิน ยกเว้นมีเหตุสุดวิสัย</li>
        </ul>

        <h3 class="text-lg font-bold text-gray-800 mt-6 mb-3">2. การรับและการคืนสินค้า</h3>
        <ul class="list-disc pl-6 space-y-2 text-gray-600">
          <li>ผู้เช่าต้องรับและคืนสินค้าตามวันและเวลาที่กำหนด</li>
          <li>หากคืนช้าจะมีค่าปรับ วันละ 20% ของราคาเช่าต่อวัน</li>
          <li>ต้องตรวจสอบสภาพสินค้าก่อนรับ และแจ้งปัญหาทันที (ถ้ามี)</li>
          <li>ผู้เช่าต้องรับผิดชอบสินค้าตลอดระยะเวลาการเช่า</li>
        </ul>

        <h3 class="text-lg font-bold text-gray-800 mt-6 mb-3">3. ความรับผิดชอบต่อสินค้า</h3>
        <ul class="list-disc pl-6 space-y-2 text-gray-600">
          <li>หากสินค้าเสียหาย สูญหาย หรือชำรุดจากการใช้งาน ผู้เช่าต้องชดใช้ค่าเสียหาย</li>
          <li>ไม่อนุญาตให้นำสินค้าไปให้ผู้อื่นใช้โดยไม่ได้รับอนุญาต</li>
          <li>ต้องใช้สินค้าตามวัตถุประสงค์และคู่มือการใช้งาน</li>
          <li>ห้ามดัดแปลงหรือซ่อมแซมสินค้าเอง</li>
        </ul>

        <h3 class="text-lg font-bold text-gray-800 mt-6 mb-3">4. การยกเลิกและการเปลี่ยนแปลง</h3>
        <ul class="list-disc pl-6 space-y-2 text-gray-600">
          <li>สามารถยกเลิกการจองได้ภายใน 24 ชั่วโมงหลังจอง (ก่อนชำระเงิน)</li>
          <li>หากต้องการเปลี่ยนแปลงวันเช่า ต้องแจ้งล่วงหน้าอย่างน้อย 48 ชั่วโมง</li>
          <li>ทางร้านขอสงวนสิทธิ์ในการปฏิเสธคำขอเปลี่ยนแปลงในช่วงเทศกาล</li>
        </ul>

        <h3 class="text-lg font-bold text-gray-800 mt-6 mb-3">5. ข้อจำกัดความรับผิด</h3>
        <ul class="list-disc pl-6 space-y-2 text-gray-600">
          <li>ทางร้านไม่รับผิดชอบต่อความเสียหายที่เกิดจากการใช้งานสินค้า</li>
          <li>ไม่รับผิดชอบสูญหายหรือเสียหายของทรัพย์สินส่วนตัวของผู้เช่า</li>
          <li>ไม่รับผิดชอบกรณีเหตุสุดวิสัย เช่น ภัยธรรมชาติ อุบัติเหตุ</li>
        </ul>

        <h3 class="text-lg font-bold text-gray-800 mt-6 mb-3">6. การติดต่อและข้อพิพาท</h3>
        <ul class="list-disc pl-6 space-y-2 text-gray-600">
          <li>หากมีข้อสงสัยหรือปัญหา กรุณาติดต่อทางแอดมินผ่าน LINE OA</li>
          <li>ข้อพิพาทใดๆ จะยึดกฎหมายไทยเป็นหลักในการตัดสิน</li>
        </ul>

        <p class="text-sm text-gray-500 mt-8 pb-4">
          อัปเดตล่าสุด: {{ new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' }) }}
        </p>
      </div>
    </div>
  </div>
</template>