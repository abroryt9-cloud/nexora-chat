import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';

interface PollCreatorProps {
  onCreate: (question: string, options: string[]) => void;
  onClose: () => void;
}

const PollCreator: React.FC<PollCreatorProps> = ({ onCreate, onClose }) => {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);

  const addOption = () => setOptions([...options, '']);
  const removeOption = (index: number) => setOptions(options.filter((_, i) => i !== index));
  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleCreate = () => {
    if (question.trim() && options.every(opt => opt.trim())) {
      onCreate(question, options);
      onClose();
    }
  };

  return (
    <div className="absolute bottom-20 left-4 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4 w-96 z-50">
      <h3 className="font-semibold mb-2">Create Poll</h3>
      <input
        type="text"
        placeholder="Question"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        className="w-full border rounded px-3 py-2 mb-3 dark:bg-gray-700 dark:border-gray-600"
      />
      {options.map((opt, idx) => (
        <div key={idx} className="flex gap-2 mb-2">
          <input
            type="text"
            placeholder={`Option ${idx + 1}`}
            value={opt}
            onChange={(e) => updateOption(idx, e.target.value)}
            className="flex-1 border rounded px-3 py-2 dark:bg-gray-700 dark:border-gray-600"
          />
          {options.length > 2 && (
            <button onClick={() => removeOption(idx)} className="text-red-500">
              <Trash2 size={20} />
            </button>
          )}
        </div>
      ))}
      <button onClick={addOption} className="flex items-center gap-1 text-blue-500 mb-3">
        <Plus size={16} /> Add option
      </button>
      <div className="flex justify-end gap-2">
        <button onClick={onClose} className="px-4 py-2 border rounded">Cancel</button>
        <button onClick={handleCreate} className="px-4 py-2 bg-blue-500 text-white rounded">Create</button>
      </div>
    </div>
  );
};

export default PollCreator;
