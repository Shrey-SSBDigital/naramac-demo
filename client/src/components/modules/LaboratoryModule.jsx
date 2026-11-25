import React, { useState } from 'react';
import { useEnterprise } from '../../context/EnterpriseContext';
import DataTable from '../common/DataTable';
import StatusBadge from '../common/StatusBadge';
import Modal from '../common/Modal';
import { FlaskConical, ShieldCheck, Plus, CheckCircle2, FileText, AlertTriangle, Upload, FileCheck2, XCircle } from 'lucide-react';

export default function LaboratoryModule() {
  const { labTests, submitLabSampleAndTest, distillations } = useEnterprise();
  const [selectedTest, setSelectedTest] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [remarksError, setRemarksError] = useState('');

  const [form, setForm] = useState({
    distillationRunId: distillations[0]?.id || 'DST-AS-2026-01',
    sourceBatchId: distillations[0]?.sourceBatchId || 'AGG-AS-2026-01',
    laboratoryName: 'NERAMAC Central Quality Assurance & NABL Analytical Facility, Jorhat',
    testingOfficer: 'Dr. Ananya Sarmah, Chief Analytical Chemist',
    agarospirolPercent: 14.82,
    jinkohEremolPercent: 6.24,
    specificGravity25C: 0.961,
    refractiveIndex20C: 1.507,
    opticalRotation: '+15.2°',
    qualityDecision: 'RELEASED_FOR_COMMERCIAL_USE',
    coaDocumentNumber: `COA/NER/2026/${Math.floor(1000 + Math.random() * 9000)}`,
    uploadedReportName: '',
    uploadedReportSize: '',
    uploadedReportUrl: '',
    remarks: ''
  });

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const sizeKb = (file.size / 1024).toFixed(1);
    setForm(prev => ({
      ...prev,
      uploadedReportName: file.name,
      uploadedReportSize: `${sizeKb} KB`,
      uploadedReportUrl: URL.createObjectURL(file)
    }));
  };

  const handleDecisionSubmit = (decision) => {
    if (!form.uploadedReportName) {
      setRemarksError('Please upload a lab test report file first.');
      return;
    }
    if (decision === 'REJECTED' && !form.remarks.trim()) {
      setRemarksError('Please enter remarks explaining why the report is rejected.');
      return;
    }
    setRemarksError('');
    submitLabSampleAndTest({
      ...form,
      qualityDecision: decision,
      approvalRemarks: decision === 'RELEASED_FOR_COMMERCIAL_USE' ? form.remarks.trim() : '',
      rejectionRemarks: decision === 'REJECTED' ? form.remarks.trim() : '',
      coaDocumentUrl: form.uploadedReportUrl || `/coa/${form.uploadedReportName}`
    });
    setForm(prev => ({ ...prev, uploadedReportName: '', uploadedReportSize: '', uploadedReportUrl: '', remarks: '' }));
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
      render: (t) => (
        <div className="space-y-0.5">
          <StatusBadge status={t.qualityDecision} />
          {(t.rejectionRemarks || t.approvalRemarks || t.remarks) && (
            <div className={`text-[10px] max-w-[180px] truncate ${t.qualityDecision === 'REJECTED' ? 'text-rose-700 font-semibold' : 'text-emerald-700'}`}>
              {t.rejectionRemarks || t.approvalRemarks || t.remarks}
            </div>
          )}
        </div>
      )
    },
    {
      header: 'Action',
      accessor: 'id',
      render: (t) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedTest(t);
            }}
            className="px-2.5 py-1 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition"
          >
            View COA
          </button>
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
            {/* Uploaded CoA File & Decision Summary */}
            {(selectedTest.uploadedReportName || selectedTest.rejectionRemarks || selectedTest.approvalRemarks || selectedTest.remarks) && (
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                {selectedTest.uploadedReportName && (
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-700 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-emerald-600" />
                      {selectedTest.uploadedReportName}
                    </span>
                    <span className="font-mono text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                      {selectedTest.nablAccreditationNo}
                    </span>
                  </div>
                )}
                {(selectedTest.rejectionRemarks || selectedTest.approvalRemarks || selectedTest.remarks) && (
                  <div className={`text-[11px] font-medium ${selectedTest.qualityDecision === 'REJECTED' ? 'text-rose-700' : 'text-emerald-800'}`}>
                    <strong>Remarks:</strong> {selectedTest.rejectionRemarks || selectedTest.approvalRemarks || selectedTest.remarks}
                  </div>
                )}
              </div>
            )}

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

            {/* Geo-Spatial Sample Draw Event Stamp */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 font-mono text-[11px]">
              <div className="flex items-center justify-between text-slate-500 font-bold uppercase text-[10px]">
                <span>Sample Draw Event &amp; Timestamp</span>
                <span className="text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">Geo-Referenced Sample</span>
              </div>
              <div className="text-slate-800 font-semibold">
                Location: {selectedTest.samplingLocation || 'NERAMAC Central QA Facility Receiver Vessel'}
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>
                  Coordinates: {selectedTest.sampleCoordinates ? `${selectedTest.sampleCoordinates[0]}°N, ${selectedTest.sampleCoordinates[1]}°E` : '26.5890°N, 93.5980°E'} (±{selectedTest.sampleAccuracyM || 1.2}m)
                </span>
                <span>Sampled: {selectedTest.sampledAt ? new Date(selectedTest.sampledAt).toLocaleString() : '2026-02-04 10:15 AM'}</span>
              </div>
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

      {/* Upload Lab Report Modal (File Upload + Remarks + Approve/Reject) */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Upload Lab Test Report (CoA)"
        subtitle="Upload signed laboratory test report, add remarks, and Approve or Reject"
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Select Processing Run *</label>
            <select
              value={form.distillationRunId}
              onChange={(e) => {
                const selectedRun = distillations.find(d => d.id === e.target.value);
                setForm({
                  ...form,
                  distillationRunId: e.target.value,
                  sourceBatchId: selectedRun?.sourceBatchId || form.sourceBatchId
                });
              }}
              className="w-full px-3 py-2 border rounded-lg font-mono font-bold bg-white"
            >
              {distillations.map(d => (
                <option key={d.id} value={d.id}>
                  {d.id} ({d.processingType ? d.processingType.replace(/_/g, ' ') : `${d.outputPureOudOilMl}ml`}, {d.cpcName})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
              Upload Lab Report / Certificate of Analysis (PDF, Image) *
            </label>
            <label className="flex flex-col items-center justify-center w-full p-6 border-2 border-dashed border-emerald-400 rounded-2xl bg-emerald-50/40 hover:bg-emerald-50 cursor-pointer transition text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                {form.uploadedReportName ? <FileCheck2 className="w-5 h-5" /> : <Upload className="w-5 h-5" />}
              </div>
              {form.uploadedReportName ? (
                <div className="space-y-0.5">
                  <div className="font-extrabold text-emerald-900 text-xs">{form.uploadedReportName}</div>
                  <div className="text-[10px] font-mono text-emerald-700">{form.uploadedReportSize} • Ready</div>
                </div>
              ) : (
                <div className="space-y-0.5">
                  <div className="font-bold text-slate-800">Click to select Lab Test Report file</div>
                  <div className="text-[10px] text-slate-500">Supports PDF, PNG, JPG, DOC/DOCX</div>
                </div>
              )}
              <input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Remarks (Required for Reject, Optional for Approve)
            </label>
            <textarea
              rows={3}
              value={form.remarks}
              onChange={(e) => {
                setForm({ ...form, remarks: e.target.value });
                if (remarksError) setRemarksError('');
              }}
              placeholder="Enter lab verification remarks or rejection reason..."
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
            {remarksError && (
              <p className="text-[11px] text-rose-600 font-bold mt-1">{remarksError}</p>
            )}
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
              type="button"
              disabled={!form.uploadedReportName}
              onClick={() => handleDecisionSubmit('REJECTED')}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold shadow-xs flex items-center gap-1.5 disabled:opacity-50"
            >
              <XCircle className="w-4 h-4" />
              <span>Reject</span>
            </button>
            <button
              type="button"
              disabled={!form.uploadedReportName}
              onClick={() => handleDecisionSubmit('RELEASED_FOR_COMMERCIAL_USE')}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-xs flex items-center gap-1.5 disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Approve &amp; Release</span>
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
