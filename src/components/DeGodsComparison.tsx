import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';

interface ComparisonData {
  value: number;
  comparison: string;
  category: string;
  imageLink: string;
}

const DeGodsComparison: React.FC = () => {
  const [marketCap, setMarketCap] = useState<number>(0);
  const [formattedMarketCap, setFormattedMarketCap] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');
  const [comparisonData, setComparisonData] = useState<ComparisonData[]>([]);
  const [currentComparison, setCurrentComparison] = useState<ComparisonData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch market cap
        const mcapResponse = await fetch('https://api.oauth.dustlabs.com/pricing/marketcap');
        const mcapData = await mcapResponse.json();
        console.log('Market cap data:', mcapData); // Debug: Log market cap data

        if (mcapData.success) {
          const mcap = mcapData.mcap;
          setMarketCap(mcap);
          setFormattedMarketCap((mcap / 1000000).toFixed(0) + 'M');
          console.log('Formatted market cap:', (mcap / 1000000).toFixed(0) + 'M'); // Debug: Log formatted market cap
        }

        // Fetch CSV data
        const csvResponse = await fetch('/mcap_data.csv');
        const csvText = await csvResponse.text();
        console.log('CSV text:', csvText); // Debug: Log raw CSV text

        Papa.parse(csvText, {
          complete: (results) => {
            console.log('Parsed CSV data:', results.data); // Debug: Log parsed CSV data
            const parsedData: ComparisonData[] = results.data.map((row: any) => ({
              value: parseFloat(row.value.replace(/,/g, '')),
              comparison: row.comparison,
              category: row.catagory, // Note: Fix typo in CSV header if possible
              imageLink: row['image link'],
            })).sort((a, b) => a.value - b.value);
            console.log('Processed comparison data:', parsedData); // Debug: Log processed comparison data
            setComparisonData(parsedData);
          },
          header: true,
        });

        // Set current date
        const date = new Date();
        const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
        const formattedDate = date.toLocaleDateString('en-US', options);
        console.log('Current date:', formattedDate); // Debug: Log formatted date
        setCurrentDate(formattedDate);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (comparisonData.length > 0 && marketCap > 0) {
      const currentIndex = comparisonData.findIndex(item => item.value > marketCap);
      setCurrentComparison(comparisonData[currentIndex - 1] || comparisonData[comparisonData.length - 1]);
    }
  }, [comparisonData, marketCap]);

  const getComparisonImages = () => {
    if (!currentComparison) return [];
    const currentIndex = comparisonData.findIndex(item => item.value === currentComparison.value);
    return comparisonData.slice(Math.max(0, currentIndex - 2), currentIndex + 3);
  };

  if (!currentComparison) return null;

  return (
    <div className="w-full min-h-screen bg-white p-4 md:p-8 flex flex-col justify-between">
      {/* Mobile Version */}
      <div className="md:hidden flex-grow flex flex-col justify-center">
        <h2 className="font-figtree font-bold text-[26px] leading-[28px] mb-2 text-center">
          On <span className="text-[#1E30D8]">{currentDate},</span>
        </h2>
        <h3 className="font-figtree font-bold text-[26px] leading-[28px] mb-2 text-center">
          <span className="underline">DeGods</span> market cap is <span className="text-[#1E30D8]">${formattedMarketCap}</span>
        </h3>
        <p className="font-figtree font-bold mb-8 text-center text-[26px] leading-[28px]">
          or the {currentComparison.category} of...
        </p>
        <div className="flex flex-col items-center">
          <img src={currentComparison.imageLink} alt={currentComparison.comparison} className="w-32 h-32 mb-2" />
          <h4 className="font-figtree font-bold text-[26px] text-center mb-1">{currentComparison.comparison}</h4>
          <p className="font-figtree font-bold text-[#1E30D8] text-[16px] text-center">${currentComparison.value.toLocaleString()} USD</p>
        </div>
        <div className="flex justify-center mt-4 space-x-2">
          {getComparisonImages().map((item, index) => (
            <img 
              key={index}
              src={item.imageLink} 
              alt={item.comparison} 
              className={`w-12 h-12 ${item.value !== currentComparison.value ? 'filter grayscale' : 'border-2 border-[#1E30D8]'}`}
            />
          ))}
        </div>
      </div>

      {/* Desktop Version */}
      <div className="hidden md:flex flex-grow flex-col justify-center items-center relative">
        <div className="text-center mb-12">
          <h2 className="font-figtree font-bold text-[40px] leading-[30px] mb-4">
            On <span className="text-[#1E30D8]">{currentDate},</span>
          </h2>
          <h3 className="font-figtree font-bold text-[40px] leading-[30px] mb-4">
            <span className="underline">DeGods</span> market cap is <span className="text-[#1E30D8]">${formattedMarketCap}</span>
          </h3>
          <p className="font-figtree font-bold text-[40px] leading-[30px]">
            or the {currentComparison.category} of...
          </p>
        </div>
        <div className="flex flex-col items-center">
          <img src={currentComparison.imageLink} alt={currentComparison.comparison} className="w-48 h-48 mb-4" />
          <h4 className="font-figtree font-bold text-[40px] text-center mb-1">{currentComparison.comparison}</h4>
          <p className="font-figtree font-bold text-[24px] text-[#1E30D8] text-center">${currentComparison.value.toLocaleString()} USD</p>
        </div>
        <div className="absolute right-8 top-1/2 transform -translate-y-1/2 space-y-4">
          {getComparisonImages().map((item, index) => (
            <img 
              key={index}
              src={item.imageLink} 
              alt={item.comparison} 
              className={`w-16 h-16 ${item.value !== currentComparison.value ? 'filter grayscale' : 'border-2 border-[#1E30D8]'}`}
            />
          ))}
        </div>
      </div>

      {/* Attribution */}
      <p className="text-center text-gray-500 mt-18 text-[18px] font-bold">
        Created by{' '}
        <a href="https://twitter.com/0x_saddy" target="_blank" rel="noopener noreferrer" className="underline">@0x_saddy</a>,{' '}
        <a href="https://twitter.com/capsjpeg" target="_blank" rel="noopener noreferrer" className="underline">@capsjpeg</a>,{' '}
        <a href="https://twitter.com/misterholana" target="_blank" rel="noopener noreferrer" className="underline">@misterholana</a>.
      </p>
    </div>
  );
};

export default DeGodsComparison;