import React, { useState, type ChangeEvent, type FormEvent, useEffect } from 'react';
import './NewTestRequest.css';
import { useAppSettings } from '../contexts/AppSettingsContext';

type TestPriority = 'Normal' | 'Urgent' | 'Critical';

interface TestRequest {
  id: number;
  patient_name: string;
  test_type: string;
  priority: TestPriority;
  notes: string;
  date_requested: string;
}

interface TestOption {
  value: string;
  label: string;
  category: string;
  labelAm: string;
  categoryAm: string;
}

interface PatientOption {
  id: string;
  name: string;
  nameAm: string;
  age: number;
  gender: string;
  genderAm: string;
}

const API_BASE = "http://127.0.0.1:8000/api";

const NewTestRequest: React.FC = () => {
  const { t, language } = useAppSettings();

  const testCategories: TestOption[] = [
    { value: 'blood-test', label: 'Blood Test', labelAm: 'የደም ፈተና', category: 'Laboratory', categoryAm: 'ላብ' },
    { value: 'x-ray', label: 'X-Ray', labelAm: 'ኤክስ-ሬይ', category: 'Imaging', categoryAm: 'ምስል' },
    { value: 'mri', label: 'MRI', labelAm: 'ኤምአርአይ', category: 'Imaging', categoryAm: 'ምስል' },
    { value: 'ct-scan', label: 'CT Scan', labelAm: 'ሲቲ ስካን', category: 'Imaging', categoryAm: 'ምስል' },
    { value: 'urinalysis', label: 'Urine Analysis', labelAm: 'የሽንት ትንታኔ', category: 'Laboratory', categoryAm: 'ላብ' },
    { value: 'ecg', label: 'ECG', labelAm: 'ኢሲጂ', category: 'Cardiology', categoryAm: 'ልብ' },
    { value: 'ultrasound', label: 'Ultrasound', labelAm: 'አልትራሳውንድ', category: 'Imaging', categoryAm: 'ምስል' },
  ];

  const patientOptions: PatientOption[] = [
    { id: 'pat-001', name: 'Jane Doe', nameAm: 'ጄን ዶ', age: 34, gender: 'Female', genderAm: 'ሴት' },
    { id: 'pat-002', name: 'John Smith', nameAm: 'ጆን ስሚዝ', age: 45, gender: 'Male', genderAm: 'ወንድ' },
    { id: 'pat-003', name: 'Alice Johnson', nameAm: 'አሊስ ጆንሰን', age: 28, gender: 'Female', genderAm: 'ሴት' },
    { id: 'pat-004', name: 'Bob Williams', nameAm: 'ቦብ ዊልያምስ', age: 52, gender: 'Male', genderAm: 'ወንድ' },
  ];

  const initialFormData = {
    patientIdInput: '',
    test_type: '',
    priority: 'Normal' as TestPriority,
    notes: '',
    date_requested: new Date().toISOString().split('T')[0] || '',
  };

  const [formData, setFormData] = useState(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [savedRequests, setSavedRequests] = useState<TestRequest[]>([]);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await fetch(`${API_BASE}/test-requests/`);
        if (!res.ok) throw new Error("Failed to fetch test requests");
        const data = await res.json();
        setSavedRequests(data);
      } catch (err) {
        console.error("Error loading requests:", err);
      }
    };
    fetchRequests();
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const selectedPatient = patientOptions.find(p => p.id === formData.patientIdInput);

      if (!selectedPatient) {
        alert(t('select_valid_patient') || "Please select a valid patient");
        setIsSubmitting(false);
        return;
      }

      const payload = {
        patient_name: selectedPatient.name, // always save English name
        test_type: formData.test_type,
        priority: formData.priority,
        notes: formData.notes,
        date_requested: formData.date_requested,
      };

      const response = await fetch(`${API_BASE}/test-requests/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Failed to save request");

      const newRequest = await response.json();
      setSavedRequests(prev => [...prev, newRequest]);
      setSubmitSuccess(true);

      // Reset form
      setFormData(initialFormData);
      setTimeout(() => setSubmitSuccess(false), 3000);

    } catch (err) {
      console.error(err);
      alert(t('submit_failed') || "Failed to submit request");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredPatients = patientOptions.filter(p =>
    p.name.toLowerCase().includes(formData.patientIdInput.toLowerCase()) ||
    p.nameAm.includes(formData.patientIdInput)
  );

  const getPriorityColor = (priority: TestPriority) => {
    switch (priority) {
      case 'Normal': return '#38a169';
      case 'Urgent': return '#dd6b20';
      case 'Critical': return '#e53e3e';
      default: return '#38a169';
    }
  };

  const groupedTestOptions = testCategories.reduce<Record<string, TestOption[]>>((acc, test) => {
    const category = language === 'am' ? test.categoryAm : test.category;
    acc[category] = acc[category] || [];
    acc[category].push(test);
    return acc;
  }, {} as Record<string, TestOption[]>);

  const getTranslatedLabel = (test: TestOption) => language === 'am' ? test.labelAm : test.label;

  return (
    <section className="new-test-request">
      <div className="form-container">
        <div className="form-header-container">
          <h2 className="form-header">{t('new_test_request')}</h2>
          <p className="form-subheader">{t('order_diagnostic_tests')}</p>
        </div>

        {submitSuccess && <div className="success-message">{t('test_request_submitted')}</div>}

        <form className="test-form" onSubmit={handleSubmit}>
          {/* Patient Selector */}
          <div className="form-group">
            <label htmlFor="patientIdInput">{t('select_patient')}</label>
            <input
              id="patientIdInput"
              name="patientIdInput"
              value={formData.patientIdInput}
              onChange={handleChange}
              placeholder={t('type_or_select_patient')}
              list="patientsList"
              required
              disabled={isSubmitting}
            />
            <datalist id="patientsList">
              {filteredPatients.map(p => (
                <option
                  key={p.id}
                  value={p.id} // 👈 store patient ID here
                  label={
                    language === 'am'
                      ? `${p.nameAm} (${p.age}${t('years_short')}, ${p.genderAm})`
                      : `${p.name} (${p.age}${t('years_short')}, ${p.gender})`
                  }
                />
              ))}
            </datalist>
          </div>

          {/* Test Type */}
          <div className="form-group">
            <label htmlFor="test_type">{t('test_type')}</label>
            <select
              id="test_type"
              name="test_type"
              value={formData.test_type}
              onChange={handleChange}
              required
              disabled={isSubmitting}
            >
              <option value="">-- {t('choose_test')} --</option>
              {Object.entries(groupedTestOptions).map(([cat, tests]) => (
                <optgroup key={cat} label={cat}>
                  {tests.map(test => (
                    <option key={test.value} value={getTranslatedLabel(test)}>
                      {getTranslatedLabel(test)}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          {/* Priority + Date */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="priority">{t('priority')}</label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                disabled={isSubmitting}
                style={{ borderLeft: `4px solid ${getPriorityColor(formData.priority)}` }}
              >
                <option value="Normal">{t('normal')}</option>
                <option value="Urgent">{t('urgent')}</option>
                <option value="Critical">{t('critical')}</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="date_requested">{t('request_date')}</label>
              <input
                type="date"
                id="date_requested"
                name="date_requested"
                value={formData.date_requested}
                onChange={handleChange}
                disabled={isSubmitting}
                required
              />
            </div>
          </div>

          {/* Notes */}
          <div className="form-group">
            <label htmlFor="notes">{t('clinical_notes')}</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder={t('enter_notes')}
              rows={4}
              disabled={isSubmitting}
              maxLength={500}
            />
            <div className="character-count">
              {formData.notes.length}/500 {t('characters')}
            </div>
          </div>

          <button type="submit" className="submit-button" disabled={isSubmitting}>
            {isSubmitting ? t('submitting') : t('submit_request')}
          </button>
        </form>

        {/* Previous Requests */}
        {savedRequests.length > 0 && (
          <div className="saved-requests">
            <h3>{t('previous_test_requests')}</h3>
            <ul>
              {savedRequests.map(r => (
                <li key={r.id}>
                  {r.patient_name} - {r.test_type} - {r.priority} - {r.date_requested}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
};

export default NewTestRequest;
