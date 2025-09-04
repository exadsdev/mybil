'use client';

import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import * as htmlToImage from 'html-to-image';
import { saveAs } from 'file-saver';
import QRCode from 'qrcode';
import buildPromptPayPayload from 'promptpay-qr';
import './receipt.css';

export default function CustomerPage({ params: paramsPromise }) {
  const params = React.use(paramsPromise);

  const [data, setData] = useState([]);
  const [qrSrc, setQrSrc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const receiptRef = useRef(null);

  // ===== ENV =====
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE; // << ใช้ API จาก .env
  const accountNumber = process.env.NEXT_PUBLIC_BANK_ACCOUNT;
  const bankName = process.env.NEXT_PUBLIC_BANK_NAME;
  const bankTitle = process.env.NEXT_PUBLIC_BANK_TITLE;
  const promptpayId = process.env.NEXT_PUBLIC_PROMPTPAY_ID;
  const bankImg = process.env.NEXT_PUBLIC_BANK_IMG;
  const promptpayImg = process.env.NEXT_PUBLIC_PROMPTPAY_IMG;

  // ===== Fetch =====
  useEffect(() => {
    if (!params?.customname) return;

    // สร้าง URL อย่างปลอดภัย (รองรับมี/ไม่มี /)
    const apiUrl = new URL(`/get/${encodeURIComponent(params.customname)}`, API_BASE).toString();

    axios
      .get(apiUrl)
      .then((res) => {
        if (!res.data || res.data.length === 0) setError(true);
        else setData(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [params, API_BASE]);

  // ===== Total =====
  const total = data.reduce(
    (sum, item) =>
      sum +
      Number(item.price || 0) +
      Number((item.ads_price || 0) * (item.adsdays || 0)),
    0
  );

  const today = new Date().toLocaleString('th-TH', {
    dateStyle: 'long',
    timeStyle: 'short',
  });

  const billNumber =
    data.length > 0 ? `2025${String(data[0].id).padStart(3, '0')}` : '2025000';

  // ===== Build PromptPay QR -> DataURL (no CORS) =====
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        if (!promptpayId || total <= 0) {
          setQrSrc(null);
          return;
        }
        const payload = buildPromptPayPayload(promptpayId, {
          amount: Number(total.toFixed(2)),
        });
        const url = await QRCode.toDataURL(payload, {
          errorCorrectionLevel: 'M',
          margin: 1,
          scale: 8,
        });
        if (alive) setQrSrc(url);
      } catch {
        if (alive) setQrSrc(null);
      }
    })();
    return () => { alive = false; };
  }, [promptpayId, total]);

  // ===== Helpers =====
  const waitForImages = async (rootEl) => {
    const imgs = Array.from(rootEl.querySelectorAll('img'));
    await Promise.all(
      imgs.map(
        (img) =>
          new Promise((resolve) => {
            if (img.complete && img.naturalWidth > 0) return resolve();
            img.onload = () => resolve();
            img.onerror = () => resolve();
          })
      )
    );
  };

  // ===== Download image (fits element size) =====
  const downloadReceipt = async () => {
    if (!receiptRef.current) return;
    try {
      await waitForImages(receiptRef.current);
      const rect = receiptRef.current.getBoundingClientRect();

      const dataUrl = await htmlToImage.toJpeg(receiptRef.current, {
        quality: 1,
        backgroundColor: '#ffffff',
        cacheBust: true,
        width: Math.ceil(rect.width),
        height: Math.ceil(rect.height),
        pixelRatio: 2,
        filter: (node) => {
          if (node && node.nodeType === 1 && node.tagName === 'IMG') {
            const src = node.getAttribute('src') || '';
            return (
              src.startsWith('data:') ||
              src.startsWith('blob:') ||
              src.startsWith('/') ||
              src.startsWith(window.location.origin)
            );
          }
          return true;
        },
      });

      const blob = await (await fetch(dataUrl)).blob();
      saveAs(blob, `receipt-${params.customname}.jpeg`);
    } catch {
      alert('เกิดข้อผิดพลาดในการดาวน์โหลดใบเสร็จ');
    }
  };

  const copyAccount = () => {
    navigator.clipboard.writeText(accountNumber).then(() => {
      alert('คัดลอกหมายเลขบัญชีแล้ว');
    });
  };

  if (loading) return <div className="text-center mt-5">กำลังโหลดข้อมูล...</div>;
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
      <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      <title>Bils บิลใบเสร็จแจ้งชำระค่าโฆษณา</title>

      <main className="receipt-container">
        <div ref={receiptRef} className="receipt-content">
          <div className="receipt-header">
            <img src="/logo.png" alt="logo" />
            <h2>ใบแจ้งหนี้ / ใบเสร็จ</h2>
            <p>โทร: 0956422872</p>
          </div>

          <div className="receipt-info">
            <strong>ลูกค้า:</strong> {params.customname} <br />
            <strong>วันที่:</strong> {today} <br />
            <strong>หมายเลขบิล:</strong> {billNumber}
          </div>

          <div className="table-wrap">
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
                      <td>{Number(item.price || 0).toLocaleString()} บาท</td>
                    </tr>
                    <tr>
                      <td>{item.ads}</td>
                      <td>{Number((item.ads_price || 0) * (item.adsdays || 0)).toLocaleString()} บาท</td>
                    </tr>
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>

          <div className="receipt-total">
            <strong>ยอดรวมทั้งหมด: {total.toLocaleString()} บาท</strong>
          </div>

          <hr />

          <div className="box">
            <div className="itemp text-center">
              <img src={promptpayImg} alt="PromptPay" className="bank-img" />
              {qrSrc && <img src={qrSrc} alt="QR พร้อมเพย์" className="qr-img" />}
              <p>ยอดชำระ: {total.toLocaleString()} บาท</p>
            </div>

            <div className="itemk text-center">
              <div className="imge">
                <img src={bankImg} alt="Bank" className="bank-img" />
              </div>
              <p>
                {bankTitle}
                <br />
                {bankName}
                <br />
                {accountNumber}
              </p>
              <button className="copy-btn" onClick={copyAccount}>
                คัดลอกเลขบัญชี
              </button>
            </div>
          </div>
        </div>

        {/* ปุ่มดาวน์โหลดลอยด้านล่าง */}
        <div className="page-actions-bottom">
          <button className="download-fab" onClick={downloadReceipt} aria-label="ดาวน์โหลดบิลเป็นภาพ">
            ดาวน์โหลดบิลเป็นภาพ
          </button>
        </div>
      </main>
    </>
  );
}
