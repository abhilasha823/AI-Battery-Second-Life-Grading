import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getPassport } from "../api";
import { QRCodeSVG } from "qrcode.react";

export default function Passport() {
  const { batteryId } = useParams();

  const [passport, setPassport] = useState(null);

  useEffect(() => {
    getPassport(batteryId)
      .then(setPassport)
      .catch(console.error);
  }, [batteryId]);

  if (!passport) {
    return (
      <div className="p-8 text-white">
        Loading passport...
      </div>
    );
  }

  const passportUrl =
    `${window.location.origin}/passport/${batteryId}`;

  return (
  <div className="max-w-7xl mx-auto px-6 py-8 text-white">

    {/* HEADER */}
    <div className="passport-hero">

      <div>
        <p className="passport-label">
          DIGITAL BATTERY PASSPORT
        </p>

        <h1 className="passport-title">
          {passport.passport_id}
        </h1>

        <p className="passport-subtitle">
          Battery ID: {passport.battery_id}
        </p>
      </div>

      <div className="passport-badges">
        <span className="grade-badge">
          Grade {passport.grade}
        </span>

        <span
          className={`risk-badge ${
            passport.risk_level === "HIGH"
              ? "risk-high"
              : passport.risk_level === "MEDIUM"
              ? "risk-medium"
              : "risk-low"
          }`}
        >
          {passport.risk_level} Risk
        </span>
      </div>

    </div>

    {/* MAIN GRID */}
    <div className="passport-grid">

      {/* Battery Health */}
      <div className="passport-card">

        <h2>🔋 Battery Health</h2>

        <div className="metric-row">
          <span>SOH</span>
          <strong>{passport.soh}%</strong>
        </div>

        <div className="metric-row">
          <span>Grade</span>
          <strong>{passport.grade}</strong>
        </div>

        <div className="metric-row">
          <span>Recommendation</span>
          <strong>{passport.recommendation}</strong>
        </div>

      </div>

      {/* AI Confidence */}
      <div className="passport-card">

        <h2>🎯 Model Confidence</h2>

        <h3 className="confidence-value">
          {passport.confidence}%
        </h3>

        <div className="confidence-track">
          <div
            className="confidence-fill"
            style={{
              width: `${passport.confidence}%`,
            }}
          />
        </div>

        <p className="confidence-caption">
          Confidence derived from agreement across Random Forest trees.
        </p>

      </div>

      {/* AI Explanation */}
      <div className="passport-card">

        <h2>🤖 AI Explanation</h2>

        <ul className="insight-list">
          {passport.ai_explanation?.map((reason, index) => (
            <li key={index}>
              {reason}
            </li>
          ))}
        </ul>

      </div>

      {/* Sustainability */}
      <div className="passport-card">

        <h2>♻ Sustainability Impact</h2>

        <div className="metric-row">
          <span>Remaining Useful Life</span>
          <strong>{passport.rul_years} years</strong>
        </div>

        <div className="metric-row">
          <span>Residual Value</span>
          <strong>₹{passport.residual_value}</strong>
        </div>

        <div className="metric-row">
          <span>CO₂ Saved</span>
          <strong>{passport.co2_saved} kg</strong>
        </div>

      </div>

      {/* QR Card */}
      <div className="passport-card qr-card">

        <h2>📱 Digital Passport QR</h2>

        <QRCodeSVG
          value={passportUrl}
          size={200}
          includeMargin
        />

        <p className="qr-caption">
          Scan to access this Battery Passport
        </p>

        <div className="eu-badge">
          EU Battery Regulation 2027 Compatible
        </div>

      </div>

    </div>

   </div>
  );
}