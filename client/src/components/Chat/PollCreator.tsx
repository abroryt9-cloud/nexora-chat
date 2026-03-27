import React, { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import GlassCard from '../Common/GlassCard';

interface PollCreatorProps {
  chatId: string;
  onCreate: () => void;
  onClose: () => void;
}

const PollCreator: React.FC<PollCreatorProps> = ({ chatId, onCreate, onClose }) => {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [multiple, setMultiple] = useState(false);

  const addOption = () => {
    if (options.length < 10) {
      setOptions([...options, '']);
    }
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleCreate = () => {
    if (!question.trim() || options.some(opt => !opt.trim())) {
      return;
    }

    // Here you would dispatch an action to create the poll
    console.log('Creating poll:', { chatId, question, options, multiple });
    
    onCreate();
  };

  return (
    <GlassCard className="absolute bottom-20 right-4 w-96 z-50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-white">Create Poll</h3>
        <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full">
          <X className="w-5 h-5 text-[#8E9AAF]" />
        </button>
      </div>

      <div className="space-y-3">
        {/* Question */}
        <div>
          <label className="text-sm text-[#8E9AAF] mb-1 block">Question</label>
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="What's your question?"
            className="w-full px-3 py-2 bg-[rgba(26,29,45,0.6)] border border-white/10 rounded-xl text-white placeholder-[#8E9AAF] focus:outline-none focus:border-[#6C5CE7]"
          />
        </div>

        {/* Options */}
        <div>
          <label className="text-sm text-[#8E9AAF] mb-1 block">Options</label>
          <div className="space-y-2">
            {options.map((option, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={option}
                  onChange={(e) => updateOption(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                  className="flex-1 px-3 py-2 bg-[rgba(26,29,45,0.6)] border border-white/10 rounded-xl text-white placeholder-[#8E9AAF] focus:outline-none focus:border-[#6C5CE7]"
                />
                {options.length > 2 && (
                  <button
                    onClick={() => removeOption(index)}
                    className="p-2 hover:bg-red-500/20 rounded-xl transition"
                  >
                    <Trash2 className="w-5 h-5 text-red-400" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <button
            onClick={addOption}
            disabled={options.length >= 10}
            className="mt-2 flex items-center gap-2 text-sm text-[#6C5CE7] hover:text-[#00D9FF] transition disabled:opacity-50"
          >
            <Plus className="w-4 h-4" /> Add Option
          </button>
        </div>

        {/* Multiple choice */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="multiple"
            checked={multiple}
            onChange={(e) => setMultiple(e.target.checked)}
            className="w-4 h-4 rounded border-white/10 bg-[rgba(26,29,45,0.6)]"
          />
          <label htmlFor="multiple" className="text-sm text-[#8E9AAF]">
            Allow multiple choices
          </label>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-[rgba(26,29,45,0.6)] text-white rounded-xl hover:bg-white/10 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!question.trim() || options.some(opt => !opt.trim())}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-[#6C5CE7] to-[#00D9FF] text-white rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Create Poll
          </button>
        </div>
      </div>
    </GlassCard>
  );
};

export default PollCreator;
