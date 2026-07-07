'use client'

import { useState, useEffect } from 'react';

export const metadata = {
  title: 'Finance | Royal Enfield',
  description: 'Explore premium finance options for owning your Royal Enfield comfortably.',
};

export default function FinancePage() {
    const [loanAmount, setLoanAmount] = useState(150000);
    const [loanTenure, setLoanTenure] = useState(36);
    const [interestRate, setInterestRate] = useState(9.0);
    const [emi, setEmi] = useState(0);
    const [totalAmount, setTotalAmount] = useState(0);
    const [totalInterest, setTotalInterest] = useState(0);

    useEffect(() => {
        const calculateEmi = () => {
        const p = loanAmount;
        const r = interestRate / 12 / 100;
        const n = loanTenure;
        if (p > 0 && r > 0 && n > 0) {
            const emiValue = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
            const totalAmountValue = emiValue * n;
            const totalInterestValue = totalAmountValue - p;
            setEmi(Math.round(emiValue));
            setTotalAmount(Math.round(totalAmountValue));
            setTotalInterest(Math.round(totalInterestValue));
        }
        };
        calculateEmi();
    }, [loanAmount, loanTenure, interestRate]);

  return (
     <section id="emi" aria-labelledby="emi-title" style={{paddingTop: '120px', paddingBottom: '120px'}}>
        <div className="emi-layout">
          <div className="section-header">
            <span className="section-tag">Easy Finance</span>
            <h2 className="section-title" id="emi-title">Calculate Your EMI</h2>
            <p className="section-subtitle">Custom financing options starting at 8.5% p.a. with flexible tenure up to 60
              months. Low down payment, fast approval.</p>
          </div>
          <div className="emi-calculator glass-card">
            <div className="emi-sliders">
              <div className="emi-slider-group">
                <div className="emi-slider-header">
                  <span className="emi-slider-label">Loan Amount</span>
                  <span className="emi-slider-value" id="loan-display">₹{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(loanAmount)}</span>
                </div>
                <input type="range" id="loan-amount" min="50000" max="700000" step="5000" value={loanAmount} onChange={e => setLoanAmount(Number(e.target.value))} aria-label="Loan Amount" />
              </div>
              <div className="emi-slider-group">
                <div className="emi-slider-header">
                  <span className="emi-slider-label">Loan Tenure</span>
                  <span className="emi-slider-value" id="tenure-display">{loanTenure} mo</span>
                </div>
                <input type="range" id="loan-tenure" min="12" max="60" step="6" value={loanTenure} onChange={e => setLoanTenure(Number(e.target.value))} aria-label="Loan Tenure" />
              </div>
              <div className="emi-slider-group">
                <div className="emi-slider-header">
                  <span className="emi-slider-label">Interest Rate (p.a.)</span>
                  <span className="emi-slider-value" id="rate-display">{interestRate.toFixed(1)}%</span>
                </div>
                <input type="range" id="loan-rate" min="8.5" max="16" step="0.1" value={interestRate} onChange={e => setInterestRate(Number(e.target.value))} aria-label="Interest Rate" />
              </div>
            </div>
            <div className="emi-result">
              <div className="emi-result-label">Monthly EMI</div>
              <div className="emi-result-amount" id="emi-display">₹{new Intl.NumberFormat('en-IN').format(emi)}</div>
              <div className="emi-result-sub">Estimated — subject to credit approval</div>
              <div className="emi-breakdown">
                <div className="emi-break-item">
                  <div className="emi-break-val" id="total-display">₹{new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(totalAmount / 1000)}K</div>
                  <div className="emi-break-label">Total Amount</div>
                </div>
                <div className="emi-break-item">
                  <div className="emi-break-val" id="interest-display">₹{new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(totalInterest / 1000)}K</div>
                  <div className="emi-break-label">Interest Payable</div>
                </div>
                <div className="emi-break-item">
                  <div className="emi-break-val">Instant</div>
                  <div className="emi-break-label">Approval</div>
                </div>
              </div>
            </div>
            <div style={{textAlign: 'center',marginTop:'36px'}}>
              <a href="#test-ride" className="btn-primary">
                <i className="fa-solid fa-indian-rupee-sign"></i> Apply for Finance
              </a>
            </div>
          </div>
        </div>
      </section>
  );
}
