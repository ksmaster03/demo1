/**
 * / — Landing page (Claude Code Weekend)
 * Ports design from legacy-static/index.html
 * Booking widget wires to /api/checkout via BookingWidget client component
 */
import { Suspense } from "react";
import NavBar from "@/components/NavBar";
import BookingWidget from "@/components/BookingWidget";
import LangScript from "@/components/LangScript";
import RevealScript from "@/components/RevealScript";

export default function HomePage() {
  return (
    <>
      {/* ── Topbar ───────────────────────────────────────────────── */}
      <div className="topbar">
        <span className="mi">weekend</span>{" "}
        สอนเฉพาะเสาร์-อาทิตย์ —{" "}
        <b>ปรึกษาฟรี 20 นาที</b> แล้วเริ่ม ฿1,000/ชม. · เข้าสู่ระบบด้วย Google หรือ LINE เพื่อจอง
      </div>

      <NavBar />

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <header className="hero">
        <div className="wrap hero-grid">
          <div>
            <span className="pill">
              <span className="mi">terminal</span>
              <span>เรียนสด 1:1 · ลงมือทำงานจริงทุกคาบ</span>
            </span>
            <h1>
              เก่ง <span className="grad">Claude Code</span> ได้ในวันหยุด เรียนตัวต่อตัว ลงมือทำโปรเจกต์จริง
            </h1>
            <p className="lead">
              คอร์สสด 1:1 สอนใช้ Claude Code ทำงานจริง ตั้งแต่ติดตั้งจนสร้างและ deploy
              แอปได้เอง ฿1,000/ชั่วโมง เฉพาะเสาร์-อาทิตย์ จองออนไลน์ ชำระผ่าน Stripe
            </p>
            <div className="hero-cta">
              <a className="btn btn-cta" href="#booking">
                <span className="mi">event_available</span>
                <span>จองเรียน (เสาร์-อาทิตย์)</span>
              </a>
              <a className="btn btn-ghost" href="#learn">
                ดูเนื้อหา
              </a>
            </div>
            <div className="reassure">
              <span className="mi">check_circle</span>
              <span>
                เริ่มจาก <b>ปรึกษาฟรี 20 นาที</b> — ยังไม่ต้องจ่าย
              </span>
            </div>
            <div className="hero-trust">
              <div className="t"><b>4.9★</b><span>180+ รีวิว</span></div>
              <div className="t"><b>600+</b><span>ชั่วโมงที่สอน</span></div>
              <div className="t"><b>350+</b><span>ผู้เรียน</span></div>
              <div className="t"><b>Sat–Sun</b><span>เฉพาะวันหยุด</span></div>
            </div>
          </div>

          <div className="photo-card">
            <div className="pc-main">
              <div className="pc-code">
                <div className="dots"><i /><i /><i /></div>
                <pre>
                  <span className="c2">$</span>{" "}claude{"\n"}
                  <span className="c1">›</span> สร้างเว็บจองคิว + deploy{"\n"}
                  <span className="c3">✓</span> วางโครงโปรเจกต์{"\n"}
                  <span className="c3">✓</span> เขียนโค้ด + ทดสอบ{"\n"}
                  <span className="c3">✓</span> deploy ขึ้น cloud <span className="c1">▍</span>
                </pre>
              </div>
            </div>
            <div className="chip c1">
              <span className="mi">star</span>
              <div><span style={{ color: "var(--amber)" }}>4.9 / 5.0</span><small>จากผู้เรียน 180 คน</small></div>
            </div>
            <div className="chip c2">
              <span className="mi">payments</span>
              <div><span>฿1,000<small>ต่อชั่วโมง · จ่าย Stripe</small></span></div>
            </div>
          </div>
        </div>
      </header>

      {/* ── Credential strip ─────────────────────────────────────── */}
      <div className="creds">
        <div className="wrap creds-in">
          <div className="cred"><span className="mi">code</span> ใช้ Claude Code ทำงานจริง</div>
          <div className="cred"><span className="mi">groups</span> ตัวต่อตัว ปรับตามคุณ</div>
          <div className="cred"><span className="mi">videocam</span> ออนไลน์ (Zoom / Meet)</div>
          <div className="cred"><span className="mi">lock</span> ล็อกอิน Google / LINE</div>
          <div className="cred"><span className="mi">verified_user</span> จ่ายปลอดภัยผ่าน Stripe</div>
        </div>
      </div>

      {/* ── What you'll learn ────────────────────────────────────── */}
      <section className="blk" id="learn">
        <div className="wrap">
          <p className="eyebrow reveal"><span className="mi">school</span> สิ่งที่คุณจะได้เรียน</p>
          <h2 className="sec reveal" style={{ marginTop: "8px" }}>
            ตั้งแต่ prompt แรก จนได้<span className="grad">แอปที่ deploy จริง</span>
          </h2>
          <div className="cards3">
            <div className="feat reveal">
              <div className="ic"><span className="mi">rocket_launch</span></div>
              <h3>เรียนจากการลงมือทำ</h3>
              <p>ไม่ใช่ตัวอย่างเล่นๆ — เราสร้างโปรเจกต์จริงตั้งแต่ต้นจนจบในสแต็กของคุณ เอาไปใช้ทำงานวันจันทร์ได้เลย</p>
            </div>
            <div className="feat reveal">
              <div className="ic"><span className="mi">smart_toy</span></div>
              <h3>พื้นฐาน → agent &amp; MCP</h3>
              <p>เริ่มจากติดตั้ง &amp; prompting แล้วไปลึกถึง subagents, MCP, hooks, skills — ใช้ Claude Code ได้เต็มพลัง</p>
            </div>
            <div className="feat reveal">
              <div className="ic"><span className="mi">bolt</span></div>
              <h3>ได้ workflow ของตัวเอง</h3>
              <p>จบคอร์สได้ชุดตั้งค่า prompt และ automation ที่ปรับมาเพื่อวิธีทำงานของคุณโดยเฉพาะ</p>
            </div>
          </div>
          <div className="topics">
            {[
              ["download", "ติดตั้ง & ตั้งค่า"],
              ["keyboard", "Prompting เขียนโค้ด"],
              ["bug_report", "แก้บั๊ก & รีแฟกเตอร์"],
              ["apps", "สร้างแอปจริง"],
              ["smart_toy", "Agents & Subagents"],
              ["hub", "MCP servers"],
              ["extension", "Hooks & Skills"],
              ["cloud_upload", "Deploy ขึ้น cloud"],
              ["auto_awesome", "ทำงานอัตโนมัติ"],
            ].map(([icon, label]) => (
              <div key={label} className="topic reveal">
                <span className="mi">{icon}</span> <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────── */}
      <section className="blk bg-soft" id="how">
        <div className="wrap">
          <p className="eyebrow reveal"><span className="mi">route</span> ขั้นตอนการเรียน</p>
          <h2 className="sec reveal" style={{ marginTop: "8px" }}>จาก 0 ถึง<span className="grad"> deploy ได้</span> ใน 3 ขั้น</h2>
          <div className="steps">
            <div className="step reveal">
              <div className="num"><span className="mi">login</span></div>
              <h3>เข้าสู่ระบบ &amp; จอง</h3>
              <p>ล็อกอินด้วย Google หรือ LINE เลือกวัน-เวลา เสาร์หรืออาทิตย์ที่สะดวก</p>
            </div>
            <div className="step reveal">
              <div className="num"><span className="mi">payments</span></div>
              <h3>ชำระผ่าน Stripe</h3>
              <p>ชำระ ฿1,000 ต่อชั่วโมงผ่าน Stripe ปลอดภัย รับ confirmation ทันที</p>
            </div>
            <div className="step reveal">
              <div className="num"><span className="mi">videocam</span></div>
              <h3>เรียนสดผ่าน Zoom/Meet</h3>
              <p>เรียน 1:1 ลงมือทำโปรเจกต์จริงร่วมกัน ปรับเนื้อหาตามระดับคุณ</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ────────────────────────────────────────────────── */}
      <section className="blk">
        <div className="wrap">
          <div className="stats">
            <div className="s"><b>350+</b><span>ผู้เรียน</span></div>
            <div className="s"><b>600+</b><span>ชั่วโมงที่สอน</span></div>
            <div className="s"><b>4.9★</b><span>คะแนนเฉลี่ย</span></div>
            <div className="s"><b>฿1,000</b><span>ต่อชั่วโมง</span></div>
          </div>
        </div>
      </section>

      {/* ── Pricing ──────────────────────────────────────────────── */}
      <section className="blk bg-soft" id="pricing">
        <div className="wrap">
          <p className="eyebrow reveal"><span className="mi">payments</span> ราคา</p>
          <h2 className="sec reveal" style={{ marginTop: "8px" }}>โปร่งใส ไม่มีค่าใช้จ่ายซ่อน</h2>
          <div className="price-grid">
            <div className="plan reveal">
              <h3>ทดลองเรียน</h3>
              <div className="who">เริ่มต้นฟรี</div>
              <div className="price"><span className="now">ฟรี</span></div>
              <ul>
                <li><span className="mi">check_circle</span> ปรึกษาฟรี 20 นาที</li>
                <li><span className="mi">check_circle</span> ประเมินระดับและเป้าหมาย</li>
                <li><span className="mi">check_circle</span> แนะนำเนื้อหาที่เหมาะ</li>
              </ul>
              <a className="btn btn-ghost" href="#booking">นัดปรึกษาฟรี</a>
            </div>
            <div className="plan pop reveal">
              <div className="badge">ยอดนิยม</div>
              <h3>1 ชั่วโมง</h3>
              <div className="who">เหมาะสำหรับผู้เรียนทุกระดับ</div>
              <div className="price"><span className="now">฿1,000</span><span className="per">/ชั่วโมง</span></div>
              <ul>
                <li><span className="mi">check_circle</span> เรียน 1:1 สด 60 นาที</li>
                <li><span className="mi">check_circle</span> ปรับเนื้อหาตามคุณ</li>
                <li><span className="mi">check_circle</span> สร้างของจริงระหว่างเรียน</li>
                <li><span className="mi">check_circle</span> ชำระผ่าน Stripe ปลอดภัย</li>
              </ul>
              <a className="btn btn-cta" href="#booking">จองเลย</a>
            </div>
            <div className="plan reveal">
              <h3>แพ็ก 4 ชั่วโมง</h3>
              <div className="who">ประหยัดกว่า สำหรับคนมุ่งมั่น</div>
              <div className="price"><span className="now">฿3,600</span><span className="per">/แพ็ก</span></div>
              <div className="was">ปกติ ฿4,000</div>
              <ul>
                <li><span className="mi">check_circle</span> 4 คาบ 60 นาที</li>
                <li><span className="mi">check_circle</span> ประหยัด 10%</li>
                <li><span className="mi">check_circle</span> ใช้ได้ภายใน 60 วัน</li>
                <li><span className="mi">check_circle</span> ชำระครั้งเดียวสะดวก</li>
              </ul>
              <a className="btn btn-ghost" href="#booking">สั่งจอง</a>
            </div>
          </div>
          <div className="wk-note">
            <span className="mi">weekend</span>
            <span>เปิดสอนเฉพาะ <b>เสาร์-อาทิตย์</b> · จองล่วงหน้าได้สูงสุด 4 สัปดาห์</span>
          </div>
        </div>
      </section>

      {/* ── Reviews ──────────────────────────────────────────────── */}
      <section className="blk" id="reviews">
        <div className="wrap">
          <p className="eyebrow reveal"><span className="mi">reviews</span> รีวิวผู้เรียน</p>
          <h2 className="sec reveal" style={{ marginTop: "8px" }}>สิ่งที่ผู้เรียนบอก</h2>
          <div className="rev-head">
            <div className="rev-score">4.9</div>
            <div>
              <div className="stars">
                {[1,2,3,4,5].map(i => <span key={i} className="mi">star</span>)}
              </div>
              <div style={{ color: "var(--ink2)", fontSize: "14px" }}>จาก 180+ รีวิว</div>
            </div>
          </div>
          <div className="rev-grid">
            {[
              {
                text: "ได้ deploy แอปจริงภายในคาบเดียว โค้ชอธิบายได้ชัดมาก ตามทัน 100% ถึงแม้จะเพิ่งเริ่ม",
                name: "ปิยะ ม.",
                role: "Product Manager",
                color: "#15a34a",
              },
              {
                text: "สอนตามระดับจริงๆ ไม่เร็วไม่ช้า ได้ workflow Claude Code ที่เอาไปใช้ทำงานได้เลย",
                name: "สุภา ก.",
                role: "Frontend Developer",
                color: "#7c3aed",
              },
              {
                text: "จ่ายคุ้มมาก 1,000 บาทแต่ได้ความรู้ที่ไปหาเองอาจใช้เวลาเป็นสัปดาห์",
                name: "วรวุฒิ ต.",
                role: "Startup Founder",
                color: "#0ea5e9",
              },
            ].map((r) => (
              <div key={r.name} className="review reveal">
                <div className="qstars">{[1,2,3,4,5].map(i => <span key={i} className="mi">star</span>)}</div>
                <p>{r.text}</p>
                <div className="who">
                  <div className="av" style={{ background: r.color }}>{r.name[0]}</div>
                  <div><b>{r.name}</b><span>{r.role}</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Booking widget (client component) ────────────────────── */}
      <section className="blk bg-soft" id="booking">
        <div className="wrap">
          <p className="eyebrow reveal"><span className="mi">event_available</span> จองเรียน</p>
          <h2 className="sec reveal" style={{ marginTop: "8px" }}>เลือกวัน-เวลา<span className="grad"> ที่สะดวก</span></h2>
          <Suspense fallback={<div style={{ textAlign: "center", padding: "40px", color: "var(--muted)" }}>กำลังโหลด...</div>}>
            <BookingWidget />
          </Suspense>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────── */}
      <section className="blk" id="faq">
        <div className="wrap">
          <p className="eyebrow reveal"><span className="mi">help</span> คำถามที่พบบ่อย</p>
          <h2 className="sec reveal" style={{ marginTop: "8px" }}>FAQ</h2>
          <div className="faq">
            {[
              ["เรียนได้เลยไหมถ้าไม่มีพื้นฐาน?", "ได้เลยครับ! เราปรับเนื้อหาตามระดับคุณ เริ่มจากติดตั้ง Claude Code และ prompt แรกได้เลย"],
              ["ทำไมเรียนได้แค่เสาร์-อาทิตย์?", "โค้ชทำงาน full-time จันทร์-ศุกร์ วันหยุดจึงเป็นเวลาที่ focus กับการสอนได้เต็มที่ที่สุด"],
              ["ต้องเตรียมอะไรบ้าง?", "คอมพิวเตอร์ที่ติดตั้ง Claude Code + บัญชี Anthropic (Claude Pro หรือ API) และ Internet ที่เสถียร"],
              ["ถ้าติดธุระ cancel ได้ไหม?", "cancel หรือเลื่อนได้ก่อน 24 ชั่วโมง ระบบจะ refund เต็มจำนวน (Phase 2 — กำลังพัฒนา)"],
              ["ใช้ภาษาอะไรในการสอน?", "ภาษาไทยครับ สามารถใช้ภาษาอังกฤษได้ตามต้องการ"],
            ].map(([q, a]) => (
              <details key={q as string} className="qa">
                <summary style={{ cursor: "pointer", padding: "20px 4px", fontWeight: 700, fontSize: "17px", listStyle: "none", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", userSelect: "none" }}>
                  {q}
                  <span className="mi pm">expand_more</span>
                </summary>
                <div className="ans"><p>{a}</p></div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ────────────────────────────────────────────── */}
      <section className="blk">
        <div className="wrap">
          <div className="final">
            <h2>พร้อมเริ่มต้นยัง?<br />จองเลยก่อนเต็ม</h2>
            <p>เปิดเฉพาะเสาร์-อาทิตย์ · slot จำกัด · เริ่มด้วยปรึกษาฟรี 20 นาที</p>
            <div className="row">
              <a className="btn btn-cta" href="#booking">
                <span className="mi">event_available</span> จองเรียนตอนนี้
              </a>
              <a className="btn btn-ghost" href="/signin">
                <span className="mi">login</span> เข้าสู่ระบบ
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────── */}
      <footer>
        <div className="wrap foot">
          <div>
            <strong>Claude Code Weekend</strong>
            <span style={{ display: "block", color: "var(--muted)", fontSize: "13px", marginTop: "4px" }}>
              © {new Date().getFullYear()} · เรียนตัวต่อตัว เสาร์-อาทิตย์
            </span>
          </div>
          <div style={{ display: "flex", gap: "20px" }}>
            <a href="/signin" style={{ color: "var(--ink2)", textDecoration: "none" }}>เข้าสู่ระบบ</a>
            <a href="/account" style={{ color: "var(--ink2)", textDecoration: "none" }}>ประวัติการจอง</a>
          </div>
        </div>
      </footer>

      {/* Scripts for lang toggle + reveal animation */}
      <LangScript />
      <RevealScript />
    </>
  );
}
