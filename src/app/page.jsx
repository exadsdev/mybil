'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Head from 'next/head';

export default function Home() {
  const router = useRouter();

  // ===== ENV: API base =====
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE; // e.g. http://localhost:5000

  // ถ้าไม่ได้ตั้งค่าไว้ จะเตือนใน console (ยังใช้งานได้ถ้าคุณเติมภายหลัง)
  useEffect(() => {
    if (!API_BASE) {
      console.error('Missing env: NEXT_PUBLIC_API_BASE');
    }
  }, [API_BASE]);

  // helper ต่อ URL อย่างปลอดภัย (รองรับการมี/ไม่มี / ท้ายโดเมน)
  const apiUrl = (path) => new URL(path, API_BASE).toString();

  const [data, setData] = useState([]);
  const [form, setForm] = useState({
    customname: '',
    name: '',
    price: '',
    ads: '',
    ads_price: '',
    days: '',
    adsdays: '',
  });

  // ตรวจสอบ login
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (isLoggedIn !== 'true') {
      router.push('/login');
    } else {
      fetchData();
    }
  }, [router]);

  const fetchData = async () => {
    try {
      const res = await axios.get(apiUrl('/get'));
      setData(res.data || []);
    } catch (err) {
      console.error(err);
      alert('ดึงข้อมูลไม่สำเร็จ');
    }
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.customname) {
      alert('กรุณากรอกชื่อลูกค้าและบริการ');
      return;
    }

    try {
      await axios.post(apiUrl('/add'), form);
      await fetchData();
      setForm({
        customname: '',
        name: '',
        price: '',
        ads: '',
        ads_price: '',
        days: '',
        adsdays: '',
      });
    } catch (err) {
      console.error(err);
      alert('บันทึกข้อมูลไม่สำเร็จ');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('คุณต้องการลบข้อมูลใช่หรือไม่?')) return;
    try {
      await axios.delete(apiUrl(`/delete/${id}`));
      await fetchData();
    } catch (err) {
      console.error(err);
      alert('ลบข้อมูลไม่สำเร็จ');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    router.push('/login');
  };

  return (
    <>
      <Head>
        <title>Bils บิลใบเสร็จแจ้งชำระค่าโฆษณา</title>
        <meta name="title" content="Bils บิลใบเสร็จแจ้งชำระค่าโฆษณา" />
        <meta name="description" content="บิลใบเสร็จแจ้งชำระค่าบริการค่าโฆษณา" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://bil.myad-dev.com/" />
        <meta property="og:title" content="Bils บิลใบเสร็จแจ้งชำระค่าโฆษณา" />
        <meta property="og:description" content="Bils บิลใบเสร็จแจ้งชำระค่าบริการค่าโฆษณา" />
        <meta property="og:image" content="https://bil.myad-dev.com/logo.png" />
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://bil.myad-dev.com/" />
        <meta property="twitter:title" content="Bils บิลใบเสร็จแจ้งชำระค่าโฆษณา" />
        <meta property="twitter:description" content="Bils บิลใบเสร็จแจ้งชำระค่าบริการค่าโฆษณา" />
        <meta property="twitter:image" content="https://bil.myad-dev.com/logo.png" />
        <link rel="shortcut icon" href="https://bil.myad-dev.com/logo.png" type="image/x-icon" />
      </Head>

      <div className="container mt-5">
        <div className="text-end mb-3">
          <button className="btn btn-warning" onClick={handleLogout}>Logout</button>
        </div>

        <h1 className="text-center mb-4">ระบบจัดการบิล</h1>

        <form onSubmit={handleSubmit} className="row g-3 mb-5">
          <div className="col-md-4">
            <input
              type="text"
              className="form-control"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="บริการ"
              list="name"
            />
          </div>
          <div className="col-md-4">
            <input
              type="text"
              className="form-control"
              name="days"
              value={form.days}
              onChange={handleChange}
              placeholder="จำนวนวัน"
              list="days"
            />
          </div>
          <div className="col-md-4">
            <input
              type="number"
              className="form-control"
              name="price"
              value={form.price}
              onChange={handleChange}
              placeholder="ราคา"
              list="price"
            />
          </div>

          <hr />

          <div className="col-md-4">
            <input
              type="text"
              className="form-control"
              name="ads"
              value={form.ads}
              onChange={handleChange}
              placeholder="ค่าโฆษณา"
              list="ads"
            />
          </div>
          <div className="col-md-4">
            <input
              type="number"
              className="form-control"
              name="adsdays"
              value={form.adsdays}
              onChange={handleChange}
              placeholder="ค่าโฆษณา-วัน"
              list="adsdays"
            />
          </div>
          <div className="col-md-4">
            <input
              type="number"
              className="form-control"
              name="ads_price"
              value={form.ads_price}
              onChange={handleChange}
              placeholder="ราคาโฆษณา"
              list="ads_price"
            />
          </div>

          <hr />

          <div className="col-12">
            <input
              type="text"
              className="form-control"
              name="customname"
              value={form.customname}
              onChange={handleChange}
              placeholder="ชื่อลูกค้า"
              required
            />
          </div>
          <div className="col-12">
            <button type="submit" className="btn btn-primary w-100 p-3">เพิ่มข้อมูล</button>
          </div>
        </form>

        <table className="table table-bordered text-center">
          <thead className="table-dark">
            <tr>
              <th>#</th>
              <th>ชื่อลูกค้า</th>
              <th>ดูบิล</th>
              <th>ลบ</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={item.id}>
                <td>{index + 1}</td>
                <td>{item.customname}</td>
                <td>
                  <Link href={`/customer/${encodeURIComponent(item.customname)}`} target="_blank">
                    <button className="btn btn-sm btn-success">ดูบิลลูกค้า</button>
                  </Link>
                </td>
                <td>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(item.id)}>
                    ลบ
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Datalists */}
        <datalist id="name">
          <option value="คอร์สเรียนทำโฆษณาออนไลน์ facebook Ads สายเทา" />
          <option value="คอร์สเรียนทำโฆษณาออนไลน์ Google Ads สายเทา" />
          <option value="บริการทำโฆษณา facebook Ads งานเทา" />
          <option value="บริการทำโฆษณา Google Ads งานเทา" />
        </datalist>
        <datalist id="days">
          <option value="7 วัน" />
          <option value="15 วัน" />
          <option value="1 เดือน" />
        </datalist>
        <datalist id="adsdays">
          <option value="1" />
          <option value="3" />
          <option value="7" />
          <option value="15" />
          <option value="30" />
        </datalist>
        <datalist id="ads_price">
          <option value="500" />
          <option value="1000" />
          <option value="2000" />
          <option value="3000" />
          <option value="5000" />
        </datalist>
        <datalist id="price">
          <option value="3500" />
          <option value="6000" />
          <option value="9900" />
          <option value="10000" />
          <option value="18500" />
        </datalist>
        <datalist id="ads">
          <option value="ค่าโฆษณาที่ต้องจ่ายให้กับ Google (งบยิง) วัน x บาท" />
          <option value="ค่าโฆษณาที่ต้องจ่ายให้กับ facebook (งบยิง) วัน x บาท" />
        </datalist>
      </div>
    </>
  );
}
