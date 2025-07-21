import Image from 'next/image';

export default function Home() {
  return (
    <div>
      <section className="content_box" id="best_sellers_section">
        <div className="box">
          <div className="index">베스트셀러</div>
          <div id="best-result" className="box-section"></div>
        </div>
      </section>
    </div>
  );
}
