
import React, { useState } from 'react';
import { useGeolocation } from '../hooks/useGeolocation';
import { searchWithMaps } from '../services/geminiService';
import type { GroundingChunk } from '../types';
import Spinner from './Spinner';

const MapPinIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.1.42-.25.692-.455.272-.204.603-.478.98-.796.377-.318.802-.68 1.252-1.071.45-.39 1.002-1.046 1.002-1.046s.454-1.01.454-2.221c0-1.21-.455-2.222-.455-2.222s-.454-.92-.818-1.58a5.5 5.5 0 00-1.222-1.616A5.5 5.5 0 0010 3.001a5.5 5.5 0 00-4.045 1.625A5.5 5.5 0 004.73 6.22c-.363.66-.818 1.58-.818 1.58s-.455 1.011-.455 2.222c0 1.21.455 2.221.455 2.221s.552.655 1.002 1.046c.45.39.875.753 1.252 1.071.377.318.708.592.98.796.272.206.506.355.692.455.09.052.185.103.281.14l.018.008.006.003zM10 8a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
  </svg>
);

const LocalSearch: React.FC = () => {
  const { location, error: geoError, isLoading: geoLoading } = useGeolocation();
  const [query, setQuery] = useState('What are some good cafes nearby with outdoor seating?');
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [sources, setSources] = useState<GroundingChunk[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) {
      setError("Please enter a search query.");
      return;
    }
    if (!location) {
      setError("Could not determine your location. Please ensure location services are enabled.");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setResponse(null);
    setSources([]);

    try {
      const result = await searchWithMaps(query, location);
      setResponse(result.text);
      setSources(result.sources as GroundingChunk[]);
    } catch (err: any) {
      setError(err.message || "An error occurred while searching.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-white">Local Search with Maps</h2>
      {geoLoading && <p className="text-gray-400">Fetching your location...</p>}
      {geoError && <p className="text-red-400">{geoError}</p>}
      {location && (
        <p className="text-sm text-green-400 mb-4">
          Location acquired: Lat {location.latitude.toFixed(4)}, Lng {location.longitude.toFixed(4)}
        </p>
      )}

      <div className="space-y-4">
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          rows={3}
          className="w-full bg-gray-700 border-gray-600 rounded-md p-2 text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
          placeholder="e.g., Show me nearby parks with playgrounds"
        />
        <button
          onClick={handleSearch}
          disabled={isLoading || geoLoading || !location}
          className="w-full bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-indigo-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors text-lg flex items-center justify-center gap-2"
        >
          {isLoading ? <Spinner /> : <MapPinIcon className="w-5 h-5" />}
          {isLoading ? 'Searching...' : 'Search Nearby'}
        </button>
      </div>

      {error && <p className="text-red-400 mt-4">{error}</p>}
      
      {response && (
        <div className="mt-6">
          <h3 className="text-xl font-bold mb-2 text-white">Results</h3>
          <div className="bg-gray-900/50 p-4 rounded-lg">
            <p className="text-gray-300 whitespace-pre-wrap">{response}</p>
          </div>
        </div>
      )}
      
      {sources.length > 0 && (
          <div className="mt-6">
              <h3 className="text-xl font-bold mb-2 text-white">Sources from Google Maps</h3>
              <ul className="space-y-2">
                  {sources.map((source, index) => (
                      <li key={index} className="bg-gray-700 p-3 rounded-lg hover:bg-gray-600 transition-colors">
                          <a href={source.maps.uri} target="_blank" rel="noopener noreferrer" className="text-indigo-400 font-medium hover:underline">
                              {source.maps.title}
                          </a>
                          {source.maps.placeAnswerSources?.reviewSnippets?.map((review, rIndex) => (
                             <div key={rIndex} className="mt-2 pl-4 border-l-2 border-gray-600">
                                <a href={review.uri} target="_blank" rel="noopener noreferrer" className="text-sm text-cyan-400 hover:underline">
                                    {review.title}
                                </a>
                                <p className="text-sm text-gray-400 italic">"{review.snippet}"</p>
                            </div>
                          ))}
                      </li>
                  ))}
              </ul>
          </div>
      )}
    </div>
  );
};

export default LocalSearch;
