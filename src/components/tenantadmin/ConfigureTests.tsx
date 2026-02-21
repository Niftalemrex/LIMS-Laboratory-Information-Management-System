import React, { useState, type ChangeEvent, type FormEvent } from 'react';
import { useAppSettings } from '../contexts/AppSettingsContext';
import './ConfigureTests.css';

interface TestType {
  id: number;
  name: string;
  price: number;
  instructions: string;
}

const ConfigureTests: React.FC = () => {
  const { t } = useAppSettings();
  const [tests, setTests] = useState<TestType[]>([]);
  const [newTest, setNewTest] = useState<{ name: string; price: string; instructions: string }>({
    name: '',
    price: '',
    instructions: '',
  });

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewTest((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddTest = (e: FormEvent) => {
    e.preventDefault();

    if (!newTest.name.trim() || !newTest.price.trim()) {
      alert(t('enter_test_name_price'));
      return;
    }

    const priceNumber = Number(newTest.price);
    if (isNaN(priceNumber) || priceNumber < 0) {
      alert(t('valid_positive_price'));
      return;
    }

    const newEntry: TestType = {
      id: tests.length + 1,
      name: newTest.name.trim(),
      price: priceNumber,
      instructions: newTest.instructions.trim(),
    };

    setTests((prev) => [...prev, newEntry]);
    setNewTest({ name: '', price: '', instructions: '' });
  };

  return (
    <section className="card configure-tests">
      <h2>{t('configure_test_panels')}</h2>
      <p className="subtitle">{t('manage_diagnostic_offerings')}</p>

      <form onSubmit={handleAddTest} className="add-test-form" noValidate>
        <input
          type="text"
          name="name"
          placeholder={t('test_name')}
          value={newTest.name}
          onChange={handleInputChange}
          aria-label={t('test_name')}
          required
        />
        <input
          type="number"
          name="price"
          placeholder={t('price_dollar')}
          value={newTest.price}
          onChange={handleInputChange}
          min="0"
          step="0.01"
          aria-label={t('test_price')}
          required
        />
        <textarea
          name="instructions"
          placeholder={t('instructions_optional')}
          value={newTest.instructions}
          onChange={handleInputChange}
          rows={3}
          aria-label={t('instructions')}
        />
        <button type="submit" className="btn btn-primary">
          {t('add_test')}
        </button>
      </form>

      {tests.length > 0 && (
        <div className="tests-table-container">
          <table className="tests-table" aria-label={t('configured_test_types')}>
            <thead>
              <tr>
                <th>{t('id')}</th>
                <th>{t('name')}</th>
                <th>{t('price_dollar')}</th>
                <th>{t('instructions')}</th>
              </tr>
            </thead>
            <tbody>
              {tests.map((test) => (
                <tr key={test.id}>
                  <td>{test.id}</td>
                  <td>{test.name}</td>
                  <td>{test.price.toFixed(2)}</td>
                  <td>{test.instructions || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

export default ConfigureTests;