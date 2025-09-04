'use client';
import React, { useEffect, useState, useRef, use } from 'react'; // ✅ import use
import axios from 'axios';
import * as htmlToImage from 'html-to-image';
import { saveAs } from 'file-saver';
import './receipt.css';

export default function CustomerPage({ params }) {
  const resolvedParams = use(params); // ✅ unwrap params
  const customname = resolvedParams?.customname || '';

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const receiptRef = useRef();
  const today = new Date().toLocaleString('th-TH', {
    dateStyle: 'long',
    timeStyle: 'short',
  });

  const accountNumber = "0991427422";

  useEffect(() => {
    if (!customname) return;

    axios
      .get(`http://localhost:5000/get/${encodeURIComponent(customname)}`)
      .then((res) => {
        if (!res.data || res.data.length === 0) {
          setError(true);
        } else {
          setData(res.data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError(true);
        setLoading(false);
      });
  }, [customname]);

  // ...โค้ดอื่นเหมือนเดิม



  // คำนวณยอดรวมทั้งหมด
  const total = data.reduce(
    (sum, item) => sum + Number(item.price || 0) + Number(item.ads_price || 0),
    0
  );

  const qrCodeUrl = `https://promptpay.io/1969800077553/${total}`;
  const billNumber =
    data.length > 0 ? `2025${data[0].id.toString().padStart(3, '0')}` : '2025000';

  // ดาวน์โหลดใบเสร็จเป็นภาพ
  const downloadReceipt = () => {
    if (!receiptRef.current) return;
    htmlToImage
      .toJpeg(receiptRef.current, { quality: 1, backgroundColor: 'white', pixelRatio: 2 })
      .then((dataUrl) => {
        saveAs(dataUrl, `receipt-${customname}.jpeg`);
      })
      .catch((err) => {
        console.error('Error generating image:', err);
      });
  };

  // คัดลอกเลขบัญชี
  const copyAccount = () => {
    navigator.clipboard.writeText(accountNumber).then(() => {
      alert('คัดลอกหมายเลขบัญชีแล้ว');
    });
  };

  if (loading) return <div className="container mt-5 text-center">กำลังโหลดข้อมูล...</div>;

  if (error)
    return (
      <div className="notfound-container">
        <div className="notfound-card">
          <img src="/404.webp" width="100%" alt="404" />
          <p>ไม่พบข้อมูลลูกค้า</p>
        </div>
      </div>
    );

  return (
    <>
      {/* Meta Tags สำหรับ SEO */}
      <title>Bils บิลใบเสร็จแจ้งชำระค่าโฆษณา - {customname}</title>
      <meta name="title" content={`Bils บิลใบเสร็จแจ้งชำระค่าโฆษณา - ${customname}`} />
      <meta
        name="description"
        content={`บิลใบเสร็จแจ้งชำระค่าบริการค่าโฆษณาของลูกค้า ${customname} จำนวน ${total.toLocaleString()} บาท`}
      />
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://bil.myad-dev.com/" />
      <meta property="og:title" content={`Bils บิลใบเสร็จ - ${customname}`} />
      <meta
        property="og:description"
        content={`บิลใบเสร็จแจ้งชำระค่าบริการค่าโฆษณาของลูกค้า ${customname} จำนวน ${total.toLocaleString()} บาท`}
      />
      <meta property="og:image" content="https://bil.myad-dev.com/logo.png" />
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content="https://bil.myad-dev.com/" />
      <meta property="twitter:title" content={`Bils บิลใบเสร็จ - ${customname}`} />
      <meta
        property="twitter:description"
        content={`บิลใบเสร็จแจ้งชำระค่าบริการค่าโฆษณาของลูกค้า ${customname} จำนวน ${total.toLocaleString()} บาท`}
      />
      <meta property="twitter:image" content="https://bil.myad-dev.com/logo.png" />
      <link rel="shortcut icon" href="https://bil.myad-dev.com/logo.png" type="image/x-icon" />

      <main className="receipt-container">
        <div ref={receiptRef} className="receipt-content">
          {/* Header */}
          <div className="receipt-header">
            <img src="/logo.png" alt="logo" />
            <h2>ใบแจ้งหนี้ / ใบเสร็จ</h2>
            <p>โทร: 0956422872</p>
          </div>

          {/* ข้อมูลลูกค้า */}
          <div className="receipt-info">
            <strong>ลูกค้า:</strong> {customname} <br />
            <strong>วันที่:</strong> {today} <br />
            <strong>หมายเลขบิล:</strong> {billNumber}
          </div>

          {/* ตารางรายการสินค้าและราคา */}
          <table className="receipt-table">
            <thead>
              <tr>
                <th>รายการ</th>
                <th>ราคา (บาท)</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item) => (
                <React.Fragment key={item.id}>
                  <tr>
                    <td>{item.name}</td>
                    <td>{Number(item.price).toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td>{item.ads}</td>
                    <td>{Number(item.ads_price).toLocaleString()}</td>
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>

          {/* ยอดรวมทั้งหมด */}
          <div className="receipt-total">
            <strong>ยอดรวมทั้งหมด: {total.toLocaleString()} บาท</strong>
          </div>

          <hr />

          {/* ส่วนการชำระเงิน */}
          <div className="box">
            {/* QR PromptPay */}
            <div className="itemp text-center">
              <img src="/p.jpg" alt="PromptPay" className="bank-img" />
              <img src={qrCodeUrl} alt="QR พร้อมเพย์" className="qr-img" />
              <p>ยอดชำระ: {total.toLocaleString()} บาท</p>
            </div>

            
            <div className="itemk text-center">
              <div className="imge">
                <img src="/k.png" alt="Bank" className="bank-img" />
              </div>
              <p>
                ธนาคารกสิกรไทย
                <br />
                K. Penapa Chongngam
                <br />
                {accountNumber}
              </p>
              <button className="copy-btn" onClick={copyAccount}>
                คัดลอกเลขบัญชี
              </button>
            </div>
          </div>

          {/* ปุ่มดาวน์โหลด */}
          <div className="download-btn-container text-center mt-3">
            <button className="download-btn" onClick={downloadReceipt}>
              ดาวน์โหลดบิลเป็นภาพ
            </button>
          </div>
        </div>
      </main>
    </>
  );
}
