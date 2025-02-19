'use client';

import { useState, useEffect } from 'react';
import { format, differenceInYears, intervalToDuration, parse } from 'date-fns';
import { useSearchParams } from 'next/navigation';
import html2canvas from 'html2canvas';

const NASA_INFO = {
  url: 'https://ciencia.nasa.gov/sistema-solar/asteroide-2024-yr4/',
  impactProbability: '0.0023%', // 0.0023% probability according to NASA
  description: 'El asteroide 2024 YR4, descubierto por NASA en 2024, tiene un diámetro estimado entre 50-100 metros. Según la escala de Turín, está clasificado en nivel 1, indicando un riesgo muy bajo.',
  moreInfo: 'https://cneos.jpl.nasa.gov/pd/cs/pdc24/'
};

export default function Home() {
  const searchParams = useSearchParams();
  const [birthDate, setBirthDate] = useState('');
  const impactDate = new Date('2032-12-22');
  const [showCard, setShowCard] = useState(false);
  const [timeUntilImpact, setTimeUntilImpact] = useState(null);
  const [ageBreakdown, setAgeBreakdown] = useState(null);
  const [showCopiedMessage, setShowCopiedMessage] = useState(false);

  useEffect(() => {
    // Handle shared birth date from URL
    const sharedDate = searchParams.get('date');
    if (sharedDate) {
      try {
        const parsedDate = parse(sharedDate, 'dd-MM-yyyy', new Date());
        setBirthDate(format(parsedDate, 'yyyy-MM-dd'));
        setShowCard(true);
      } catch (err) {
        console.error('Invalid date format in URL');
      }
    }

    // Set up countdown timer
    const timer = setInterval(() => {
      setTimeUntilImpact(
        intervalToDuration({
          start: new Date(),
          end: impactDate
        })
      );
    }, 1000);

    return () => clearInterval(timer);
  }, [searchParams]);

  useEffect(() => {
    if (birthDate) {
      setAgeBreakdown(
        intervalToDuration({
          start: new Date(birthDate),
          end: impactDate
        })
      );
    }
  }, [birthDate]);

  const calculateAge = (birth) => {
    if (!birth) return null;
    return differenceInYears(impactDate, new Date(birth));
  };

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';

  const generateShareableLink = () => {
    if (!birthDate) return '';
    const formattedDate = format(new Date(birthDate), 'dd-MM-yyyy');
    return `${baseUrl}/?date=${formattedDate}`;
  };

  const handleShare = () => {
    const age = calculateAge(birthDate);
    const shareUrl = generateShareableLink();
    const shareText = `Tendré ${age} años al momento del impacto: ${shareUrl}`;

    try {
      navigator.clipboard.writeText(shareText)
        .then(() => {
          setShowCopiedMessage(true);
          setTimeout(() => setShowCopiedMessage(false), 3000);
        })
        .catch(err => console.error('Error al copiar:', err));
    } catch (error) {
      console.error(error)
    }
  };

  const captureAndShare = async () => {
    const ageCard = document.getElementById('age-card');
    if (!ageCard) return;

    try {
      const canvas = await html2canvas(ageCard);
      const image = canvas.toDataURL('image/png');

      if (navigator.share) {
        const shareData = {
          title: 'Mi edad durante el impacto del asteroide',
          text: `Tendré ${calculateAge(birthDate)} años cuando el asteroide 2024 YR4 se acerque a la Tierra`,
          url: generateShareableLink(),
        };

        try {
          const blob = await (await fetch(image)).blob();
          shareData.files = [new File([blob], 'age.png', { type: 'image/png' })];
        } catch (err) {
          console.warn('Could not attach image to share', err);
        }

        await navigator.share(shareData);
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#000080] to-[#000040] text-white p-4">
      <div className="max-w-6xl mx-auto pt-10">
        <div className="bg-black/40 rounded-2xl p-4 md:p-8 backdrop-blur-sm border border-blue-500 shadow-lg shadow-blue-500/50">
          <h1 className="text-3xl md:text-5xl font-bold mb-6 text-center text-yellow-300 tracking-wider">
            Asteroide 2024 YR4 - Cuenta Regresiva
          </h1>

          <div className="flex flex-col items-center space-y-8">
            <div className="w-full max-w-md">
              <img
                src="https://assets.science.nasa.gov/content/dam/science/psd/planetary-defense/2024yr4_discovery_atlas.gif?w=650&h=500&fit=clip&crop=faces%2Cfocalpoint"
                alt="Ilustración del asteroide"
                className="w-full rounded-lg opacity-90 border-2 border-blue-400"
              />
              <p className="mt-4 text-center text-yellow-200">
                Probabilidad de impacto: {NASA_INFO.impactProbability}
              </p>
              <p className="mt-2 text-sm text-blue-300 text-center">
                {NASA_INFO.description}
              </p>
            </div>

            {timeUntilImpact && (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2 md:gap-4 w-full max-w-3xl bg-black/60 p-4 md:p-6 rounded-xl border border-yellow-500">
                <div className="flex flex-col items-center p-2 md:p-4 bg-blue-900/50 rounded-lg">
                  <span className="text-2xl md:text-4xl font-mono text-yellow-300">{timeUntilImpact.years}</span>
                  <span className="text-xs md:text-sm">AÑOS</span>
                </div>
                <div className="flex flex-col items-center p-2 md:p-4 bg-blue-900/50 rounded-lg">
                  <span className="text-2xl md:text-4xl font-mono text-yellow-300">{timeUntilImpact.months}</span>
                  <span className="text-xs md:text-sm">MESES</span>
                </div>
                <div className="flex flex-col items-center p-2 md:p-4 bg-blue-900/50 rounded-lg">
                  <span className="text-2xl md:text-4xl font-mono text-yellow-300">{timeUntilImpact.days}</span>
                  <span className="text-xs md:text-sm">DÍAS</span>
                </div>
                <div className="flex flex-col items-center p-2 md:p-4 bg-blue-900/50 rounded-lg">
                  <span className="text-2xl md:text-4xl font-mono text-yellow-300">{timeUntilImpact.hours}</span>
                  <span className="text-xs md:text-sm">HORAS</span>
                </div>
                <div className="flex flex-col items-center p-2 md:p-4 bg-blue-900/50 rounded-lg col-span-2 md:col-span-1">
                  <span className="text-2xl md:text-4xl font-mono text-yellow-300">{timeUntilImpact.minutes}</span>
                  <span className="text-xs md:text-sm">MINUTOS</span>
                </div>
              </div>
            )}

            <div className="text-center space-y-4 w-full">
              <h2 className="text-xl md:text-2xl font-semibold text-blue-300">
                Fecha de Impacto Potencial: {format(impactDate, 'dd MMMM, yyyy')}
              </h2>

              <div className="flex flex-col md:flex-row gap-4 md:gap-8 mt-8">
                <div className="flex-1 bg-black/60 p-4 md:p-6 rounded-xl border border-blue-500">
                  <div className="flex flex-col items-center space-y-4">
                    <label className="text-lg text-blue-300">
                      Ingresa tu fecha de nacimiento:
                    </label>
                    <input
                      type="date"
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                      className="w-full md:w-auto px-4 py-2 rounded-lg bg-blue-900/50 text-white border border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => setShowCard(true)}
                      className="w-full md:w-auto px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors text-white font-semibold"
                    >
                      Calcular
                    </button>
                    {showCard && (
                      <div id="age-card" className="w-full bg-black/60 p-4 md:p-6 rounded-xl border border-yellow-500">
                        <div className="flex flex-col items-center justify-center space-y-4">
                          <p className="text-lg md:text-xl text-blue-300 mb-4">Tendrás</p>
                          <span className="text-4xl md:text-6xl font-bold text-yellow-300 mb-2">
                            {calculateAge(birthDate)}
                          </span>
                          <p className="text-lg md:text-xl text-blue-300 mb-4">
                            años en el momento del impacto
                          </p>
                          {ageBreakdown && (
                            <div className="grid grid-cols-3 gap-2 md:gap-3 w-full">
                              <div className="flex flex-col items-center p-2 md:p-3 bg-blue-900/50 rounded-lg">
                                <span className="text-xl md:text-2xl font-mono text-yellow-300">{ageBreakdown.years}</span>
                                <span className="text-xs">AÑOS</span>
                              </div>
                              <div className="flex flex-col items-center p-2 md:p-3 bg-blue-900/50 rounded-lg">
                                <span className="text-xl md:text-2xl font-mono text-yellow-300">{ageBreakdown.months}</span>
                                <span className="text-xs">MESES</span>
                              </div>
                              <div className="flex flex-col items-center p-2 md:p-3 bg-blue-900/50 rounded-lg">
                                <span className="text-xl md:text-2xl font-mono text-yellow-300">{ageBreakdown.days}</span>
                                <span className="text-xs">DÍAS</span>
                              </div>
                            </div>
                          )}
                          <button
                            onClick={handleShare}
                            className="w-full md:w-auto mt-4 px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg text-white"
                          >
                            Compartir mi edad
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-center space-y-4">

                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-2 md:gap-4 mt-8 justify-center">
                <button
                  onClick={handleShare}
                  className=" px-6 py-3 bg-blue-700 hover:bg-blue-600 rounded-lg transition-colors border border-blue-400"
                >
                  Compartir
                </button>
                <a
                  href={NASA_INFO.moreInfo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-blue-900 hover:bg-blue-800 rounded-lg transition-colors border border-blue-400 text-center"
                >
                  Más detalles en el sitio de la Nasa
                </a>

                <a href="https://www.buymeacoffee.com/andiazo" target='_blank' className='px-2 py-2 bg-blue-900 hover:bg-blue-800  font-bold rounded-lg text-center'>
                  😃Buy me a coffee
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      {showCopiedMessage && (
        <div className="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg">
          Texto copiado al portapapeles
        </div>
      )}
    </main>
  );
}
