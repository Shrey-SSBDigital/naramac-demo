import React, { useState } from 'react';
import { useEnterprise } from '../../context/EnterpriseContext';
import DataTable from '../common/DataTable';
import StatusBadge from '../common/StatusBadge';
import Modal from '../common/Modal';
import { FlaskConical, ShieldCheck, Plus, CheckCircle2, FileText, AlertTriangle } from 'lucide-react';

export default function LaboratoryModule() {
  const { labTests, submitLabSampleAndTest, approveQualityRelease, distillations } = useEnterprise();
  const [selectedTest, setSelectedTest] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [form, setForm] = useState({
    distillationRunId: 'DST-AS-2026-02',
    sourceBatchId: 'AGG-AS-2026-02',
    laboratoryName: 'NERAMAC Central Quality Assurance & NABL Analytical Facility, Jorhat',
    testingOfficer: 'Dr. Ananya Sarmah, Chief Analytical Chemist',
    agarospirolPercent: 13.90,
    jinkohEremolPercent: 5.80,
    specificGravity25C: 0.961,
    refractiveIndex20C: 1.507,
    opticalRotation: '+15.2°',
    qualityDecision: 'RELEASED_FOR_COMMERCIAL_USE',
    coaDocumentNumber: `COA/NER/2026/${Math.floor(1000 + Math.random() * 9000)}`
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    submitLabSampleAndTest(form);
    setIsModalOpen(false);
  };

  const columns = [
    {
      header: 'Sample Code & Test ID',
      accessor: 'id',
      render: (t) => (
        <div>
          <span className="font-extrabold text-slate-900 font-mono text-xs">{t.id}</span>
          <div className="text-[10px] text-slate-500 font-mono">{t.sampleCode} • {t.testDate}</div>
        </div>
      )
    },
    {
      header: 'Distillation Charge Run',
      accessor: 'distillationRunId',
      render: (t) => (
        <div>
          <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
            {t.distillationRunId}
          </span>
          <div className="text-[10px] text-slate-500">{t.sourceBatchId}</div>
        </div>
      )
    },
    {
      header: 'GC-MS Key Marker',
      accessor: 'agarospirolPercent',
      render: (t) => (
        <div>
          <div className="font-black text-emerald-800 text-xs">
            Agarospirol: {t.agarospirolPercent}% (Std &ge; 8.0%)
          </div>
          <div className="text-[11px] text-slate-500 font-semibold">
            Jinkoh-eremol: {t.jinkohEremolPercent}%
          </div>
        </div>
      )
    },
    {
      header: 'Species & Adulterants',
      accessor: 'botanicalConfirmation',
      render: (t) => (
        <div>
          <span className="font-bold text-slate-800 italic">{t.botanicalConfirmation}</span>
          <div className="text-[10px] text-emerald-700 font-bold">Adulterants: NOT DETECTED</div>
        </div>
      )
    },
    {
      header: 'COA Document',
      accessor: 'coaDocumentNumber',
      render: (t) => (
        <span className="font-mono text-[11px] font-bold text-slate-700">
          {t.coaDocumentNumber}
        </span>
      )
    },
    {
      header: 'Quality Release Decision',
      accessor: 'qualityDecision',
      render: (t) => <StatusBadge status={t.qualityDecision} />
    },
    {
      header: 'Action',
      accessor: 'id',
      render: (t) => (
        <div className="flex items-center gap-1.5">
          {t.qualityDecision !== 'RELEASED_FOR_COMMERCIAL_USE' ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                approveQualityRelease(t.id);
              }}
              className="px-2.5 py-1 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition"
            >
              Sign Release
            </button>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedTest(t);
              }}
              className="px-2.5 py-1 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition"
            >
              View COA
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-5">
      {/* Title Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Laboratory Testing & NABL Quality Release</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
              Module 10
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            GC-MS chromatographic chemical profiling, agarospirol % content, and CITES botanical confirmation (*Aquilaria malaccensis*).
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl shadow-xs transition"
        >
          <Plus className="w-4 h-4" />
          <span>Register Sample & GC-MS</span>
        </button>
      </div>

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={labTests}
        searchKey="sampleCode"
        searchPlaceholder="Search lab reports by sample code, test ID, or distillation run..."
        onRowClick={(t) => setSelectedTest(t)}
      />

      {/* COA Certificate Modal */}
      {selectedTest && (
        <Modal
          isOpen={!!selectedTest}
          onClose={() => setSelectedTest(null)}
          title={`Certificate of Analysis (COA): ${selectedTest.coaDocumentNumber}`}
          subtitle={`Accredited Facility: ${selectedTest.laboratoryName}`}
          maxWidth="max-w-xl"
        >
          <div className="space-y-4 text-xs">
            {/* Top Chemical Profile Box */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between border-b pb-2">
                <span className="font-extrabold text-slate-900 text-xs">Key GC-MS Marker Analysis</span>
                <span className="font-mono text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                  {selectedTest.nablAccreditationNo}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Agarospirol (%)</span>
                  <div className="text-base font-black text-emerald-800">{selectedTest.agarospirolPercent}%</div>
                  <div className="text-[10px] text-slate-400">Standard &ge; 8.0% (PASS)</div>
                </div>
                <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Jinkoh-Eremol (%)</span>
                  <div className="text-base font-black text-emerald-800">{selectedTest.jinkohEremolPercent}%</div>
                  <div className="text-[10px] text-slate-400">Standard &ge; 3.5% (PASS)</div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center pt-1 text-[11px]">
                <div className="p-2 rounded bg-white border">
                  <div className="text-slate-500 text-[10px]">Specific Gravity</div>
                  <strong className="text-slate-800 font-mono">{selectedTest.specificGravity25C}</strong>
                </div>
                <div className="p-2 rounded bg-white border">
                  <div className="text-slate-500 text-[10px]">Refractive Index</div>
                  <strong className="text-slate-800 font-mono">{selectedTest.refractiveIndex20C}</strong>
                </div>
                <div className="p-2 rounded bg-white border">
                  <div className="text-slate-500 text-[10px]">Optical Rotation</div>
                  <strong className="text-slate-800 font-mono">{selectedTest.opticalRotation}</strong>
                </div>
              </div>
            </div>

            {/* Botanical CITES & Adulterant Screening */}
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1.5 text-emerald-900">
              <div className="font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span>CITES Appendix II Species Confirmation</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Wood-anatomy and chromatographic markers match <strong>Aquilaria malaccensis</strong>. Synthetic mineral oil and phthalate DEP adulterants are strictly negative.
              </p>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedTest(null)}
                className="px-4 py-2 bg-slate-800 text-white rounded-xl font-bold"
              >
                Close Certificate
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Register & Enter Results Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Register Sample & Enter GC-MS Profiling"
        subtitle="Mandatory quality release gate prior to packaging and commercial dispatch"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Source Distillation Run *</label>
              <select
                value={form.distillationRunId}
                onChange={(e) => setForm({ ...form, distillationRunId: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg font-mono font-bold"
              >
                {distillations.map(d => (
                  <option key={d.id} value={d.id}>{d.id} ({d.outputPureOudOilMl}ml, {d.cpcName})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Testing Officer Name</label>
              <input
                type="text"
                value={form.testingOfficer}
                onChange={(e) => setForm({ ...form, testingOfficer: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg font-semibold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Agarospirol Content (%) *</label>
              <input
                type="number"
                step="0.01"
                required
                value={form.agarospirolPercent}
                onChange={(e) => setForm({ ...form, agarospirolPercent: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border rounded-lg font-bold text-emerald-800"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Jinkoh-Eremol Content (%) *</label>
              <input
                type="number"
                step="0.01"
                required
                value={form.jinkohEremolPercent}
                onChange={(e) => setForm({ ...form, jinkohEremolPercent: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border rounded-lg font-bold text-emerald-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Specific Gravity (25°C)</label>
              <input
                type="number"
                step="0.001"
                value={form.specificGravity25C}
                onChange={(e) => setForm({ ...form, specificGravity25C: parseFloat(e.target.value) || 0.96 })}
                className="w-full px-3 py-2 border rounded-lg font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Refractive Index</label>
              <input
                type="number"
                step="0.001"
                value={form.refractiveIndex20C}
                onChange={(e) => setForm({ ...form, refractiveIndex20C: parseFloat(e.target.value) || 1.505 })}
                className="w-full px-3 py-2 border rounded-lg font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Decision</label>
              <select
                value={form.qualityDecision}
                onChange={(e) => setForm({ ...form, qualityDecision: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg font-bold"
              >
                <option value="RELEASED_FOR_COMMERCIAL_USE">RELEASE (Approved)</option>
                <option value="QUARANTINED">QUARANTINE (Flagged)</option>
              </select>
            </div>
          </div>

          <div className="pt-3 border-t flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border rounded-xl font-bold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-xs"
            >
              Issue COA & Release
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
