import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface GifPickerProps {
  onSelect: (gifUrl: string) => void;
  onClose: () => void;
}

const GifPicker: React.FC<GifPickerProps> = ({ onSelect, onClose }) => {
  const [search, setSearch] = useState('');
  const [gifs, setGifs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchGifs = async (query: string = 'trending') => {
    setLoading(true);
    try {
      const res = await axios.get(`https://api.tenor.com/v1/search?q=${query}&key=${import.meta.env.VITE_TENOR_API_KEY}&limit=20`);
      setGifs(res.data.results || []);
    } catch (error) {
      console.error('GIF fetch error', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGifs();
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (search) fetchGifs(search);
      else fetchGifs();
    }, 500);
    return () => clearTimeout(timeout);
  }, [search]);

  return (
    <div className="absolute bottom-20 left-4 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-2 w-80 z-50">
      <div className="flex gap-2 mb-2">
        <input
          type="text"
          placeholder="Search GIFs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-2 py-1 border rounded dark:bg-gray-700 dark:border-gray-600"
        />
        <button onClick={onClose} className="px-2 py-1 text-red-500">Close</button>
      </div>
      {loading ? (
        <div className="text-center p-4">Loading...</div>
      ) : (
        <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
          {gifs.map(gif => (
            <button
              key={gif.id}
              onClick={() => onSelect(gif.media[0].gif.url)}
              className="hover:opacity-80 transition"
            >
              <img src={gif.media[0].gif.url} alt="" className="w-full rounded" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default GifPicker;
